const filesDiv = document.getElementById("files");

// Get current active tab URL
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const url = tabs[0].url;

  // If user is on Scribd
  if (url.includes("scribd.com")) {
    filesDiv.innerHTML = `
      <p>This page is a Scribd document.</p>
      <p>Direct download is blocked by Scribd's security.</p>
      <p>You can try this tool instead:</p>
      <a href="https://scribd.vdownloaders.com/" target="_blank">Open Scribd Downloader</a>
    `;
    return;
  }

  // Normal file grabber logic
  chrome.storage.local.get("foundFiles", (data) => {
    const files = data.foundFiles || [];
    if (files.length === 0) {
      filesDiv.innerText = "No files sniffed yet.";
      return;
    }

    files.forEach(url => {
      let fileName = url.split('/').pop().split('?')[0];
      if (!fileName || fileName.length === 0) {
        const match = url.match(/\.(\w{2,5})(\?|$)/);
        if (match && match[1]) {
          fileName = `[Unknown file] (.${match[1]})`;
        } else {
          fileName = `[Unknown file]`;
        }
      }

      const p = document.createElement("p");
      p.textContent = fileName;
      const btn = document.createElement("button");
      btn.innerText = "Download";
      btn.onclick = () => {
        chrome.runtime.sendMessage({ action: "download", url: url });
      };
      filesDiv.appendChild(p);
      filesDiv.appendChild(btn);
    });
  });
});