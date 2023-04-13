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
  readonly filename?: string | undefined;
};
export type FailImportAction = {
  readonly type: "IMPORT/FAIL";
  readonly error: string;
};
export type FinishImportAction = {
  readonly type: "IMPORT/FINISH";
  readonly filename?: string | undefined;
  readonly content: unknown;
};
export type EditAction = {
  readonly type: "EDIT";
  readonly updater: (prevValue: unknown) => unknown;
};
export type DiscardAction = {
  readonly type: "DISCARD";
};

export function startImport(filename: string | undefined): StartImportAction {
  return { type: "IMPORT/START", filename };
}
export function failImport(error: string): FailImportAction {
  return { type: "IMPORT/FAIL", error };
}
export function finishImport(filename: string | undefined, content: unknown): FinishImportAction {
  return { type: "IMPORT/FINISH", filename, content };
}
export function edit(updater: (prevValue: unknown) => unknown): EditAction {
  return { type: "EDIT", updater };
}
export function discard(): DiscardAction {
  return { type: "DISCARD" };
}

export function doImport(dispatch: React.Dispatch<Action>, file: Blob | string) {
  const filename =
    file instanceof File
    ? file.name
    : undefined;
  const promise = (async () => {
    dispatch(startImport(filename));
    const fileContent =
      typeof file === "string"
      ? file
      : await file.text();
    const json = LZString.decompressFromBase64(fileContent) ?? "";
    const obj = JSON.parse(json);
    dispatch(finishImport(filename, obj));
  })();
  promise.catch((e) => {
    dispatch(failImport(`${e}`))
  });
}

export function getResult(content: unknown): string {
  return LZString.compressToBase64(JSON.stringify(content));
}

export type State = {
  readonly importing: boolean;
  readonly importError?: string | undefined;
  readonly filename?: string | undefined;
  readonly editContent?: unknown;
};

export const initialState: State = {
  importing: false,
};

export const reduce = produce<(state: State, action: Action) => State>((state, action) => {
  switch (action.type) {
    case "IMPORT/START":
      state.importing = true;
      state.importError = undefined;
      state.filename = action.filename;
      (state as any).editContent = undefined;
      break;
    case "IMPORT/FAIL":
      state.importing = false;
      state.importError = action.error;
      break;
    case "IMPORT/FINISH":
      state.importing = false;
      state.importError = undefined;
      state.filename = action.filename;
      (state as any).editContent = action.content;
      break;
    case "EDIT":
      state.editContent = action.updater(state.editContent);
      break;
    case "DISCARD":
      state.importing = false;
      state.importError = undefined;
      state.filename = undefined;
      (state as any).editContent = undefined;
      break;
  }
});
