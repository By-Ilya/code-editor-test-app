import React from 'react';
import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { CodeLineRange } from './utils/common';
import { identifyPythonLargeDictsRanges, getLastColumnOfCodeLine } from './utils/pythonCodeParser';
import './App.css';

const CODE_LANGUAGE: string = "python";
const EDITOR_VALUE: string = `import __main__\nimport os\nimport typing\n\n# Test functions\n\ndef test_user():\n\t\n\t# Input arguments\n\n\tname = "test"\n\ttestObject = {\n\t    'a': 1,\n\t    'b': 2,\n\t    'c': 3,\n\t    'd': 4,\n\t    'e': 5,\n\t    'f': 6,\n\t    'g': 7,\n\t}\n\n\t# Mocks\n\n\t# Function call\n\n\tresult = __main__.user(\n\t\tname=name\n\t)\n\n\t# Expected value\n\n\texpected = "<h1>Hello, test!</h1>"\n\n\t# Assertions\n\n\tassert result == expected\n`;

function App() {
  const identifiedDictLineRanges: CodeLineRange[] = identifyPythonLargeDictsRanges(EDITOR_VALUE);

  const createCommentContainerNode = (): HTMLElement => {
    const commentContainerNode: HTMLDivElement = document.createElement('div');
    commentContainerNode.innerHTML = '&nbsp; # Whoa! This is a big object and we made it folded.';
    commentContainerNode.style.height = '18px';
    commentContainerNode.style.fontFamily = 'Courier New';
    commentContainerNode.style.fontSize = '14px';
    commentContainerNode.style.color = 'white';
    commentContainerNode.style.backgroundColor = 'rgba(0, 127, 212, 0.4)';

    return commentContainerNode;
  }

  const createInspectButtonNode = (): HTMLElement => {
    const buttonNode: HTMLButtonElement = document.createElement('button');
    buttonNode.innerHTML = 'Inspect';
    buttonNode.style.height = '18px';
    buttonNode.style.backgroundColor = '#0e639c';
    buttonNode.style.border = 'none';
    buttonNode.style.fontSize = '11px';
    buttonNode.style.color = 'white';
    buttonNode.style.cursor = 'pointer';

    buttonNode.onmouseover = () => {
      buttonNode.style.backgroundColor = '#1177bb';
    }
    buttonNode.onmouseleave = () => {
      buttonNode.style.backgroundColor = '#0e639c';
    }
    buttonNode.onclick = () => {
      alert("Coming soon");
    };

    return buttonNode;
  }

  const addLargeDictCommentZone = (
    editor: monaco.editor.IStandaloneCodeEditor,
    afterLineNumber: number
  ): void => {
    editor.changeViewZones((accessor: monaco.editor.IViewZoneChangeAccessor) => {
      accessor.addZone({
        afterLineNumber,
        domNode: createCommentContainerNode()
      });
    });
  }

  const addInspectButton = (
    editor: monaco.editor.IStandaloneCodeEditor,
    buttonIndex: number,
    exactLineNumber: number,
    exactColumnNumber: number
  ): void => {
    editor.addContentWidget({
      getDomNode(): HTMLElement {
        return createInspectButtonNode();
      },
      getId(): string {
        return `inspect.button.${buttonIndex}`;
      },
      getPosition(): monaco.editor.IContentWidgetPosition | null {
        return {
          position: {
            lineNumber: exactLineNumber,
            column: exactColumnNumber,
          },
          preference: [
            monaco.editor.ContentWidgetPositionPreference.EXACT,
          ],
        };
      }
    });
  };

  const handleEditorDidMount: OnMount = (editor: monaco.editor.IStandaloneCodeEditor, m: Monaco) => {
    m.languages.registerFoldingRangeProvider(CODE_LANGUAGE, {
      provideFoldingRanges(): monaco.languages.ProviderResult<monaco.languages.FoldingRange[]> {
        return identifiedDictLineRanges.map((linesRange: CodeLineRange, index: number) => {
          addLargeDictCommentZone(editor, linesRange.start - 1);
          addInspectButton(
            editor,
            index,
            linesRange.start,
            getLastColumnOfCodeLine(EDITOR_VALUE, linesRange.start - 1),
          );

          return {
            start: linesRange.start,
            end: linesRange.end,
            kind: m?.languages.FoldingRangeKind.Region
          }
        });
      }
    });

    editor.trigger('fold', 'editor.foldAllMarkerRegions', '');
  };

  return (
    <div className="App">
      <Editor
        height="100vh"
        defaultLanguage={CODE_LANGUAGE}
        value={EDITOR_VALUE}
        theme="vs-dark"
        options={{
          folding: true,
          showFoldingControls: 'mouseover',
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  );
}

export default App;
