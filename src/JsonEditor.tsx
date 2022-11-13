import React from 'react';
import { JSONValue, JSONPath } from './state';
import { Accordion } from './Accordion';
import './JsonEditor.css';

export type JsonEditorProps = {
  prepend: string;
  editContent: JSONValue;
  path: JSONPath;
};
export function JsonEditor(props: JsonEditorProps): React.ReactElement | null {
  const { prepend, editContent, path } = props;
  if (typeof editContent === "string") {
    return <input type="text" value={editContent} />;
  } else if (typeof editContent === "number") {
    
  } else if (typeof editContent === "boolean") {
    
  } else if (editContent === null) {
    
  } else if (Array.isArray(editContent)) {
    return <>[...]</>;
  } else {
    return (
      <Accordion
        head={`${prepend}{`}
      >
        {
          Object.entries(editContent).map(([key, value]) => (
            <div
              key={key}
              className="json-indent"
            >
              <JsonEditor
                prepend={`${JSON.stringify(key)}: `}
                editContent={value}
                path={[...path, key]}
              />
            </div>
          ))
        }
      </Accordion>
    );
  }
  return <>{prepend}</>;
}
