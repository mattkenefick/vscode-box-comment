import * as vscode from 'vscode';
import Constants from '../constants';

/**
 * Parse lines into array
 *
 * @param TextDocument document
 * @param Selection selection
 * @return string[]
 */
export function parseLines(selection: vscode.Selection, maxLineLength: number = 80): string[] {
	const editor = vscode.window.activeTextEditor;
	const document: vscode.TextDocument | undefined = editor?.document;

	// No editor
	if (!editor || !document) {
		return [];
	}

	let text: string;
	let linesOfText: string[];
	let masterArray: string[] = [];

	// Select current line if we determine that there is no selection
	if (selection.end.character === selection.start.character && selection.start.line === selection.end.line) {
		text = document.lineAt(selection.start.line).text;
		editor.selection = selection = new vscode.Selection(selection.start.line, 0, selection.start.line, text.length);
	}

	// Convert tabs to 2 spaces
	text = document.getText(selection).toString().replace(/\t/g, '  ');

	// Break lines into an array
	linesOfText = text.split('\n');

	// Iterate through list of lines and check if any of them are too long
	// then create a new array
	for (let i = 0, l = linesOfText.length; i < l; i++) {
		const len: number = maxLineLength - 2 - Constants.CHAR_L.length - Constants.CHAR_R.length;
		let lines: string[] = [];
		let value: string = linesOfText[i];

		// If the line is longer than max allowed, parse into new lines
		if (value.length >= len) {
			while (value.length) {
				let indexOf = value.substr(0, len).lastIndexOf(' ');

				if (indexOf === -1) {
					indexOf = 9999;
				}

				lines.push(value.substr(0, indexOf));
				value = value.substr(indexOf + 1);
			}
		}
		else {
			lines = [value];
		}

		// Merge into single array
		masterArray = masterArray.concat(lines);
	}

	// Process each line
	masterArray.forEach((line: string, index: number) => {
		if (line.trim() === '--') {
			masterArray[index] = CHAR_DM.repeat(maxLineLength - 2); // - 2 because we remove the spaces
		}
		else {
			masterArray[index] = line + ' '.repeat(Math.max(0, maxLineLength - line.length - 4));
		}
	});

	return masterArray;
}
