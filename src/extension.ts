import * as vscode from 'vscode';
import constants from './constants';
import { insertBox } from './functions/insertBox';

/**
 * Extension activated
 * Inspired by https://prototypes.polymermallard.com/docblock/index.html
 *
 * @author Matt Kenefick <polymermallard.com>
 * @param ExtensionContract context
 * @return void
 */
export function activate(context: vscode.ExtensionContext) {
	let disposable;

	// region: Commands
	// ---------------------------------------------------------------------------

	disposable = vscode.commands.registerCommand('box-comment.createBox', () => insertBox(constants.TOTAL_LINE_LENGTH));
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('box-comment.createBox80', () => insertBox(80));
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('box-comment.createBox120', () => insertBox(120));
	context.subscriptions.push(disposable);

	// endregion: Commands
}

// this method is called when your extension is deactivated
export function deactivate() {}
