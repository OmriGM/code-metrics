export interface FunctionInfo {
  name: string;
  lineCount: number;
  startLine: number;
  endLine: number;
  color: string;
}

export type SupportedLanguage =
  | 'javascript'
  | 'javascriptreact'
  | 'typescript'
  | 'typescriptreact'
  | 'python'
  | 'java'
  | 'go'
  | 'rust'
  | 'php';

// Copied from tree-sitter language bindings
type BaseNode = {
  type: string;
  named: boolean;
};

type ChildNode = {
  multiple: boolean;
  required: boolean;
  types: BaseNode[];
};

type NodeInfo =
  | (BaseNode & {
      subtypes: BaseNode[];
    })
  | (BaseNode & {
      fields: { [name: string]: ChildNode };
      children: ChildNode[];
    });

export type Language = {
  name: string;
  language: unknown;
  nodeTypeInfo: NodeInfo[];
};
