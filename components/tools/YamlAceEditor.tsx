'use client'

import AceEditor, { type IMarker } from 'react-ace'
import 'ace-builds/src-noconflict/mode-yaml'
import 'ace-builds/src-noconflict/theme-twilight'
import 'ace-builds/src-noconflict/theme-chrome'

type YamlAceEditorProps = {
  value: string
  theme: string
  markers: IMarker[]
  onChange: (value: string) => void
  placeholder?: string
}

export default function YamlAceEditor({
  value,
  theme,
  markers,
  onChange,
  placeholder,
}: YamlAceEditorProps) {
  return (
    <AceEditor
      mode="yaml"
      theme={theme}
      onChange={onChange}
      value={value}
      name="YAML_EDITOR"
      editorProps={{ $blockScrolling: true }}
      setOptions={{
        showLineNumbers: true,
        highlightActiveLine: false,
        showPrintMargin: false,
        tabSize: 2,
        fontSize: 14,
      }}
      markers={markers}
      width="100%"
      height="500px"
      placeholder={placeholder}
    />
  )
}
