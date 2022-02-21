import * as vscode from 'vscode';
import Constants from '../constants';
import { commentSelection } from './commentSelection';
import { getCommentLength } from './getCommentLength';
import { isWithinBox } from './isWithinBox';
import { parseLines } from './parseLines';
import { removeBox } from './removeBox';

/**
 * Primary function to create a box within our workspace.
 *
 * @param number lineLength
 * @return void
 */
export async function insertBox(lineLength: number = 80): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	const document: vscode.TextDocument | undefined = editor?.document;
	let selection: vscode.Selection | undefined = editor?.selection;
	let lines: string[] = [];

	if (!editor || !document || !selection) {
		return;
	}

	// Ensure our selection starts at beginning
	editor.selection = selection = new vscode.Selection(selection.start.line, 0, selection.end.line, 500);

	// Check if we're in a box; if so, we should remove it
	// mk: We should move this to a more generalized function
	if (isWithinBox()) {
		removeBox();
		return;
	}

	// Reduce line length due to size of comment per language
	lineLength -= await getCommentLength();

	// Reduce line length due to size of indentation
	lineLength -= Constants.indentAmount;

	// Parse lines out into an array
	lines = parseLines(selection, lineLength);

	// Replace text
	editor.edit((editBuilder: vscode.TextEditorEdit): void => {
		let replacementText: string = lines
			.map((currentValue: string) => {
				// Divider
				if (currentValue[0] === Constants.CHAR_DM) {
					return Constants.indent + `${Constants.CHAR_DL}${currentValue}${Constants.CHAR_DR}`;
				}

				// Regular line
				else {
					return Constants.indent + `${Constants.CHAR_L} ${currentValue} ${Constants.CHAR_R}`;
				}
			})
			.reduce((previous: string, current: string) => `${previous}\n${current}`);

		// Wrap text with upper and lower dividers
		// 2 represents LEFT + RIGHT wall characters (DL / DR) / (L / R)
		replacementText = [
			'', // to drop the line for block comments
			Constants.linebreak.before
				+ Constants.indent
				+ Constants.CHAR_TL
				+ Constants.CHAR_TM.repeat(lineLength - 2)
				+ Constants.CHAR_TR,
			replacementText,
			Constants.indent
				+ Constants.CHAR_BL
				+ Constants.CHAR_BM.repeat(lineLength - 2)
				+ Constants.CHAR_BR
				+ Constants.linebreak.after,
			'', // to drop the line for block comments
		].join('\n');

		// Replace selection with manipulated text
		editBuilder.replace(editor.selection, replacementText);
	});

	// Comment our box with inherited delimiters
	commentSelection();

	// Remove selection (next tick)
	setTimeout(() => {
		const position: vscode.Position = new vscode.Position(selection.end.line + 3, 0);
		editor.selection = new vscode.Selection(position, position);
	}, 1);
}
