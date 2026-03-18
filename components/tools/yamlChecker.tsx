'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import AceEditor, { IMarker } from 'react-ace'
import 'ace-builds/src-noconflict/mode-yaml'
import 'ace-builds/src-noconflict/theme-twilight'
import 'ace-builds/src-noconflict/theme-chrome'
import jsYaml from 'js-yaml'
import { CheckCircle, XCircle, Trash2, Upload } from 'lucide-react'

export default function YAMLValidator() {
  const [yaml, setYaml] = useState('')
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    result?: string
    error?: string
  } | null>(null)
  const [errorLine, setErrorLine] = useState<number | null>(null)
  const [isDark, setIsDark] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const editorRef = useRef<AceEditor>(null)

  useEffect(() => {
    const root = document.documentElement
    setIsDark(root.classList.contains('dark'))
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'))
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const validateYAML = useCallback((yamlContent: string) => {
    try {
      const result = jsYaml.load(yamlContent)
      setErrorLine(null)
      return { valid: true, result: JSON.stringify(result, null, 2) }
    } catch (error: unknown) {
      const yamlError = error as { reason?: string; mark?: { line?: number } }
      const line = yamlError.mark?.line
      setErrorLine(line ?? null)
      const errorMessage =
        yamlError.reason === 'bad indentation of a mapping entry'
          ? `Incorrect indentation at line ${(line ?? 0) + 1}. Each entry in YAML should be properly indented.`
          : `${yamlError.reason} at line ${(line ?? 0) + 1}`
      return { valid: false, error: errorMessage }
    }
  }, [])

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setYaml(reader.result as string)
    reader.readAsText(file)
  }

  useEffect(() => {
    if (yaml.trim() === '') {
      setValidationResult(null)
      setErrorLine(null)
    } else {
      setValidationResult(validateYAML(yaml))
    }
  }, [yaml, validateYAML])

  const errorMarkers: IMarker[] =
    errorLine === null
      ? []
      : [
          {
            startRow: errorLine,
            endRow: errorLine,
            startCol: 0,
            endCol: Number.MAX_VALUE,
            type: 'text',
            className: 'ace-error-marker',
          },
        ]

  return (
    <div className="space-y-4">
      <div
        onDrop={handleFileDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`relative overflow-hidden rounded-lg border transition-colors ${
          isDragging ? 'border-fd-primary bg-fd-primary/5' : 'border-fd-border'
        }`}
      >
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-fd-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-fd-primary">
              <Upload className="size-5" aria-hidden="true" />
              Drop YAML file here
            </div>
          </div>
        )}
        <AceEditor
          mode="yaml"
          theme={isDark ? 'twilight' : 'chrome'}
          onChange={setYaml}
          value={yaml}
          name="YAML_EDITOR"
          editorProps={{ $blockScrolling: true }}
          setOptions={{
            showLineNumbers: true,
            highlightActiveLine: false,
            showPrintMargin: false,
            tabSize: 2,
            fontSize: 14,
          }}
          markers={errorMarkers}
          width="100%"
          height="500px"
          placeholder="Paste your librechat.yaml content here, or drag & drop a file..."
          ref={editorRef}
        />
      </div>

      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1" role="status" aria-live="polite">
          {validationResult === null ? (
            <p className="rounded-lg border border-dashed border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
              Validation results will appear here once you paste or drop YAML content.
            </p>
          ) : validationResult.valid ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="size-4 shrink-0" aria-hidden="true" />
              YAML is valid!
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{validationResult.error}</span>
            </div>
          )}
        </div>

        {yaml.trim() !== '' && (
          <button
            onClick={() => setYaml('')}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-fd-border px-3 py-2.5 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
            aria-label="Clear editor"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      <style>{`
        .ace-error-marker {
          position: absolute;
          background-color: rgba(255, 0, 0, 0.3);
          z-index: 20;
        }
      `}</style>
    </div>
  )
}
