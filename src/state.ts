import React from "react";
import produce from "immer";
import LZString from "lz-string";

export type Action = StartImportAction | FailImportAction | FinishImportAction;
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

export type JSONValue = {
  readonly [key: string]: JSONValue;
} | readonly JSONValue[] | string | number | boolean | null;

export function startImport(): StartImportAction {
  return { type: "IMPORT/START" };
}
export function failImport(error: string): FailImportAction {
  return { type: "IMPORT/FAIL", error };
}
export function finishImport(content: JSONValue): FinishImportAction {
  return { type: "IMPORT/FINISH", content };
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

export type State = {
  readonly importing: boolean;
  readonly importError?: string | undefined;
};

export const initialState: State = {
  importing: false,
};

export const reduce = produce<(state: State, action: Action) => State>((state, action) => {
  switch (action.type) {
    case "IMPORT/START":
      state.importing = true;
      state.importError = undefined;
      break;
    case "IMPORT/FAIL":
      state.importing = false;
      state.importError = action.error;
      break;
    case "IMPORT/FINISH":
      state.importing = false;
      state.importError = undefined;
      break;
  }
});
