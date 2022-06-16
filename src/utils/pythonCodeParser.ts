import { CodeLineRange } from "./common";

interface PythonDictPattern {
  startPattern: RegExp;
  endPattern: RegExp;
}

const PYTHON_DICT_PATTERN: PythonDictPattern = {
  startPattern: /{/,
  endPattern: /}/,
}
const PYTHON_DICT_SIZE_THRESHOLD: number = 5;

export function identifyPythonLargeDictsRanges(editorValue: string): CodeLineRange[] {
  const editorLines = editorValue.split('\n');

  const pythonDictRanges: CodeLineRange[] = [];

  let currStartIndex = -1;
  let currEndIndex = -1;
  editorLines.forEach((line: string, index: number) => {
    if (PYTHON_DICT_PATTERN.startPattern.test(line)) {
      currStartIndex = index;
      return;
    }

    if (currStartIndex !== -1 && PYTHON_DICT_PATTERN.endPattern.test(line)) {
      currEndIndex = index;

      if (currEndIndex - currStartIndex > PYTHON_DICT_SIZE_THRESHOLD) {
        pythonDictRanges.push({
          start: currStartIndex + 1,
          end: currEndIndex + 1,
        } as CodeLineRange);
      }

      currStartIndex = -1
      currEndIndex = -1
    }
  });

  return pythonDictRanges;
}

export function getLastColumnOfCodeLine(editorValue: string, lineNumber: number): number {
  const editorLines: string[] = editorValue.split('\n');
  return editorLines[lineNumber]?.length + 1 ?? 0
}