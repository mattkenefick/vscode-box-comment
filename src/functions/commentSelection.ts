import * as vscode from 'vscode';

/**
 * Creates a native comment of our current selection
 *
 * @return void
 */
export function commentSelection(): void {
	vscode.commands.executeCommand('editor.action.blockComment');

	// vscode.commands.executeCommand('editor.action.addCommentLine');
}

/**
 * Removes a native comment of our current selection
 *
 * @return void
 */
export function uncommentSelection(): void {
	vscode.commands.executeCommand('editor.action.blockComment');
}
