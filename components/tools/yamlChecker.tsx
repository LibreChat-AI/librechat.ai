import React, { useState, useEffect, useRef } from 'react'
import AceEditor, { IMarker } from 'react-ace'
import 'ace-builds/src-noconflict/mode-yaml'
import 'ace-builds/src-noconflict/theme-twilight'
import jsYaml from 'js-yaml'

function YAMLChecker() {
  const [yaml, setYaml] = useState('')
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    result?: string
    error?: string
  } | null>(null)
  const [errorLine, setErrorLine] = useState<number | null>(null)
  const editorRef = useRef<any>(null)

  const validateYAML = (yamlContent: string) => {
    try {
      const result = jsYaml.load(yamlContent)
      setErrorLine(null) // No error
      return { valid: true, result: JSON.stringify(result, null, 2) }
    } catch (error) {
      let errorMessage = ''
      const line = error.mark?.line
      setErrorLine(line)
      if (error.reason === 'bad indentation of a mapping entry') {
        errorMessage = ` Incorrect indentation at line ${line + 1}. Each entry in YAML should be properly indented.`
      } else {
        errorMessage = ` ${error.reason} at line ${line + 1}`
      }
      return { valid: false, error: errorMessage }
    }
  }

  const handleYamlChange = (newYaml: string) => {
    setYaml(newYaml)
  }

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    const reader = new FileReader()
    reader.onload = () => {
      const fileContent = reader.result as string
      setYaml(fileContent)
    }
    reader.readAsText(file)
  }

  useEffect(() => {
    if (yaml.trim() === '') {
      setValidationResult(null) // Clear validation result if YAML is empty
    } else {
      const result = validateYAML(yaml)
      setValidationResult(result)
    }
  }, [yaml]) // Trigger validation whenever `yaml` changes

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
            className: 'error-marker', // Use className instead of style
          },
        ]

  const textAreaStyle = {
    width: '100%',
    minHeight: '50px',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '1rem',
    backgroundColor: validationResult
      ? validationResult.valid
        ? 'rgba(0,255,0,0.2)' // Green background for valid YAML
        : 'rgba(255,0,0,0.2)' // Red background for invalid YAML
      : 'transparent', // Transparent background by default
  }

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'left', fontSize: '1.5rem', margin: '10px 0' }}>
        YAML Validator (beta)
      </h2>
      <div
        onDrop={handleFileDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{ width: '100%', marginBottom: '10px' }}
      >
        <AceEditor
          mode="yaml"
          theme="twilight"
          onChange={handleYamlChange}
          value={yaml}
          name="YAML_EDITOR"
          editorProps={{ $blockScrolling: true }}
          setOptions={{
            showLineNumbers: true,
            highlightActiveLine: false,
          }}
          markers={errorMarkers}
          style={{ width: '100%' }}
          placeholder="Paste the content of the YAML file here or drop a file here..."
          ref={editorRef}
        />
      </div>
      <textarea
        readOnly
        style={textAreaStyle}
        placeholder="Validation Result will be displayed here"
        value={
          validationResult
            ? validationResult.valid
              ? 'YAML is valid!'
              : validationResult.error || ''
            : ''
        }
      />
    </div>
  )
}

export default YAMLChecker
