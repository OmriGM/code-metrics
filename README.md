# Code Metrics VSCode Extension

## Overview

Code Metrics is a VS Code extension that provides real-time analysis of function sizes in your code. Supporting JavaScript, TypeScript, Java, and Python, it helps maintain clean and maintainable code by visualizing function lengths against customizable thresholds. 

- **Real-time Function Analysis**: Automatically detects and displays functions, methods, and classes in your open files.
- **Line Count Visualization**: Shows the number of lines for each code section, along with its name and location in the file.
- **Progress Bar**: Visual representation of how close each function is to the maximum line threshold.
- **Customizable Threshold**: Set your own maximum line count to suit your team's coding standards.

## Why Code Metrics Matter

Maintaining smaller, focused functions in your codebase offers numerous benefits:

1. **Improved Readability**: Shorter functions are easier to read and understand at a glance.
2. **Enhanced Maintainability**: Smaller code units are easier to modify, test, and debug.
3. **Better Code Organization**: Encourages breaking down complex logic into manageable pieces.
4. **Reduced Cognitive Load**: Developers can focus on one specific task or concept at a time.
5. **Easier Collaboration**: Smaller functions lead to fewer merge conflicts and easier code reviews.
6. **Increased Reusability**: Well-defined, focused functions are more likely to be reusable in other parts of your codebase.

**By using the Code Metrics extension, you're taking a proactive step towards writing cleaner, more efficient code.**

## Installation

1. Open Visual Studio Code
2. Go to the Extensions view (Ctrl+Shift+X or Cmd+Shift+X)
3. Search for "Code Metrics"
4. Click Install

## Usage

1. Open a supported file (JavaScript, TypeScript, Java, or Python)
2. Navigate to the Explorer tab and find the "Code Metrics" section
3. The extension will automatically display metrics for your open file

To set a custom maximum line threshold:

- Click on the "Max lines" button in the Code Metrics view, or
- Open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P) and run "Code Metrics: Set Max Lines Count"

## Customization

You can customize the position of the Code Metrics view for easier access:

- Drag the Code Metrics view to the primary side bar to keep it always visible
- If you've moved it to the primary side bar, you can drag it back to the Explorer tab at any time


## Feedback and Contributions

Your feedback and contributions are welcome! Please feel free to submit issues or pull requests on the GitHub repository.

## License

[MIT License](LICENSE)