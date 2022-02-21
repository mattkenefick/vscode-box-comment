import * as vscode from 'vscode';

/**
 * Attempts to determine how long a comment is per language. Some languages
 * use something like "// ", some use "#" or ";", etc.
 *
 * @return number
 */
export async function getCommentLength(): Promise<number> {
	const editor = vscode.window.activeTextEditor;

	// No editor found
	if (!editor) {
		return 0;
	}

	const document: vscode.TextDocument | undefined = editor?.document;

	// No document found
	if (!document) {
		return 0;
	}

	const cursorPos = editor.selection?.active || 0;
	const text = document.lineAt(cursorPos).text;

	const beforeLength = document.lineAt(cursorPos).range.end.character;
	await vscode.commands.executeCommand('editor.action.addCommentLine');

	const afterLength = document.lineAt(cursorPos).range.end.character;
	const frontCommentLength = text.length
		? document.lineAt(cursorPos).text.indexOf(text)
		: Math.abs(afterLength - beforeLength);

	await vscode.commands.executeCommand('undo');

	return frontCommentLength;
}
