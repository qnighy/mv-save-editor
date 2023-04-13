import React, { useCallback, useMemo, useReducer, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import './App.css';
import { JsonEditor2 } from './JsonEditor2';
import { reduce, initialState, doImport, discard, getResult, edit } from './state';
import { DownloadLink } from './DownloadLink';

function App() {
  const [state, dispatch] = useReducer(reduce, initialState);
  const savedataTextarea = useRef<HTMLTextAreaElement>(null);
  const result = useMemo(() =>
    state.editContent === undefined
      ? undefined
      : getResult(state.editContent)
  , [state.editContent]);
  const resultBlob = useMemo(() => {
    if (result && Blob) {
      return new Blob([result]);
    }
    return undefined;
  }, [result]);
  const setValue = useCallback((updater: (prevValue: unknown) => unknown) => {
    dispatch(edit(updater));
  }, [dispatch]);
  return (
    <div className="App">
      <h1>Save Editor</h1>
      {
        state.editContent === undefined
        ? (
          <>
            <label>
              <div>
                Input file:
                <input
                  type="file"
                  accept=".rpgsave"
                  onChange={(e) => {
                    if (e.currentTarget.files && e.currentTarget.files.length > 0) {
                      doImport(dispatch, e.currentTarget.files[0]);
                    }
                  }}
                  disabled={state.importing}
                />
              </div>
            </label>
            <label>
              <div>Or paste the content directly:</div>
              <div>
                <textarea ref={savedataTextarea} className="savedata" disabled={state.importing}></textarea>
              </div>
              <button
                onClick={() => {
                  if (savedataTextarea.current) {
                    doImport(dispatch, savedataTextarea.current.value);
                  }
                }}
              >
                OK
              </button>
            </label>
            {
              state.importError &&
              <p className="error-message">{state.importError}</p>
            }
          </>
        )
        : (
          <>
            <DownloadLink
              blob={resultBlob!}
              download={
                state.filename ? `edit-${state.filename}` : "edit.rpgsave"
              }
            >
              <FontAwesomeIcon icon={solid("cloud-arrow-down")} />
              Download
            </DownloadLink>
            <button
              onClick={() => dispatch(discard())}
            >
              <FontAwesomeIcon icon={solid("trash")} />
              Discard
            </button>
            <JsonEditor2 value={state.editContent} setValue={setValue} />
          </>
        )
      }
    </div>
  );
}

export default App;
