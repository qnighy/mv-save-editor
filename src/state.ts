import React from "react";
import produce from "immer";
import LZString from "lz-string";

export type Action =
  | StartImportAction
  | FailImportAction
  | FinishImportAction
  | EditAction
  | DiscardAction;
export type StartImportAction = {
  readonly type: "IMPORT/START";
};
export type FailImportAction = {
  readonly type: "IMPORT/FAIL";
  readonly error: string;
};
export type FinishImportAction = {
  readonly type: "IMPORT/FINISH";
  readonly content: JSONValue;
};
export type EditAction = {
  readonly type: "EDIT";
  readonly path: readonly (number | string)[];
  readonly newValue: JSONValue;
};
export type DiscardAction = {
  readonly type: "DISCARD";
};

export type JSONValue = JSONObject | JSONArray | string | number | boolean | null;
export type JSONObject = {
  readonly [key: string]: JSONValue;
};
export type JSONArray = readonly JSONValue[];
export type JSONPath = readonly (string | number)[];

export function startImport(): StartImportAction {
  return { type: "IMPORT/START" };
}
export function failImport(error: string): FailImportAction {
  return { type: "IMPORT/FAIL", error };
}
export function finishImport(content: JSONValue): FinishImportAction {
  return { type: "IMPORT/FINISH", content };
}
export function edit(path: readonly (number | string)[], newValue: JSONValue): EditAction {
  return { type: "EDIT", path, newValue };
}
export function discard(): DiscardAction {
  return { type: "DISCARD" };
}

export function doImport(dispatch: React.Dispatch<Action>, file: Blob | string) {
  const promise = (async () => {
    dispatch(startImport());
    const fileContent =
      typeof file === "string"
      ? file
      : await file.text();
    const json = LZString.decompressFromBase64(fileContent) ?? "";
    const obj = JSON.parse(json);
    dispatch(finishImport(obj));
  })();
  promise.catch((e) => {
    dispatch(failImport(`${e}`))
  });
}

export function getResult(content: JSONValue): string {
  return LZString.compressToBase64(JSON.stringify(content));
}

export type State = {
  readonly importing: boolean;
  readonly importError?: string | undefined;
  readonly editContent?: JSONValue | undefined;
};

export const initialState: State = {
  importing: false,
};

export const reduce = produce<(state: State, action: Action) => State>((state, action) => {
  switch (action.type) {
    case "IMPORT/START":
      state.importing = true;
      state.importError = undefined;
      (state as any).editContent = undefined;
      break;
    case "IMPORT/FAIL":
      state.importing = false;
      state.importError = action.error;
      break;
    case "IMPORT/FINISH":
      state.importing = false;
      state.importError = undefined;
      (state as any).editContent = action.content;
      break;
    case "EDIT":
      if ((state as any).editContent !== undefined) {
        applyEdit(state as any, action.path, action.newValue);
      }
      break;
    case "DISCARD":
      state.importing = false;
      state.importError = undefined;
      (state as any).editContent = undefined;
      break;
  }
});

function applyEdit(editContent: any, path: readonly (number | string)[], newValue: JSONValue) {
  let currentRef: [any, string | number] = [] as any;
  let current = editContent;
  for (const segment of path) {
    if (typeof segment === "string" && isObject(current) && !Array.isArray(current)) {
      if (Object.hasOwn(current, segment)) {
        currentRef = [current, segment];
        current = (current as any)[segment];
        continue;
      }
    } else if (typeof segment === "number" && Array.isArray(current)) {
      if (Object.hasOwn(current, segment)) {
        currentRef = [current, segment];
        current = current[segment];
        continue;
      }
    }
    return;
  }
  {
    const [current, segment] = currentRef;
    (current as any)[segment] = newValue;
  }
}

function isObject(x: unknown): x is object {
  return (typeof x === "object" || typeof x === "function") && x !== null;
}
