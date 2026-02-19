/**
 * Minimal MDX provider for components/ directory MDX files.
 * Provides component mapping without depending on Nextra.
 */
import type { ComponentType } from 'react'

export function useMDXComponents(components: Record<string, ComponentType<any>> = {}) {
  return components
}
