
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
          "description": "Grab and download any file, even hidden iframe documents",
          "permissions": [
            "downloads",
            "scripting",
            "activeTab",
            "webRequest",
            "declarativeNetRequest",
            "storage",
            "contextMenus"
          ],
          "host_permissions": ["<all_urls>"],
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
          }
        }, null, 2),

        'background.js': `// Store found files
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
    if (url.match(/\\.(pdf|docx|pptx|xls|xlsx|zip|rar|mp4|mp3|png|jpg|jpeg|txt)$/)) {
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
});`,

        'content.js': `// === Block FileGrabber on YouTube ===
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
    background: #0056b3;
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
}`,

        'popup.html': `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      width: 320px;
      min-height: 200px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-sizing: border-box;
    }
    
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.2);
      padding-bottom: 15px;
    }
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      text-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    
    .version {
      font-size: 12px;
      opacity: 0.8;
      margin-top: 5px;
    }
    
    #files {
      background: rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 15px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
    }
    
    #files p {
      margin: 8px 0;
      font-size: 13px;
      word-break: break-all;
    }
    
    button {
      background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
      color: white;
      border: none;
      padding: 8px 15px;
      margin: 5px 0;
      border-radius: 20px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      font-weight: 500;
    }
    
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    
    button:active {
      transform: translateY(0);
    }
    
    a {
      color: #FFE66D;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="header">
    <h3>FileGrabber</h3>
    <div class="version">v1.1</div>
  </div>
  
  <div id="files"></div>
</body>
<script src="popup.js"></script>
</html>`,

        'popup.js': `const filesDiv = document.getElementById("files");

// Get current active tab URL
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const url = tabs[0].url;

  // If user is on Scribd
  if (url.includes("scribd.com")) {
    filesDiv.innerHTML = \`
      <p>This page is a Scribd document.</p>
      <p>Direct download is blocked by Scribd's security.</p>
      <p>You can try this tool instead:</p>
      <a href="https://scribd.vdownloaders.com/" target="_blank">Open Scribd Downloader</a>
    \`;
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
        const match = url.match(/\\.(\\w{2,5})(\\?|$)/);
        if (match && match[1]) {
          fileName = \`[Unknown file] (.\${match[1]})\`;
        } else {
          fileName = \`[Unknown file]\`;
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
});`
      };

      // Add README file to zip
      const readmeContent = `# FileGrabber Extension

A powerful browser extension that helps you grab and download any file from web pages, including hidden iframe documents.

## Features
- Sniffs network traffic for downloadable files
- Adds download buttons to direct file links
- Handles iframe documents and hidden links
- Google Drive integration
- Context menu support
- Scribd detection with alternative download tool

## Installation
1. Download and extract the FileGrabber extension
2. Open Chrome and go to chrome://extensions/
3. Enable "Developer mode"
4. Click "Load unpacked" and select the File Grabber folder
5. The extension is now ready to use!

## Version
v1.1`;

      // Create File Grabber folder in zip
      const fileGrabberFolder = zip.folder("File Grabber");
      
      // Add all extension files to the File Grabber folder
      Object.entries(extensionFiles).forEach(([filename, content]) => {
        fileGrabberFolder.file(filename, content);
      });

      // Get icon from existing file and add to zip
      try {
        const iconResponse = await fetch('/File Grabber/icon.png');
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
