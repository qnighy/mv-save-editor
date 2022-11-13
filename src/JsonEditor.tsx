import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { JSONValue, JSONPath, Action, edit } from './state';
import { useAccordion } from './useAccordion';
import './JsonEditor.css';
import { DivFix } from './DivFix';

export type JsonEditorProps = {
  dispatch: React.Dispatch<Action>;
  editContent: JSONValue;
  path1: JSONPath;
  path2: number | string;
  prepend: string;
  append: string;
};
export const JsonEditor = React.memo(JsonEditorWorker);
export function JsonEditorWorker(props: JsonEditorProps): React.ReactElement | null {
  const { dispatch, editContent, path1, path2, prepend, append } = props;
  const path = useMemo(() => [...path1, path2], [path1, path2]);
  const [editingText, setEditingText] = useState<string | null>(null);
  const { expanded, expanderProps, regionProps } = useAccordion();
  const startEditing = () => setEditingText(JSON.stringify(editContent));
  if (editingText != null) {
    let newValue: JSONValue | undefined = undefined;
    try {
      newValue = JSON.parse(editingText);
    } catch {}
    const hasError = newValue === undefined;
    const applyChange = () => {
      if (newValue !== undefined) {
        setEditingText(null);
        dispatch(edit(path, newValue))
      }
    };
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
            if (e.key === "Enter") {
              applyChange();
            }
          }}
        />
        {append}
        <button
          className="editor-tool"
          onClick={applyChange}
          disabled={hasError}
        >
          <FontAwesomeIcon
            title="Apply change"
            icon={solid("check")}
          />
        </button>
        <button
          onClick={() => {
            setEditingText(null);
          }}
        >
          <FontAwesomeIcon
            title="Discard change"
            icon={solid("times")}
          />
        </button>
      </div>
    );
  } else if (Array.isArray(editContent)) {
    return (
      <div>
        <div className="editor-line">
          <button className="accordion-expander" {...expanderProps}>
            <FontAwesomeIcon icon={expanded ? solid("chevron-down") : solid("chevron-right")} />
            {prepend}{"["}
          </button>
          <button
            className="editor-tool"
            onClick={startEditing}
          >
            <FontAwesomeIcon
              title="Edit this property"
              icon={solid("pencil")}
            />
          </button>
        </div>
        <DivFix {...regionProps}>
          {
            editContent.map((value: JSONValue, i, list) => (
              <div
                key={i}
                className="json-indent"
              >
                <JsonEditor
                  dispatch={dispatch}
                  editContent={value}
                  path1={path}
                  path2={i}
                  prepend={`${JSON.stringify(i)}: `}
                  append={i + 1 === list.length ? "" : ","}
                />
              </div>
            ))
          }
          ]
          {append}
        </DivFix>
      </div>
    );
  } else if (isObject(editContent)) {
    return (
      <div>
        <div className="editor-line">
          <button className="accordion-expander" {...expanderProps}>
            <FontAwesomeIcon icon={expanded ? solid("chevron-down") : solid("chevron-right")} />
            {prepend}{"{"}
          </button>
          <button
            className="editor-tool"
            onClick={startEditing}
          >
            <FontAwesomeIcon
              title="Edit this property"
              icon={solid("pencil")}
            />
          </button>
        </div>
        <DivFix {...regionProps}>
          {
            Object.entries(editContent).map(([key, value], i, list) => (
              <div
                key={key}
                className="json-indent"
              >
                <JsonEditor
                  dispatch={dispatch}
                  editContent={value}
                  path1={path}
                  path2={key}
                  prepend={`${JSON.stringify(key)}: `}
                  append={i + 1 === list.length ? "" : ","}
                />
              </div>
            ))
          }
          {"}"}
          {append}
        </DivFix>
      </div>
    );
  } else {
    return (
      <div className="editor-line">
        <span
          onDoubleClick={startEditing}
        >
          {`${prepend}${JSON.stringify(editContent)}${append}`}
        </span>
        <button
          className="editor-tool"
          onClick={startEditing}
        >
          <FontAwesomeIcon
            title="Edit this property"
            icon={solid("pencil")}
          />
        </button>
      </div>
    );
  }
}

function isObject(x: unknown): x is object {
  return (typeof x === "object" || typeof x === "function") && x !== null;
}
