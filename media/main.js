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

const buyMeACoffeeIcon = `
    <svg 
      width="16px" 
      height="16px" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor" 
    >
      <path d="m20.216 6.415-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 0 0-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 0 0-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 0 1-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 0 1 3.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 0 1-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 0 1-4.743.295 37.059 37.059 0 0 1-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0 0 11.343.376.483.483 0 0 1 .535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 0 1 .39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 0 1-.169.364zm-6.159 3.9c-.862.37-1.84.788-3.109.788a5.884 5.884 0 0 1-1.569-.217l.877 9.004c.065.78.717 1.38 1.5 1.38 0 0 1.243.065 1.658.065.447 0 1.786-.065 1.786-.065.783 0 1.434-.6 1.499-1.38l.94-9.95a3.996 3.996 0 0 0-1.322-.238c-.826 0-1.491.284-2.26.613z"/>
    </svg>
`;

const FEATURE_FLAGS = {
  hiddenFiles: false,
};

const vscode = acquireVsCodeApi();
let hiddenItems = [];
let isHiddenListCollapsed = true;
let currentSortOrder = "default";
let originalFunctions = [];
let currentFunctions = [];

// --- Donate phrase randomizer and tracking ---
const donatePhrases = [
  "Fuel the project 🚀",
  "Show some ❤️",
  "Help it grow!",
  "Support future features!",
];
let currentDonatePhrase = donatePhrases[Math.floor(Math.random() * donatePhrases.length)];

window.addEventListener("DOMContentLoaded", () => {
  const phraseSpan = document.getElementById("donate-phrase");
  if (phraseSpan) phraseSpan.textContent = currentDonatePhrase;

  const donateLink = document.querySelector(".donate-link");
  if (donateLink) {
    donateLink.addEventListener("click", () => {
      sendAnalytics("donationLinkClicked", { source: "link", phrase: currentDonatePhrase });
    });
  }
});

// Listen to window resize events and set width of the metrics container
window.addEventListener("resize", () => {
  const metricsContainer = document.getElementById("metrics-container");
  metricsContainer.style.width = `${window.innerWidth - 22}px`;
});

// Listen for messages from the extension
window.addEventListener("message", (event) => {
  const message = event.data;
  switch (message.type) {
    case "update":
      const { functions, fileName, totalLines, maxLinesThreshold } = message;
      hiddenItems = [];
      updateContent({ functions, fileName, totalLines, maxLinesThreshold });
      break;
  }
});

function setSortOrder(order) {
  currentSortOrder = order;
  sendAnalytics("sortButtonClicked", { order });

  // Update button states
  document.querySelectorAll(".sort-btn").forEach((btn) => btn.classList.remove("active"));
  document.getElementById(`sort-${order}`).classList.add("active");

  // Re-render with new sort order
  const sortedFunctions = getSortedFunctions(currentFunctions);
  const maxLinesThreshold = parseInt(
    document.querySelector(".line-limit div").textContent.match(/\d+/)[0]
  );
  renderFunctions(sortedFunctions, maxLinesThreshold);
}

function getSortedFunctions(functions) {
  if (currentSortOrder === "asc") {
    return [...functions].sort((a, b) => a.lineCount - b.lineCount);
  } else if (currentSortOrder === "desc") {
    return [...functions].sort((a, b) => b.lineCount - a.lineCount);
  }
  return [...originalFunctions]; // default order
}

function renderFunctions(functions, maxLinesThreshold) {
  const container = document.getElementById("metrics-container");
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
                      : ""
                  }
                </div>
                </div>
            </div>
          `
    )
    .join("");
}

function updateContent({ functions, fileName, totalLines, maxLinesThreshold }) {
  if (!functions || functions.length === 0) {
    document.querySelector(".file-info").textContent = `No active code editor found`;
    document.querySelector(".line-limit").textContent = "";
    document.querySelector(".donation").textContent = "";
    document.getElementById("metrics-container").innerHTML = "";
    return;
  }

  if (totalLines > maxLinesThreshold) {
    document.body.classList.add("warning");
  } else {
    document.body.classList.remove("warning");
  }

  document.querySelector(".file-info").textContent = `${fileName} (${totalLines} lines)`;
  document.querySelector(".line-limit").innerHTML = `
    <div onclick="changeMaxLines()">
      ${pencilIcon}
      Max lines: ${maxLinesThreshold}
    </div>
    `;

  updateHiddenItemsList();

  // Store the functions data
  originalFunctions = [...functions];
  currentFunctions = [...functions];

  // Render functions with current sort order
  const sortedFunctions = getSortedFunctions(currentFunctions);
  renderFunctions(sortedFunctions, maxLinesThreshold);
}

function goToLine(line) {
  vscode.postMessage({
    command: "goToLine",
    line: line,
  });
}
function changeMaxLines() {
  vscode.postMessage({
    command: "openSetLineCountThreshold",
  });
}

function sendAnalytics(eventName, eventProps) {
  vscode.postMessage({
    command: "sendAnalytics",
    value: { eventName, eventProps },
  });
}

function openLink() {
  sendAnalytics("donationLinkClicked", { source: "link" });
}

function hideCard(index, name, lineCount) {
  const card = document.getElementById(`card-${index}`);
  card.style.display = "none";
  hiddenItems.push({ index, name, lineCount });
  updateHiddenItemsList();
}

function showCard(index) {
  event.stopPropagation(); // Prevent the card click event from firing

  const card = document.getElementById(`card-${index}`);
  card.style.display = "block";
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
window.openLink = openLink;

function updateHiddenItemsList() {
  if (!FEATURE_FLAGS.hiddenFiles) {
    return;
  }
  const hiddenItemsContainer = document.getElementById("hidden-items-container");

  hiddenItemsContainer.innerHTML = `
  <div class="hidden-items-header" onclick="toggleHiddenList()">
        <h3>Hidden Items (${hiddenItems.length})</h3>
      ${
        hiddenItems.length > 0
          ? `<span class="collapse-icon">${isHiddenListCollapsed ? "▼" : "▲"}</span>`
          : ""
      }
      </div>
      <div class="hidden-items-list" style="display: ${isHiddenListCollapsed ? "none" : "block"}">
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
          .join("")}
      </div>
        `;
}

// Responsive: show only pencil icon when narrow
function updateLineLimitResponsive() {
  const lineLimit = document.querySelector(".line-limit");
  if (window.innerWidth <= 160) {
    lineLimit.classList.add("minimized-text");
  } else {
    lineLimit.classList.remove("minimized-text");
  }
}
window.addEventListener("resize", updateLineLimitResponsive);
updateLineLimitResponsive();
