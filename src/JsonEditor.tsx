import React from 'react';
import { JSONValue, JSONPath } from './state';

export type JsonEditorProps = {
  editContent: JSONValue;
  path: JSONPath;
};
export function JsonEditor(props: JsonEditorProps): React.ReactElement | null {
  const { editContent, path } = props;
  if (typeof editContent === "string") {
    return <input type="text" value={editContent} />;
  } else if (typeof editContent === "number") {
    
  } else if (typeof editContent === "boolean") {
    
  } else if (editContent === null) {
    
  } else if (Array.isArray(editContent)) {
    return <>[...]</>;
  } else {
    return <>{"{"}...{"}"}</>;
  }
  return null;
}
