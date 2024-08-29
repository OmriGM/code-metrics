import * as vscode from 'vscode';
import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';
import * as path from 'path';
import { debounce } from 'lodash';

interface FunctionInfo {
  name: string;
  lineCount: number;
  startLine: number;
  endLine: number;
  color: string;
}

let webviewPanel: vscode.WebviewPanel | undefined;
let currentDocument: vscode.TextDocument | undefined;
let parser: Parser;

// Constants for line count thresholds
const LINE_COUNT_THRESHOLD = 30;
const GREEN_THRESHOLD = 0.5;
const YELLOW_THRESHOLD = 0.7;
const ORANGE_THRESHOLD = 0.9;

export async function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "code-metric" is now active!');

  parser = new Parser();
  parser.setLanguage(JavaScript);

  let disposable = vscode.commands.registerCommand('code-metric.showMetrics', () => {
    createWebviewPanel(context.extensionUri);
    if (vscode.window.activeTextEditor) {
      currentDocument = vscode.window.activeTextEditor.document;
      parseDocument(currentDocument, context);
    }
  });

  context.subscriptions.push(disposable);

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        currentDocument = editor.document;
        parseDocument(currentDocument, context);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(
      debounce((event: vscode.TextDocumentChangeEvent) => {
        if (event.document === currentDocument) {
          parseDocument(currentDocument, context);
        }
      }, 300)
    )
  );
}

function createWebviewPanel(extensionUri: vscode.Uri) {
  if (webviewPanel) {
    webviewPanel.reveal();
  } else {
    webviewPanel = vscode.window.createWebviewPanel(
      'codeMetricsLive',
      'Code Metrics Live',
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        localResourceRoots: [extensionUri],
      }
    );

    webviewPanel.onDidDispose(() => {
      webviewPanel = undefined;
    });
  }
}

function parseDocument(document: vscode.TextDocument, context: vscode.ExtensionContext) {
  if (document.languageId !== 'javascript' && document.languageId !== 'typescript') {
    updateWebView(context, []);
    return;
  }

  const sourceCode = document.getText();
  const tree = parser.parse(sourceCode);

  const functions: FunctionInfo[] = [];
  tree.rootNode
    .descendantsOfType(['function_declaration', 'method_definition', 'arrow_function'])
    .forEach((node) => {
      functions.push(analyzeFunctionNode(node, sourceCode, document));
    });

  updateWebView(context, functions);
}

function analyzeFunctionNode(
  node: Parser.SyntaxNode,
  sourceCode: string,
  document: vscode.TextDocument
): FunctionInfo {
  let name: string;
  if (node.type === 'arrow_function') {
    const parent = node.parent;
    if (parent?.type === 'variable_declarator') {
      name = parent.childForFieldName('name')?.text || '(anonymous)';
    } else if (parent?.type === 'pair' && parent.parent?.type === 'object') {
      name = parent.childForFieldName('key')?.text || '(anonymous)';
    } else {
      name = '(anonymous)';
    }
  } else {
    name = node.childForFieldName('name')?.text || '(anonymous)';
  }

  const startPosition = node.startPosition;
  const endPosition = node.endPosition;
  const startLine = startPosition.row;
  const endLine = endPosition.row;
  const lineCount = endLine - startLine + 1;

  const ratio = lineCount / LINE_COUNT_THRESHOLD;
  let color = 'green';
  if (ratio > ORANGE_THRESHOLD) color = 'red';
  else if (ratio > YELLOW_THRESHOLD) color = 'orange';
  else if (ratio > GREEN_THRESHOLD) color = 'yellow';

  return { name, lineCount, startLine: startLine + 1, endLine: endLine + 1, color };
}

function updateWebView(context: vscode.ExtensionContext, functions: FunctionInfo[]) {
  if (!webviewPanel || !currentDocument) return;

  const fileName = path.basename(currentDocument.fileName);
  const totalLines = currentDocument.lineCount;

  const cardComponents = functions
    .map(
      (func) => `
        <div class="card ${func.color}">
            <div class="card-header">
                <h3 class="function-name">${escapeHtml(func.name)}</h3>
                <button class="magic-refactor-btn" onclick="magicRefactor('${func.name}', ${
        func.startLine
      }, ${func.endLine})">
                    Magic Refactor
                </button>
            </div>
            <p class="line-range">Lines: ${func.startLine}-${func.endLine}</p>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${
                  (func.lineCount / LINE_COUNT_THRESHOLD) * 100
                }%"></div>
            </div>
            <p class="line-count">${func.lineCount} lines</p>
        </div>
    `
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Metrics Live</title>
    <style>
                body { 
                    font-family: var(--vscode-font-family);
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    padding: 20px;
                }
                .file-info-container {
                  display: flex;
                  justify-content: space-between;
                    color: var(--vscode-descriptionForeground);
                    margin-bottom: 20px;
										font-size: 22px
                }
                .line-limit {
										font-size: 16px
                }
										.card-header {
										display: flex;
										justify-content: space-between;
										align-items: center;
										}
                .card {
                    background-color: #333338;
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 4px;
                    padding: 10px;
                    margin-bottom: 10px;
                }
                .function-name {
                    color: var(--vscode-editor-foreground);
                    background-color: var(--vscode-editorGroupHeader-tabsBackground);
                    padding: 5px;
                    border-top-left-radius: 4px;
                    border-top-right-radius: 4px;
                }
                .line-range, .line-count {
                    color: var(--vscode-descriptionForeground);
                }
                .progress-container {
                    background-color: var(--vscode-input-background);
                    border-radius: 4px;
                    height: 8px;
                    overflow: hidden;
                }
                .progress-bar {
                    height: 100%;
                    transition: width 2s ease-in-out;
                }
                .card.green .progress-bar { background-color: var(--vscode-charts-green); }
                .card.yellow .progress-bar { background-color: var(--vscode-charts-yellow); }
                .card.orange .progress-bar { background-color: var(--vscode-charts-orange); }
                .card.red .progress-bar { background-color: var(--vscode-charts-red); }
                .hidden-items {
                    background-color: var(--vscode-editor-inactiveSelectionBackground);
                    padding: 10px;
                    border-radius: 4px;
                }
                .hidden-item {
                    color: var(--vscode-editor-foreground);
                    margin: 5px 0;
                }
                button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 5px 10px;
                    border-radius: 2px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
					.magic-refactor-btn {
            display: flex;
            align-items: center;
            gap: 5px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
						height: 20px;
            padding: 5px 10px;
            border-radius: 2px;
            cursor: pointer;
            font-size: 12px;
        }
        .magic-refactor-btn:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
</style>
</head>
<body>
		<div class="file-info-container">
    <span>File: ${escapeHtml(fileName)} (${totalLines} total lines)</span>
    <span class="line-limit">Code component lines limit: ${LINE_COUNT_THRESHOLD}</span>
    </div>
    <div id="metrics-container">
        ${cardComponents}
    </div>
    <script>
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const addedNodes = mutation.addedNodes;
                    addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('card')) {
                            const progressBar = node.querySelector('.progress-bar');
                            if (progressBar) {
                                progressBar.style.width = '0%';
                                setTimeout(() => {
                                    progressBar.style.width = progressBar.parentElement.dataset.width;
                                }, 300);
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.getElementById('metrics-container'), { childList: true, subtree: true });
    </script>
</body>
</html>
  `;

  webviewPanel.webview.html = html;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function deactivate() {}
