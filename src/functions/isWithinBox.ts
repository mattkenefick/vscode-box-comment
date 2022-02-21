import * as vscode from 'vscode';
import constants from '../constants';

/**
 * Figure out if we're inside an existing box already
 *
 * @param boolean removeComments
 * @param number lineNumber
 * @return boolean
 */
export function isWithinBox(removeComments: boolean = true, lineNumber: number = -1): boolean {
	const editor: vscode.TextEditor = vscode.window.activeTextEditor;
	const document: vscode.TextDocument | undefined = editor?.document;
	const selection: vscode.Selection | undefined = editor?.selection;

	if (!document || !editor) {
		return false;
	}

	// Get trimmed line
	let line: string = document
		.lineAt(lineNumber >= 0 ? lineNumber : selection?.start.line || 0)
		.text.toString()
		.trim() as string;

	// Remove common comment types from the front of a line so they don't
	// interfere with what might be the box
	if (removeComments) {
		line = line.replace(/^[#*\/; ]+/g, '');
	}

	return (
		line.charAt(0) === constants.CHAR_TL
		|| line.charAt(0) === constants.CHAR_L
		|| line.charAt(0) === constants.CHAR_BL
	);
}
