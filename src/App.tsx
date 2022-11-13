import React, { useReducer, useRef } from 'react';
import './App.css';
import { JsonEditor } from './JsonEditor';
import { reduce, initialState, doImport } from './state';

const empty = [] as const;

function App() {
  const [state, dispatch] = useReducer(reduce, initialState);
  const savedataTextarea = useRef<HTMLTextAreaElement>(null);
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
          <JsonEditor
            dispatch={dispatch}
            editContent={state.editContent}
            path1={empty}
            path2={"editContent"}
            prepend=""
            append=""
          />
        )
      }
    </div>
  );
}

export default App;
