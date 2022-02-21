import * as vscode from 'vscode';
import { getTrimmedLine } from './getTrimmedLine';
import { isWithinBox } from './isWithinBox';
import { uncommentSelection } from './commentSelection';
import Constants from '../constants';

/**
 * Attempt to remove the box we're in
 *
 * @return void
 */
export async function removeBox(): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	const document: vscode.TextDocument | undefined = editor?.document;
	const selection: vscode.Selection | undefined = editor?.selection;

	if (!editor || !document) {
		return;
	}

	let lineCount: number = document?.lineCount || 1;
	let topCorner: number = selection?.start.line || 0;
	let bottomCorner: number = selection?.start.line || 0;
	let isAtTopCorner = !!getTrimmedLine(topCorner).match(Constants.CHAR_TL);
	let isAtBottomCorner = !!getTrimmedLine(bottomCorner).match(Constants.CHAR_BL);
	console.log(getTrimmedLine(bottomCorner), isAtBottomCorner);
	if (!editor || !document) {
		return;
	}

	// Build our search regex
	let lineBuilder: string = '';
	lineBuilder += `${Constants.CHAR_TL}${Constants.CHAR_TM}${Constants.CHAR_TR}`;
	lineBuilder += `${Constants.CHAR_BL}${Constants.CHAR_BM}${Constants.CHAR_BR}`;
	lineBuilder += `${Constants.CHAR_DL}${Constants.CHAR_DM}${Constants.CHAR_DR}`;
	lineBuilder += `${Constants.CHAR_L}${Constants.CHAR_R}`;

	const regex: RegExp = new RegExp(` ?[${lineBuilder}] ?`, 'g');

	// Go north to find top corner
	while (!isAtTopCorner && topCorner > 0 && topCorner--) {
		isAtTopCorner = !!getTrimmedLine(topCorner)?.match(Constants.CHAR_TL);
	}

	// Go south to find bottom corner
	while (!isAtBottomCorner && bottomCorner < lineCount - 1 && bottomCorner++) {
		isAtBottomCorner = !!getTrimmedLine(bottomCorner)?.match(Constants.CHAR_BL);
	}

	// Debug
	console.log('Top Corner', topCorner);
	console.log('Bottom Corner', bottomCorner);

	// Check if we use block comments or not
	// mk: Use block comments by default
	// if (isWithinBox(false, topCorner)) {
	editor.selection = new vscode.Selection(
		Math.max(0, topCorner - 2),
		0,
		Math.min(lineCount - 1, bottomCorner + 1),
		10,
	);

	// }
	// else {
	// 	editor.selection = new vscode.Selection(topCorner, 0, bottomCorner, 10);
	// }

	// Uncomment
	uncommentSelection();

	// Remove comments from lines
	editor.edit((editBuilder: vscode.TextEditorEdit) => {
		const selection: vscode.Selection = new vscode.Selection(topCorner, 0, bottomCorner, 1000);
		let text: string = document.getText(selection);

		text = text.replace(regex, '');
		text = text.replace(/[ ]+\n/g, '\n');
		text = text.replace(/\n[ ]+/g, '\n');
		text = text.replace(/^\n{0,2}/, '');
		text = text.replace(/\n{0,2}$/, '');

		editBuilder.replace(selection, text);
	});
}
