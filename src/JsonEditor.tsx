import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { JSONValue, JSONPath, Action, edit } from './state';
import { Accordion } from './Accordion';
import './JsonEditor.css';

export type JsonEditorProps = {
  dispatch: React.Dispatch<Action>;
  editContent: JSONValue;
  path: JSONPath;
  prepend: string;
  append: string;
};
export function JsonEditor(props: JsonEditorProps): React.ReactElement | null {
  const { dispatch, editContent, path, prepend, append } = props;
  const [editingText, setEditingText] = useState<string | null>(null);

  if (editingText != null) {
    let newValue: JSONValue | undefined = undefined;
    try {
      newValue = JSON.parse(editingText);
    } catch {}
    const hasError = newValue === undefined;
    return (
      <div className="editor-line">
        {prepend}
        <input
          className={hasError ? "json-text-editor json-text-error" : "json-text-editor"}
          type="text"
          value={editingText}
          onInput={(e) => setEditingText(e.currentTarget.value)}
          onChange={(e) => setEditingText(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newValue !== undefined) {
              setEditingText(null);
              dispatch(edit(path, newValue))
            }
          }}
        />
        {append}
        <button className="editor-tool">
          <FontAwesomeIcon icon={solid("pencil")} />
        </button>
      </div>
    );
  } else if (Array.isArray(editContent)) {
    return (
      <Accordion
        head={`${prepend}[`}
      >
        {
          editContent.map((value: JSONValue, i, list) => (
            <div
              key={i}
              className="json-indent"
            >
              <JsonEditor
                dispatch={dispatch}
                editContent={value}
                path={[...path, i]}
                prepend={`${JSON.stringify(i)}: `}
                append={i + 1 === list.length ? "" : ","}
              />
            </div>
          ))
        }
        ]
        {append}
      </Accordion>
    );
  } else if (isObject(editContent)) {
    return (
      <Accordion
        head={`${prepend}{`}
      >
        {
          Object.entries(editContent).map(([key, value], i, list) => (
            <div
              key={key}
              className="json-indent"
            >
              <JsonEditor
                dispatch={dispatch}
                editContent={value}
                path={[...path, key]}
                prepend={`${JSON.stringify(key)}: `}
                append={i + 1 === list.length ? "" : ","}
              />
            </div>
          ))
        }
        {"}"}
        {append}
      </Accordion>
    );
  } else {
    return (
      <div className="editor-line">
        {prepend}{JSON.stringify(editContent)}{append}
        <button
          className="editor-tool"
          onClick={() => setEditingText(JSON.stringify(editContent))}
        >
          <FontAwesomeIcon icon={solid("pencil")} />
        </button>
      </div>
    );
  }
}

function isObject(x: unknown): x is object {
  return (typeof x === "object" || typeof x === "function") && x !== null;
}
