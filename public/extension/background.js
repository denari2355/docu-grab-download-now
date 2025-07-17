// Store found files
let foundFiles = [];

// Listen for downloads from content or popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "download" && msg.url) {
    chrome.downloads.download({ url: msg.url });
  }
});

// Sniff ALL requests for possible files
chrome.webRequest.onCompleted.addListener(
  function (details) {
    const url = details.url.toLowerCase();
    if (url.match(/\.(pdf|docx|pptx|xls|xlsx|zip|rar|mp4|mp3|png|jpg|jpeg|txt)$/)) {
      console.log("[FileGrabber] Found by URL:", url);
      addFoundFile(url);
    }
    if (details.responseHeaders) {
      const ct = details.responseHeaders.find(h => h.name.toLowerCase() === 'content-type');
      if (ct && ct.value && (
        ct.value.includes("application/pdf") ||
        ct.value.includes("application/msword") ||
        ct.value.includes("application/vnd")
      )) {
        console.log("[FileGrabber] Found by Content-Type:", url);
        addFoundFile(url);
      }
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);

// Save found files
function addFoundFile(url) {
  if (!foundFiles.includes(url)) {
    foundFiles.push(url);
    chrome.storage.local.set({ foundFiles: foundFiles });
  }
}

// Context menu to grab any link or media
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "filegrabber",
    title: "Download with FileGrabber",
    contexts: ["link", "image", "video", "audio"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const fileUrl = info.linkUrl || info.srcUrl;
  if (fileUrl) {
    chrome.downloads.download({ url: fileUrl });
  }
});