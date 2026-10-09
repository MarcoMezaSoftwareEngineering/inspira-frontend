// El editor de HTML de las plantillas de correo (CodeMirror), aparte para
// que se descargue solo al abrir el editor. CodeMirror y lezer pesan más de
// 500 KB y hasta el 09/10/2026 viajaban con todo Core. Es el mismo editor y
// la misma configuración que tenía EmailTemplates.
import CodeMirror from "@uiw/react-codemirror";
import { html as htmlLang } from "@codemirror/lang-html";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

const BASICO = {
  lineNumbers: true,
  highlightActiveLineGutter: true,
  foldGutter: true,
  drawSelection: true,
  indentOnInput: true,
  syntaxHighlighting: true,
  bracketMatching: true,
  closeBrackets: true,
  autocompletion: true,
  highlightActiveLine: true,
  highlightSelectionMatches: true,
  tabSize: 2,
};

export default function EditorHtml({ value, onChange, onCreateEditor }) {
  return (
    <CodeMirror
      value={value}
      height="100%"
      style={{ height: "100%", fontSize: "13px" }}
      theme={vscodeDark}
      extensions={[htmlLang()]}
      onChange={onChange}
      onCreateEditor={onCreateEditor}
      basicSetup={BASICO}
    />
  );
}
