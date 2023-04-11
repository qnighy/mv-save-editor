import { css } from "@linaria/core";
import React, { useCallback, useMemo } from "react";

export type JsonEditor2Props = {
  value: unknown;
  setValue: (updater: (prevValue: unknown) => unknown) => void;
};

const emptyPath: Path = [];
export const JsonEditor2: React.FC<JsonEditor2Props> = (props) => {
  const { value, setValue } = props;
  const setPartValue = useCallback((path: Path, updater: (prevValue: unknown) => unknown) => {
    setValue((prevValue) => updatePath(path, prevValue, updater));
  }, [setValue]);
  return <JsonPartEditor path={emptyPath} value={value} setValue={setPartValue} prepend={null} append={null} />;
}

type Segment = string | number;
type Path = readonly Segment[];
type JsonPartEditorProps = {
  path: Path;
  value: unknown;
  setValue: (path: Path, updater: (prevValue: unknown) => unknown) => void;
  prepend: React.ReactNode;
  append: React.ReactNode;
};

const JsonPartEditor: React.FC<JsonPartEditorProps> = React.memo((props) => {
  const { path, value, setValue, prepend, append } = props;

  if (typeof value === "string") {
    return <div>{prepend}{JSON.stringify(value)}{append}</div>;
  } else if (typeof value === "number") {
    return <div>{prepend}{JSON.stringify(value)}{append}</div>;
  } else if (typeof value === "boolean") {
    return <div>{prepend}{JSON.stringify(value)}{append}</div>;
  } else if (value == null) {
    return <div>{prepend}{JSON.stringify(value)}{append}</div>;
  } else if (Array.isArray(value)) {
    return (
      <details className={accordion}>
        <summary>
          {prepend}
          [
          <span className={summaryPlaceholder}>{"...]"}{append}</span>
        </summary>
        <div className={indentBlock}>
          {
            value.map((elem, i, a) => (
              <React.Fragment key={i}>
                <JsonChildEditor
                  parentPath={path}
                  nextSegment={i}
                  value={elem}
                  setValue={setValue}
                  prepend={null}
                  append={i + 1 === a.length ? "" : ","}
                />
              </React.Fragment>
            ))
          }
        </div>
        ]
        {append}
      </details>
    );
  } else if (typeof value === "object" && value != null) {
    const record = asRecord(value);
    return (
      <details className={accordion}>
        <summary>
          {prepend}
          {"{"}
          <span className={summaryPlaceholder}>{"...}"}{append}</span>
        </summary>
        <div className={indentBlock}>
          {
            Object.entries(record).map(([key, value], i, a) => (
              <React.Fragment key={key}>
                <JsonChildEditor
                  parentPath={path}
                  nextSegment={key}
                  value={value}
                  setValue={setValue}
                  prepend={`${JSON.stringify(key)}: `}
                  append={i + 1 === a.length ? "" : ","}
                />
              </React.Fragment>
            ))
          }
        </div>
        {"}"}
        {append}
      </details>
    );
  }
  return null;
});

type JsonChildEditorProps = Omit<JsonPartEditorProps, "path"> & {
  parentPath: Path,
  nextSegment: Segment,
};

const JsonChildEditor: React.FC<JsonChildEditorProps> = (props) => {
  const { parentPath, nextSegment, ...rest } = props;
  const path = useMemo(() => [...parentPath, nextSegment], [parentPath, nextSegment]);
  return <JsonPartEditor path={path} {...rest} />
};

function updatePath(path: Path, prevValue: unknown, updater: (prevValue: unknown) => unknown): unknown {
  const stack: ([any[], number] | [Record<string, unknown>, string])[] = [];
  let current = prevValue;
  for (const key of path) {
    if (Array.isArray(current) && typeof key === "number") {
      stack.push([current, key]);
      current = current[key];
    } else if (
      typeof current === "object"
      && current != null
      && !Array.isArray(current)
      && typeof key === "string"
    ) {
      stack.push([asRecord(current), key]);
      current = asRecord(current)[key];
    } else {
      // Give up updating
      return prevValue;
    }
  }
  current = updater(current);
  while (stack.length > 0) {
    const [prevPart, key] = stack.pop()!;
    if (typeof key === "number") {
      const newArray = [...prevPart as any[]];
      newArray[key] = current;
      current = newArray;
    } else {
      current = { ...prevPart, key: current };
    }
  }
  return current;
}

const summaryPlaceholder = css``;

const accordion = css`
  &[open] > summary .${summaryPlaceholder} {
    display: none;
  }
`;

const indentBlock = css`
  padding-left: 1em;
  border-left: 1px solid #cccccc;
`;

function asRecord(obj: object): Record<string, unknown> {
  return obj as Record<string, unknown>;
}
