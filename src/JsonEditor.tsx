import React from 'react';
import { JSONValue, JSONPath } from './state';
import { Accordion } from './Accordion';
import './JsonEditor.css';

export type JsonEditorProps = {
  editContent: JSONValue;
  path: JSONPath;
  prepend: string;
  append: string;
};
export function JsonEditor(props: JsonEditorProps): React.ReactElement | null {
  const { editContent, path, prepend, append } = props;
  if (typeof editContent === "string") {
    return (
      <>{prepend}{JSON.stringify(editContent)}{append}</>
    );
  } else if (typeof editContent === "number") {
    return <>{prepend}{editContent}{append}</>
  } else if (typeof editContent === "boolean") {
    return <>{prepend}{`${editContent}`}{append}</>
  } else if (editContent === null) {
    return <>{prepend}null{append}</>
  } else if (Array.isArray(editContent)) {
    return <>{prepend}[...]{append}</>;
  } else {
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
  }
  return <>{prepend}</>;
}
