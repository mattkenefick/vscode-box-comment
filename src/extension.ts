import * as vscode from 'vscode';

/**
 * Inspired by https://prototypes.polymermallard.com/docblock/index.html
 *
 * @author Matt Kenefick <polymermallard.com>
 */

/**
 * Extension activated
 *
 * @param ExtensionContract context
 * @return void
 */
export function activate(context: vscode.ExtensionContext) {
    let disposable;

    const settings = vscode.workspace.getConfiguration('box-comment');
    const chars = settings?.chars || {};

    const CHAR_TL = chars.tl || '┌';
    const CHAR_TM = chars.tm || '─';
    const CHAR_TR = chars.tr || '┐';
    const CHAR_L  = chars.l  || '│';
    const CHAR_R  = chars.r  || '│';
    const CHAR_BL = chars.bl || '└';
    const CHAR_BM = chars.bm || '─';
    const CHAR_BR = chars.br || '┘';
    const CHAR_DL = chars.dl || '├';
    const CHAR_DM = chars.dm || '─';
    const CHAR_DR = chars.dr || '┤';
    const TOTAL_LINE_LENGTH = settings?.length || 80;

    /**
     * Primary function to create a box within our workspace.
     *
     * @param number lineLength
     * @return void
     */
    function insertBox(lineLength: number = 80): void {
        const editor = vscode.window.activeTextEditor;
        const document: vscode.TextDocument | undefined = editor?.document;
        const selection: vscode.Selection | undefined = editor?.selection;
        let lines: string[] = [];

        // If we have a selection, proceed
        if (document && editor && selection) {
            lines = parseLines(document, selection, lineLength);

            // Replace text
            editor.edit((editBuilder: vscode.TextEditorEdit): void => {
                let replacementText: string = lines
                    .map((currentValue: string) => {
                        // Divider
                        if (currentValue[0] == CHAR_DM) {
                            return `${CHAR_DL}${currentValue}${CHAR_DR}`;
                        }
                        // Regular line
                        else {
                            return `${CHAR_L} ${currentValue} ${CHAR_R}`;
                        }
                    })
                    .reduce((previous: string, current: string) => `${previous}\n${current}`);

                // Wrap text with upper and lower dividers
                replacementText = [
                    CHAR_TL + CHAR_TM.repeat(lineLength - 2) + CHAR_TR,
                    replacementText,
                    CHAR_BL + CHAR_BM.repeat(lineLength - 2) + CHAR_BR,
                ].join("\n");

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
    }

    /**
     * Creates a native comment of our current selection
     *
     * @return void
     */
    function commentSelection(): void {
        vscode.commands.executeCommand('editor.action.addCommentLine');
    }

    /**
     * Parse lines into array
     *
     * @param TextDocument document
     * @param Selection selection
     * @return string[]
     */
    function parseLines(document: vscode.TextDocument, selection: vscode.Selection, maxLineLength: number = 80): string[] {
        const linesOfText: string[] = document.getText(selection).toString().split("\n");
        let masterArray: string[] = [];

        // Regex to replace older occurences of box characters
        const regex: RegExp = new RegExp(` ?[${CHAR_TL}${CHAR_TM}${CHAR_TR}${CHAR_BL}${CHAR_BM}${CHAR_BR}${CHAR_DL}${CHAR_DM}${CHAR_DR}${CHAR_L}${CHAR_R}] ?`, 'g');

        // Iterate through list of lines and check if any of them are too long
        // then create a new array
        for (let i = 0, l = linesOfText.length; i < l; i++) {
            const len: number = maxLineLength - 2 - CHAR_L.length - CHAR_R.length;
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
            // Change remove old box
            line = line.replace(regex, '');

            // Create line for new box
            if (line.trim() == '--') {
                masterArray[index] = CHAR_DM.repeat(maxLineLength - 2); // - 2 because we remove the spaces
            }
            else {
                masterArray[index] = line + ' '.repeat(Math.max(0, maxLineLength - line.length - (4)));
            }
        });

        return masterArray;
    }


    // region: Commands
    // ---------------------------------------------------------------------------

	disposable = vscode.commands.registerCommand('box-comment.createBox', () => insertBox(TOTAL_LINE_LENGTH));
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('box-comment.createBox80', () => insertBox(80));
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('box-comment.createBox120', () => insertBox(120));
	context.subscriptions.push(disposable);

    // endregion: Commands

}

// this method is called when your extension is deactivated
export function deactivate() {}
