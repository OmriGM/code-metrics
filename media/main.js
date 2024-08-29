const pencilIcon = `
      <svg
        class='pencil-icon'
        viewBox='0 0 16 16'
        xmlns='http://www.w3.org/2000/svg'
        fill='currentColor'
      >
        <path d='M13.23 1h-1.46L3.52 9.25l-.16.22L1 13.59 2.41 15l4.12-2.36.22-.16L15 4.23V2.77L13.23 1zM2.41 13.59l1.51-3 1.45 1.45-2.96 1.55zm3.83-2.06L4.47 9.76l8-8 1.77 1.77-8 8z' />
      </svg>
      `;

const FEATURE_FLAGS = {
  hiddenFiles: false,
};

const vscode = acquireVsCodeApi();
let hiddenItems = [];
let isHiddenListCollapsed = true;

// Listen to window resize events and set width of the metrics container
window.addEventListener('resize', () => {
  const metricsContainer = document.getElementById('metrics-container');
  metricsContainer.style.width = `${window.innerWidth - 22}px`;
});

// Listen for messages from the extension
window.addEventListener('message', (event) => {
  const message = event.data;
  switch (message.type) {
    case 'update':
      const { functions, fileName, totalLines, maxLinesThreshold } = message;
      hiddenItems = [];
      updateContent({ functions, fileName, totalLines, maxLinesThreshold });
      break;
  }
});

// TODO: Add a button to open the file in the editor when clicked, use the startLine
// and endLine to scroll to the function in the editor
document.getElementById('metrics-container').addEventListener('click', (event) => {
  const target = event.target;
  if (target.classList.contains('function-name')) {
    const functionName = target.textContent;
    vscode.postMessage({
      type: 'openFile',
      functionName,
    });
  }
});

function updateContent({ functions, fileName, totalLines, maxLinesThreshold }) {
  if (!functions || functions.length === 0) {
    document.querySelector('.file-info').textContent = `No active code editor found`;
    document.querySelector('.line-limit').textContent = '';
    document.getElementById('metrics-container').innerHTML = '';
    return;
  }

  if (totalLines > maxLinesThreshold) {
    document.body.classList.add('warning');
  } else {
    document.body.classList.remove('warning');
  }

  document.querySelector('.file-info').textContent = `File: ${fileName} (${totalLines} lines)`;
  document.querySelector('.line-limit').innerHTML = `
    <div onclick="changeMaxLines()">
      ${pencilIcon}
      Max lines: ${maxLinesThreshold}
    </div>
    `;

  updateHiddenItemsList();
  const container = document.getElementById('metrics-container');
  container.innerHTML = functions
    .map(
      ({ color, name, startLine, endLine, lineCount }, index) => `
            <div class="card-wrapper" id="card-${index}" onclick="goToLine(${startLine})">
            <div class="card ${color}">
              <div class="card-header">
                <span class="function-name">${name}</span>
                <div class="line-count" >${lineCount} <span>lines</span></div>
              </div>
              <div class="progress-container">
                <div class="progress-bar" style="width: ${(lineCount / maxLinesThreshold) * 100}%">
                    </div>
                    </div>
                    <div class="card-footer">
                    <span class="line-range">Lines: ${startLine}-${endLine}</span>
                  ${
                    FEATURE_FLAGS.hiddenFiles
                      ? `<button class="hide-button" onclick="hideCard(${index}, '${name}', ${lineCount})">Hide</button>`
                      : ''
                  }
                </div>
                </div>
            </div>
          `
    )
    .join('');
}

function goToLine(line) {
  vscode.postMessage({
    command: 'goToLine',
    line: line,
  });
}
function changeMaxLines(line) {
  vscode.postMessage({
    command: 'openSetLineCountThreshold',
  });
}

function hideCard(index, name, lineCount) {
  const card = document.getElementById(`card-${index}`);
  card.style.display = 'none';
  hiddenItems.push({ index, name, lineCount });
  updateHiddenItemsList();
}

function showCard(index) {
  event.stopPropagation(); // Prevent the card click event from firing

  const card = document.getElementById(`card-${index}`);
  card.style.display = 'block';
  hiddenItems = hiddenItems.filter((item) => item.index !== index);
  updateHiddenItemsList();
}

function toggleHiddenList() {
  if (hiddenItems.length === 0) {
    return;
  }
  isHiddenListCollapsed = !isHiddenListCollapsed;
  updateHiddenItemsList();
}
window.toggleHiddenList = toggleHiddenList;
window.goToLine = goToLine;
window.changeMaxLines = changeMaxLines;

function updateHiddenItemsList() {
  if (!FEATURE_FLAGS.hiddenFiles) {
    return;
  }
  const hiddenItemsContainer = document.getElementById('hidden-items-container');

  hiddenItemsContainer.innerHTML = `
  <div class="hidden-items-header" onclick="toggleHiddenList()">
        <h3>Hidden Items (${hiddenItems.length})</h3>
      ${
        hiddenItems.length > 0
          ? `<span class="collapse-icon">${isHiddenListCollapsed ? '▼' : '▲'}</span>`
          : ''
      }
      </div>
      <div class="hidden-items-list" style="display: ${isHiddenListCollapsed ? 'none' : 'block'}">
        ${hiddenItems
          .map(
            (item) => `
          <div class="hidden-item-card">
            <div class="hidden-item-header">
              <span class="function-name">${item.name}</span>
              <span class="line-count">${item.lineCount} lines</span>
              </div>
            <div class="hidden-item-footer">
              <button class="show-button" onclick="showCard(${item.index})">Show</button>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
        `;
}
