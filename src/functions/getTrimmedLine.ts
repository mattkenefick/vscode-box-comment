import * as vscode from 'vscode';

/**
 * Attempt to retreive a specific line trimmed.
 *
 * @param number | Selection at
 * @return string
 */
export function getTrimmedLine(at: number | vscode.Selection): string {
	const editor = vscode.window.activeTextEditor;
	const document: vscode.TextDocument | undefined = editor?.document;

	if (!editor) {
		return '';
	}

	const line: number = typeof at === 'number' ? at : at?.start.line;
	const text: string = document?.lineAt(line).text || '';

	return text.toString().trim();
}
