// === Block FileGrabber on YouTube ===
if (window.location.hostname.includes("youtube.com")) {
  console.log("[FileGrabber] Skipped on YouTube");
  return; // stop the script entirely
}
if (window.location.hostname.includes("chatgpt.com")) {
  console.log("[FileGrabber] Skipped on ChatGPT");
  return; // stop the script entirely
}

// === Add style ===
const style = document.createElement('style');
style.textContent = `
  .filegrabber-btn {
    background: #007bff;
    color: #fff;
    padding: 4px 8px;
    margin: 4px;
    font-size: 11px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    z-index: 99999;
  }
  .filegrabber-btn:hover {
    background: #0056b3;
  }
`;
document.head.appendChild(style);

// === Grab direct file links ===
document.querySelectorAll("a[href]").forEach(link => {
  const href = link.href.toLowerCase();
  if (href.match(/\.(pdf|docx|pptx|xls|xlsx|zip|rar|mp4|mp3|png|jpg|jpeg|txt)$/)) {
    const btn = document.createElement("button");
    btn.innerText = "FileGrab";
    btn.className = "filegrabber-btn";
    btn.onclick = (e) => {
      e.stopPropagation();
      chrome.runtime.sendMessage({ action: "download", url: link.href });
    };
    link.parentElement.insertBefore(btn, link.nextSibling);
  }
});

// === Iframe: Open Iframe + Download Document + Hidden Link Peek ===
document.querySelectorAll("iframe").forEach(frame => {
  const src = frame.src.toLowerCase();

  // Open Iframe button
  const openBtn = document.createElement("button");
  openBtn.innerText = "Open Iframe";
  openBtn.className = "filegrabber-btn";
  openBtn.onclick = () => window.open(frame.src, "_blank");
  frame.parentElement.insertBefore(openBtn, frame);

  // Download Document button
  const downloadBtn = document.createElement("button");
  downloadBtn.innerText = "Download Document";
  downloadBtn.className = "filegrabber-btn";
  downloadBtn.onclick = (e) => {
    e.stopPropagation();
    chrome.runtime.sendMessage({ action: "download", url: frame.src });
  };
  frame.parentElement.insertBefore(downloadBtn, openBtn.nextSibling);

  // Same-origin peek for hidden file links
  try {
    const doc = frame.contentDocument || frame.contentWindow.document;
    const links = doc.querySelectorAll("a[href]");
    links.forEach(innerLink => {
      const innerHref = innerLink.href.toLowerCase();
      if (innerHref.match(/\.(pdf|docx|pptx|xls|xlsx|zip|rar|mp4|mp3|png|jpg|jpeg|txt)$/)) {
        const hiddenBtn = document.createElement("button");
        hiddenBtn.innerText = "Grab Hidden";
        hiddenBtn.className = "filegrabber-btn";
        hiddenBtn.onclick = (e) => {
          e.stopPropagation();
          chrome.runtime.sendMessage({ action: "download", url: innerLink.href });
        };
        innerLink.parentElement.insertBefore(hiddenBtn, innerLink.nextSibling);
      }
    });
  } catch (err) {
    console.log("[FileGrabber] Cross-origin iframe — can't peek inside.");
  }
});

// === Google Drive handler (Button at Bottom) ===
if (window.location.hostname.includes("drive.google.com")) {
  const observer = new MutationObserver(() => {
    const driveBtn = document.querySelector('[aria-label="Download"], div[aria-label*="Download"]');
    if (driveBtn && !document.querySelector('.filegrabber-btn-drive')) {
      const grabBtn = document.createElement("button");
      grabBtn.innerText = "FileGrab Drive";
      grabBtn.className = "filegrabber-btn filegrabber-btn-drive";
      grabBtn.style.position = "fixed";
      grabBtn.style.bottom = "20px";
      grabBtn.style.right = "20px";
      grabBtn.style.zIndex = "99999";

      grabBtn.onclick = () => {
        driveBtn.click();
      };

      document.body.appendChild(grabBtn);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}