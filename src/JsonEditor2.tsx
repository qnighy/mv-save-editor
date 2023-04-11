import React from "react";

export type JsonEditor2Props = {
  value: unknown;
  setValue: (updater: (prevValue: unknown) => unknown) => void;
};

export const JsonEditor2: React.FC<JsonEditor2Props> = (props) => {
  const { value, setValue } = props;

  if (typeof value === "string") {
    return <span>{JSON.stringify(value)}</span>;
  } else if (typeof value === "number") {
    return <span>{JSON.stringify(value)}</span>;
  } else if (typeof value === "boolean") {
    return <span>{JSON.stringify(value)}</span>;
  } else if (value == null) {
    return <span>{JSON.stringify(value)}</span>;
  } else if (Array.isArray(value)) {
    return (
      <>
        [
        {
          value.map((elem, i, a) => (
            <React.Fragment key={i}>
              <JsonEditor2 value={elem} setValue={setValue} />
              {i + 1 === a.length ? "" : ","}
            </React.Fragment>
          ))
        }
        ]
      </>
    );
  } else if (typeof value === "object" && value != null) {
    const record = asRecord(value);
    return (
      <>
        {"{"}
        {
          Object.entries(record).map(([key, value], i, a) => (
            <React.Fragment key={key}>
              {JSON.stringify(key)}: <JsonEditor2 value={value} setValue={setValue} />
              {i + 1 === a.length ? "" : ","}
            </React.Fragment>
          ))
        }
        {"}"}
      </>
    );
  }
  return null;
};

function asRecord(obj: object): Record<string, unknown> {
  return obj as Record<string, unknown>;
}
