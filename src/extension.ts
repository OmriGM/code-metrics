import { debounce } from 'lodash';
import * as vscode from 'vscode';
import { CodeMetricsViewProvider } from './codeMetricsViewProvider';
import { mixpanelService } from './mixpanel';

export function activate(context: vscode.ExtensionContext) {
  const provider = new CodeMetricsViewProvider(context.extensionUri);
  mixpanelService.init();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(CodeMetricsViewProvider.viewType, provider)
  );

  const setLineCountThresholdCommand = vscode.commands.registerCommand(
    'codeMetrics.setLineCountThreshold',
    async () => {
      const result = await vscode.window.showInputBox({
        prompt: 'Enter the new max lines threshold',
        validateInput: (value) => {
          const num = parseInt(value);
          return isNaN(num) || num <= 0 ? 'Please enter a positive number' : null;
        },
      });

      if (result) {
        const threshold = parseInt(result);
        await vscode.workspace
          .getConfiguration()
          .update('codeMetrics.lineCountThreshold', threshold, true);
        provider.updateThreshold(threshold);
        vscode.window.showInformationMessage(`Line count threshold set to ${threshold}`);

        mixpanelService.trackEvent('Action', {
          type: 'lineCountThresholdChanged',
          label: 'Line count threshold changed',
          value: `${threshold}`,
        });

        // Trigger an update of the current document
        if (vscode.window.activeTextEditor) {
          provider.updateContent(vscode.window.activeTextEditor.document);
        }
      }
    }
  );
  context.subscriptions.push(setLineCountThresholdCommand);

  setUpdateWebviewContentListeners(provider);
}

function setUpdateWebviewContentListeners(provider: CodeMetricsViewProvider) {
  // Update content when the active editor changes
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      provider.updateContent(editor.document);
    } else {
      provider.updateContent(); // No active editor
    }
  });

  // Update content when the document changes
  vscode.workspace.onDidChangeTextDocument(
    debounce((event) => {
      if (event.document === vscode.window.activeTextEditor?.document) {
        provider.updateContent(event.document);
      }
    }, 200)
  );

  // Initial update if there's an active editor
  provider.updateContent(vscode.window.activeTextEditor?.document);
}

// Make sure to export deactivate function
export function deactivate() {}
