import * as vscode from 'vscode';

// Get settings
const settings = vscode.workspace.getConfiguration('box-comment');

// This can be changed per language, so JS can have less than another
const chars = settings?.chars || {};
const indentAmount: number = settings?.indentation || 2;

export default {
	CHAR_BL: chars.bl || '└',
	CHAR_BM: chars.bm || '─',
	CHAR_BR: chars.br || '┘',
	CHAR_DL: chars.dl || '├',
	CHAR_DM: chars.dm || '─',
	CHAR_DR: chars.dr || '┤',
	CHAR_L: chars.l || '│',
	CHAR_R: chars.r || '│',
	CHAR_TL: chars.tl || '┌',
	CHAR_TM: chars.tm || '─',
	CHAR_TR: chars.tr || '┐',
	TOTAL_LINE_LENGTH: settings?.length || 80,
	indent: ' '.repeat(indentAmount),
	indentAmount: indentAmount,
	linebreak: {
		after: settings?.linebreak?.after ? `\n` : '',
		before: settings?.linebreak?.before ? `\n` : '',
	},
};
