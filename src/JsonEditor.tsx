import { css } from "@linaria/core";
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

export type JsonEditorProps = {
  value: unknown;
  setValue: (updater: (prevValue: unknown) => unknown) => void;
};

const emptyPath: Path = [];
export const JsonEditor: React.FC<JsonEditorProps> = (props) => {
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
  remove?: () => void;
  prepend: React.ReactNode;
  append: React.ReactNode;
};

const JsonPartEditor: React.FC<JsonPartEditorProps> = React.memo((props) => {
  const { path, value, setValue, remove, prepend, append } = props;

  const setValueHere = useCallback((updater: (prevValue: unknown) => unknown) => setValue(path, updater), [setValue, path]);

  const removeChild = useCallback((key: Segment) => {
    setValue(path, (prevValue) => removeKey(prevValue, key));
  }, [setValue, path]);

  if (typeof value === "string") {
    return <StringEditor value={value} setValue={setValueHere} remove={remove} prepend={prepend} append={append} />;
  } else if (typeof value === "number") {
    return <NumberEditor value={value} setValue={setValueHere} remove={remove} prepend={prepend} append={append} />;
  } else if (typeof value === "boolean") {
    return (
      <div className={editorLine}>
        {prepend}
        <label>
          <input type="checkbox" checked={value} onChange={(e) => {
            const newValue = e.currentTarget.checked;
            setValue(path, () => newValue);
          }} />
          {JSON.stringify(value)}
        </label>
        {append}
      </div>
    );
  } else if (value == null) {
    return <div className={editorLine}>{prepend}{JSON.stringify(value)}{append}</div>;
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
                  removeChild={removeChild}
                  prepend={<span className={arrayIndex}>{`${i}: `}</span>}
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
                  removeChild={removeChild}
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

type JsonChildEditorProps = Omit<JsonPartEditorProps, "path" | "remove"> & {
  parentPath: Path,
  nextSegment: Segment,
  removeChild: (key: Segment) => void,
};

const JsonChildEditor: React.FC<JsonChildEditorProps> = (props) => {
  const { parentPath, nextSegment, removeChild, ...rest } = props;
  const path = useMemo(() => [...parentPath, nextSegment], [parentPath, nextSegment]);
  const remove = useCallback(() => {
    removeChild(nextSegment);
  }, [removeChild, nextSegment])
  return <JsonPartEditor path={path} remove={remove} {...rest} />
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
      current = { ...prevPart, [key]: current };
    }
  }
  return current;
}

function removeKey(obj: unknown, key: Segment): unknown {
  if (Array.isArray(obj) && typeof key === "number") {
    const newObj = [...obj];
    newObj.splice(key, 1);
    return newObj;
  } else if (
    typeof obj === "object"
    && obj != null
    && !Array.isArray(obj)
    && typeof key === "string"
  ) {
    const newObj = { ...obj };
    delete asRecord(newObj)[key];
    return newObj;
  }
  return obj;
}

type StringEditorProps = {
  value: string;
  setValue: (updater: (prevValue: unknown) => unknown) => void;
  remove?: () => void;
  prepend: React.ReactNode;
  append: React.ReactNode;
};

const StringEditor: React.FC<StringEditorProps> = (props) => {
  const { value, setValue, remove, prepend, append } = props;
  const textSizingDummyElem = useRef<HTMLSpanElement>(null);
  const inputElem = useRef<HTMLInputElement>(null);
  const [editText, setEditText] = useState<string | undefined>(undefined);

  useLayoutEffect(() => {
    if (textSizingDummyElem.current && inputElem.current) {
      inputElem.current.style.width = `${textSizingDummyElem.current.clientWidth}px`;
    }
  });

  function applyText() {
    if (editText) {
      setValue(() => editText);
      setEditText(undefined);
    }
  }

  return (
    <div className={editorLine}>
      {prepend}
      {
        editText == null
        ? JSON.stringify(value)
        : <>
            "
            <span className={textSizingDummy} ref={textSizingDummyElem}>{editText}</span>
            <input className={editorTextBox} ref={inputElem} type="text" value={editText} onChange={(e) => setEditText(e.currentTarget.value)} />
            "
          </>
      }
      {append}
      <span className={editorButtonList}>
        {
          editText == null
          ? <>
              <button className={editorButton} onClick={() => setEditText(value)}>
                <FontAwesomeIcon icon={solid("pen")} />
              </button>
              {
                remove &&
                <button className={editorButton} onClick={remove}>
                  <FontAwesomeIcon icon={solid("minus-circle")} />
                </button>
              }
            </>
          : <>
              <button className={editorButton} onClick={applyText}>
                <FontAwesomeIcon icon={solid("check")} />
              </button>
              <button className={editorButton} onClick={() => setEditText(undefined)}>
                <FontAwesomeIcon icon={solid("trash")} />
              </button>
            </>
        }
      </span>
    </div>
  );
};

type NumberEditorProps = {
  value: number;
  setValue: (updater: (prevValue: unknown) => unknown) => void;
  remove?: () => void;
  prepend: React.ReactNode;
  append: React.ReactNode;
};

const NumberEditor: React.FC<NumberEditorProps> = (props) => {
  const { value, setValue, remove, prepend, append } = props;
  const textSizingDummyElem = useRef<HTMLSpanElement>(null);
  const inputElem = useRef<HTMLInputElement>(null);
  const [editNumber, setEditNumber] = useState<string | undefined>(undefined);

  useLayoutEffect(() => {
    if (textSizingDummyElem.current && inputElem.current) {
      inputElem.current.style.width = `${textSizingDummyElem.current.clientWidth}px`;
    }
  });

  function applyNumber() {
    if (editNumber != null) {
      setValue(() => {
        const num = Number(editNumber);
        return -Infinity < num && num < Infinity ? num : 0;
      });
      setEditNumber(undefined);
    }
  }

  return (
    <div className={editorLine}>
      {prepend}
      {
        editNumber == null
        ? JSON.stringify(value)
        : <>
            "
            <span className={numberSizingDummy} ref={textSizingDummyElem}>{editNumber}</span>
            <input className={editorTextBox} ref={inputElem} type="number" value={editNumber} onChange={(e) => setEditNumber(e.currentTarget.value)} />
            "
          </>
      }
      {append}
      <span className={editorButtonList}>
        {
          editNumber == null
          ? <>
              <button className={editorButton} onClick={() => setEditNumber(`${value}`)}>
                <FontAwesomeIcon icon={solid("pen")} />
              </button>
              {
                remove &&
                <button className={editorButton} onClick={remove}>
                  <FontAwesomeIcon icon={solid("minus-circle")} />
                </button>
              }
            </>
          : <>
              <button className={editorButton} onClick={applyNumber}>
                <FontAwesomeIcon icon={solid("check")} />
              </button>
              <button className={editorButton} onClick={() => setEditNumber(undefined)}>
                <FontAwesomeIcon icon={solid("trash")} />
              </button>
            </>
        }
      </span>
    </div>
  );
};

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

const arrayIndex = css`
  color: gray;
  font-size: 70%;
  user-select: none;
`;

const editorLine = css`
  &:hover {
    background-color: #f0f0f0;
  }
`;

const editorButtonList = css`
  margin: 0 1em;
  display: inline-flex;
`;

const editorButton = css`
  background: none;
  &:active {
    background-color: #cccccc;
  }
  .${editorLine} & {
    border: 1px solid #d0d0d0;
    color: #d0d0d0;
  }
  .${editorLine}:hover & {
    border: 1px solid #606060;
    color: #606060;
  }
  .${editorLine}:hover &:hover {
    border: 1px solid black;
    color: black;
  }
`;

const textSizingDummy = css`
  position: absolute;
  visibility: hidden;
`;
const numberSizingDummy = css`
  position: absolute;
  visibility: hidden;
  padding-left: 1em;
`;
const editorTextBox = css`
  display: inline-block;
  width: auto;

  border: none;
  padding: 0;
  font-style: inherit;
  font-variant-ligatures: inherit;
  font-variant-caps: inherit;
  font-variant-numeric: inherit;
  font-variant-east-asian: inherit;
  font-variant-alternates: inherit;
  font-weight: inherit;
  font-stretch: inherit;
  font-size: inherit;
  font-family: inherit;
  font-optical-sizing: inherit;
  font-kerning: inherit;
  font-feature-settings: inherit;
  font-variation-settings: inherit;
  text-rendering: inherit;
  color: inherit;
  letter-spacing: inherit;
  word-spacing: inherit;
  line-height: inherit;
  text-transform: inherit;
  text-indent: inherit;
  text-shadow: inherit;
  text-align: inherit;
  appearance: inherit;
`;

function asRecord(obj: object): Record<string, unknown> {
  return obj as Record<string, unknown>;
}
