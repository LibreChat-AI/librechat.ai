'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { onCLS, onFCP, onINP, onLCP, onTTFB, type MetricType } from 'web-vitals'

type CoreWebVitalsMonitorProps = {
  endpoint: string
  projectId: string
  sampleRate?: number
}

type NextParams = Record<string, string | string[] | undefined>

const API_PATH = '/api/ingest'
const JSON_TYPE = 'application/json'

function generateSessionId() {
  return (
    (typeof crypto !== 'undefined' && crypto.randomUUID?.()) ||
    `s${Date.now()}${Math.random().toString(16).slice(2)}`
  )
}

function parseSampleRate(value: number | undefined) {
  const rate = typeof value === 'number' ? value : 1
  return Math.max(0, Math.min(1, Number.isFinite(rate) ? rate : 1))
}

function buildIngestUrl(endpoint: string) {
  const trimmedEndpoint = endpoint.trim()
  const endpointUrl = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmedEndpoint)
    ? trimmedEndpoint
    : `https://${trimmedEndpoint}`

  try {
    return new URL(API_PATH, endpointUrl).toString()
  } catch {
    return `${trimmedEndpoint.replace(/\/$/, '')}${API_PATH}`
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function reconstructRoute(pathname: string | null, params: NextParams) {
  const segments = (pathname?.trim() || '/').split('/').filter(Boolean)
  if (segments.length === 0) return '/'

  const result: Array<string | null> = [...segments]
  const entries = Object.entries(params ?? {})

  const arrayParams = entries
    .filter(([, value]) => isStringArray(value) && value.length > 0)
    .map(([key, value]) => [key, value as string[]] as const)
    .sort((a, b) => b[1].length - a[1].length)

  for (const [key, value] of arrayParams) {
    const len = value.length
    for (let index = 0; index <= segments.length - len; index += 1) {
      if (result.slice(index, index + len).some((segment) => segment === null)) continue
      if (!value.every((segment, offset) => segments[index + offset] === segment)) continue

      result[index] = `[...${key}]`
      for (let offset = 1; offset < len; offset += 1) result[index + offset] = null
      break
    }
  }

  for (const [key, value] of entries) {
    if (typeof value !== 'string') continue

    for (let index = 0; index < segments.length; index += 1) {
      const current = result[index]
      if (current == null || current.startsWith('[')) continue
      if (segments[index] === value) result[index] = `[${key}]`
    }
  }

  return `/${result.filter(Boolean).join('/')}`
}

function sendPayload(url: string, payload: unknown) {
  const body = JSON.stringify(payload)

  if (navigator.sendBeacon) {
    try {
      if (navigator.sendBeacon(url, new Blob([body], { type: JSON_TYPE }))) return
    } catch {
      // Fall back to fetch below.
    }
  }

  void fetch(url, {
    body,
    headers: { 'Content-Type': JSON_TYPE },
    keepalive: true,
    method: 'POST',
  }).catch(() => undefined)
}

export function CoreWebVitalsMonitor({
  endpoint,
  projectId,
  sampleRate = 1,
}: CoreWebVitalsMonitorProps) {
  const pathname = usePathname()
  const params = useParams() as unknown as NextParams
  const route = useMemo(() => reconstructRoute(pathname, params), [pathname, params])
  const ingestUrl = useMemo(() => buildIngestUrl(endpoint), [endpoint])
  const normalizedSampleRate = useMemo(() => parseSampleRate(sampleRate), [sampleRate])
  const routeRef = useRef(route)
  const pathRef = useRef('/')
  const sampledRef = useRef(false)
  const sessionIdRef = useRef(generateSessionId())

  useEffect(() => {
    const path = window.location.pathname || pathname || '/'
    const sessionId = generateSessionId()

    routeRef.current = route
    pathRef.current = path
    sessionIdRef.current = sessionId
    sampledRef.current = Math.random() < normalizedSampleRate

    sendPayload(ingestUrl, {
      projectId,
      customEvents: [
        {
          name: '$page_view',
          path,
          recordedAt: new Date().toISOString(),
          route,
          sessionId,
        },
      ],
    })
  }, [ingestUrl, normalizedSampleRate, pathname, projectId, route])

  useEffect(() => {
    const report = (metric: MetricType) => {
      if (!sampledRef.current) return

      sendPayload(ingestUrl, {
        projectId,
        events: [
          {
            metric: metric.name,
            path: pathRef.current,
            rating: metric.rating,
            recordedAt: new Date().toISOString(),
            route: routeRef.current,
            sessionId: sessionIdRef.current,
            value: metric.value,
          },
        ],
      })
    }

    onCLS(report)
    onFCP(report)
    onINP(report)
    onLCP(report)
    onTTFB(report)
  }, [ingestUrl, projectId])

  return null
}
