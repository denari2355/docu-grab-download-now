
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';

interface ExtensionFile {
  name: string;
  url: string;
  size?: number;
}

interface DownloadResponse {
  version: string;
  files: ExtensionFile[];
  downloadCount: number;
}

export const useExtensionDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const downloadExtension = async () => {
    try {
      setIsDownloading(true);

      toast({
        title: "Starting download...",
        description: "Preparing your FileGrabber extension",
      });

      // Create a new JSZip instance
      const zip = new JSZip();

      // Extension files content
      const extensionFiles = {
        'manifest.json': JSON.stringify({
          "manifest_version": 3,
          "name": "FileGrabber",
          "version": "1.1",
          "description": "Grab and download any file, even hidden documents.",
          "permissions": [
            "downloads",
            "scripting",
            "activeTab",
            "webRequest",
            "declarativeNetRequest",
            "storage",
            "contextMenus"
          ],
          "host_permissions": [
            "<all_urls>"
          ],
          "background": {
            "service_worker": "background.js"
          },
          "content_scripts": [
            {
              "matches": ["<all_urls>"],
              "js": ["content.js"]
            }
          ],
          "action": {
            "default_popup": "popup.html",
            "default_icon": {
              "16": "icon.png",
              "48": "icon.png",
              "128": "icon.png"
            }
          },
          "icons": {
            "16": "icon.png",
            "48": "icon.png",
            "128": "icon.png"
          },
          "commands": {
            "grab-now": {
              "suggested_key": {
                "default": "Ctrl+Shift+G"
              },
              "description": "Grab files now"
            }
          }
        }, null, 2),

        'background.js': `let foundFiles = [];

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "download" && msg.url) {
    if (isValidURL(msg.url)) {
      chrome.downloads.download({ url: msg.url });
    }
  }

  if (msg.action === "setBadge") {
    const count = msg.count || 0;
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: "#0078d4" });
  }
});

chrome.webRequest.onCompleted.addListener(
  function (details) {
    const url = details.url.toLowerCase();
    if (url.match(/\\.(pdf|docx|pptx|xls|xlsx|zip|rar|mp4|mp3|png|jpg|jpeg|txt)$/)) {
      console.log("[FileGrabber] Found by URL:", url);
      addFoundFile(url);
    }

    const ct = details.responseHeaders?.find(h => h.name.toLowerCase() === 'content-type');
    if (ct && ct.value && (
      ct.value.includes("application/pdf") ||
      ct.value.includes("application/msword") ||
      ct.value.includes("application/vnd")
    )) {
      console.log("[FileGrabber] Found by Content-Type:", url);
      addFoundFile(url);
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);

function addFoundFile(url) {
  if (!foundFiles.includes(url)) {
    foundFiles.push(url);
    chrome.storage.local.set({ foundFiles });
    chrome.action.setBadgeText({ text: foundFiles.length.toString() });
  }
}

function isValidURL(url) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "filegrabber",
    title: "Download with FileGrabber",
    contexts: ["link", "image", "video", "audio"]
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  const fileUrl = info.linkUrl || info.srcUrl;
  if (fileUrl && isValidURL(fileUrl)) {
    chrome.downloads.download({ url: fileUrl });
  }
});

// Shortcut support: Ctrl+Shift+G
chrome.commands.onCommand.addListener((command) => {
  if (command === "grab-now") {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ["content.js"]
        });
      }
    });
  }
});`,

        'content.js': `// === Add style ===
const style = document.createElement('style');
style.textContent = \`
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
    background: #064992ff;
  }
\`;
document.head.appendChild(style);

// === Grab direct file links ===
document.querySelectorAll("a[href]").forEach(link => {
  const href = link.href.toLowerCase();
  if (href.match(/\\.(pdf|docx|pptx|xls|xlsx|zip|rar|mp4|mp3|png|jpg|jpeg|txt)$/)) {
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
      if (innerHref.match(/\\.(pdf|docx|pptx|xls|xlsx|zip|rar|mp4|mp3|png|jpg|jpeg|txt)$/)) {
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

// === Google Drive handler ===
if (window.location.hostname.includes("drive.google.com")) {
  const observer = new MutationObserver(() => {
    const driveBtn = document.querySelector('[aria-label="Download"], div[aria-label*="Download"]');
    if (driveBtn && !document.querySelector('.filegrabber-btn-drive')) {
      const grabBtn = document.createElement("button");
      grabBtn.innerText = "FileGrab Drive";
      grabBtn.className = "filegrabber-btn filegrabber-btn-drive";
      grabBtn.onclick = () => {
        driveBtn.click();
      };
      document.body.appendChild(grabBtn);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}`,

        'popup.html': `<!DOCTYPE html>
<html lang="en">
<div id="loading" style="display:none; text-align:center; margin-top:10px;">
  <div class="spinner"></div>
</div>
<head>
  <meta charset="UTF-8" />
  <title>FileGrabber</title>
<style>
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    padding: 15px;
    width: 320px;
    background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
    color: #f0f0f0;
    min-height: 100vh;
    box-sizing: border-box;
  }

  h3 {
    margin-top: 0;
    color: #4FC3F7;
    font-size: 20px;
    text-shadow: 1px 1px 2px #000;
  }

  h5 {
    color: #90caf9;
    margin-top: -10px;
    margin-bottom: 15px;
  }

  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    margin-bottom: 10px;
    padding: 10px 14px;
    font-size: 13px;
    backdrop-filter: blur(6px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  }

  button {
    background: linear-gradient(to right, #1e88e5, #42a5f5);
    border: none;
    color: #fff;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background 0.3s ease;
  }

  button:hover {
    background: linear-gradient(to right, #1565c0, #1e88e5);
  }

  .message {
    background: rgba(255, 244, 206, 0.2);
    border: 1px solid #ffe399;
    border-radius: 5px;
    padding: 10px;
    font-size: 12px;
    margin-top: 10px;
    color: #fff9c4;
  }

  a {
    color: #90caf9;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
  .spinner {
  border: 3px solid #ccc;
  border-top: 3px solid #4FC3F7;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 0.8s linear infinite;
  margin: auto;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

</style>

</head>
<body>
  <h3>📂 FileGrabber</h3>
  <h5>Version 1.1</h5>
  <div id="files"></div>
  
</body>

<script src="popup.js"></script>
</html>`,

        'popup.js': `const filesDiv = document.getElementById("files");
const loadingDiv = document.getElementById("loading");

// Show loading spinner
loadingDiv.style.display = "block";

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const url = tabs[0].url;

  // Special message for blocked sites
  if (url.includes("scribd.com") || url.includes("studocu.com")) {
    loadingDiv.style.display = "none";
    filesDiv.innerHTML = \`
      <div class="message">
        <p>This site blocks direct downloads.</p>
        <p>Tip: Download IDM, then right-click the document and choose <strong>Download with IDM</strong>.</p>
        <p>This works for Scribd and StuDocu.</p>
      </div>
    \`;
    return;
  }

  // Normal file grabber logic
  chrome.storage.local.get("foundFiles", (data) => {
    loadingDiv.style.display = "none";
    const files = data.foundFiles || [];

    updateBadge(files.length);
    saveToHistory(files);

    if (files.length === 0) {
      filesDiv.innerText = "No files sniffed yet.";
      return;
    }

    files.forEach(url => {
      if (!isValidURL(url)) return;

      let fileName = url.split('/').pop().split('?')[0];
      if (!fileName || fileName.length === 0) {
        const match = url.match(/\\.(\\w{2,5})(\\?|$)/);
        fileName = match ? \`[Unknown file] (.\${match[1]})\` : \`[Unknown file]\`;
      }

      const fileItem = document.createElement("div");
      fileItem.className = "file-item";

      const nameSpan = document.createElement("span");
      nameSpan.textContent = fileName;

      const btn = document.createElement("button");
      btn.innerText = "Download";
      btn.onclick = () => {
        chrome.runtime.sendMessage({ action: "download", url });
      };

      fileItem.appendChild(nameSpan);
      fileItem.appendChild(btn);
      filesDiv.appendChild(fileItem);
    });
  });
});

function isValidURL(url) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function saveToHistory(files) {
  const timestamp = Date.now();
  const entries = files.map(url => ({
    name: url.split('/').pop().split('?')[0] || "Unknown",
    url,
    time: timestamp
  }));

  chrome.storage.local.get({ fileHistory: [] }, (data) => {
    const updated = [...data.fileHistory, ...entries].slice(-100);
    chrome.storage.local.set({ fileHistory: updated });
  });
}

function updateBadge(count) {
  chrome.runtime.sendMessage({ action: "setBadge", count });
}`
      };

      // Add README file to zip
      const readmeContent = `=============Provided by: fgrabber.onrender.com=============
(The extension is in the folder named File Grabber)

HOW TO LOAD THE EXTENSION ON A BROWSER:
___________________________
1. Go to your browser and go to the extensions page (on edge: edge://extensions on chrome: chrome://extensions)

2. Enable developer mode

3.Press 'LOAD UNPACKED' and keep the folder named 'File Grabber'    Note: (Do not keep the folder named file grabber extension)

4.All steps must be followed for the extension to show on your browser


HOW TO USE THE EXTENSION ON A BROWSER:

___________________________  
1. Go to a site with a document you want to download but cant download.

2. A small blue box will appear next to the link to the file. (On some files the box will not show because the document is encrypted, read below to know what to do )

3. Press 'grab file'

4. The download will start.



----------------------------------------------------------------------------------------------------
1. On some sites where the document is in the site, a button 'Open Iframe' and 'Download document' will appear (When iframe is pressed it will vopen and view the document in a new tab)

2.When the button download document is pressed, it will download a document called 'preview.htm' , this is only for specific sites (like revision sites for cbc/cbe )

3. When you open the download, it will direct you to a page that says 'Preview not available' and a download button

4. Press the download button and the document will start downloading.

5. Use it responsibly and make sure you read the terms and conditions of websites before using the it

----------------------------------------------------------------------------------------------------

1. Also on sites with iframe, press 'Open Iframe' and it will show a preview of the file on drive or any other platform, press an icon on the top right and it will open the file again with drive, but now it will show the icon to download.

2. This is the easiest method to download the document.

3. We recommend using the extesnion on revision sites and newsblaze for revision materials and news



********************************
For any questions visit: fgrabber.onrender.com`;

      // Create File Grabber folder in zip
      const fileGrabberFolder = zip.folder("File Grabber");
      
      // Add all extension files to the File Grabber folder
      Object.entries(extensionFiles).forEach(([filename, content]) => {
        fileGrabberFolder.file(filename, content);
      });

      // Add the uploaded icon
      try {
        const iconResponse = await fetch('/lovable-uploads/736d3859-6988-42b3-b33f-7b1ad346d73b.png');
        if (iconResponse.ok) {
          const iconBlob = await iconResponse.blob();
          fileGrabberFolder.file('icon.png', iconBlob);
        }
      } catch (err) {
        console.log('Could not load icon, skipping...');
      }

      // Add README to root of zip
      zip.file("README.txt", readmeContent);

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      // Create download link
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'FileGrabber-Extension.zip';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download complete!",
        description: "FileGrabber extension downloaded successfully",
      });

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the extension. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    downloadExtension,
    isDownloading
  };
};
