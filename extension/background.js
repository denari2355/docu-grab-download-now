// FileGrabber Background Service Worker - Manifest V3
console.log('FileGrabber background script loaded');

// Track detected documents across tabs
const detectedDocuments = new Map();

// Document patterns for detection
const documentPatterns = {
  pdf: /\.(pdf)(\?|$|#)/i,
  doc: /\.(doc|docx|rtf|odt)(\?|$|#)/i,
  spreadsheet: /\.(xls|xlsx|ods|csv)(\?|$|#)/i,
  presentation: /\.(ppt|pptx|odp)(\?|$|#)/i,
  archive: /\.(zip|rar|7z|tar|gz|bz2)(\?|$|#)/i,
  image: /\.(jpg|jpeg|png|gif|bmp|svg|webp|tiff)(\?|$|#)/i,
  video: /\.(mp4|avi|mkv|mov|wmv|flv|webm|m4v)(\?|$|#)/i,
  audio: /\.(mp3|wav|flac|aac|ogg|wma|m4a)(\?|$|#)/i,
  text: /\.(txt|md|log|json|xml|html|htm)(\?|$|#)/i
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('FileGrabber extension installed');
  
  // Set default settings
  chrome.storage.local.set({
    autoDetect: true,
    showNotifications: true,
    downloadLocation: 'default'
  });
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  switch (message.type) {
    case 'DOCUMENT_DETECTED':
      handleDocumentDetected(message.data, sender.tab);
      break;
      
    case 'DOWNLOAD_DOCUMENT':
      handleDownloadDocument(message.data, sender.tab);
      break;
      
    case 'GET_DETECTED_DOCUMENTS':
      sendResponse(detectedDocuments.get(sender.tab.id) || []);
      break;
      
    case 'IFRAME_SCAN_REQUEST':
      handleIframeScan(message.data, sender.tab);
      break;
  }
  
  return true; // Keep message channel open for async response
});

// Handle document detection
function handleDocumentDetected(documents, tab) {
  if (!tab || !tab.id) return;
  
  const tabId = tab.id;
  const existing = detectedDocuments.get(tabId) || [];
  
  // Merge new documents with existing ones
  const merged = [...existing];
  documents.forEach(newDoc => {
    if (!merged.find(doc => doc.url === newDoc.url)) {
      merged.push(newDoc);
    }
  });
  
  detectedDocuments.set(tabId, merged);
  
  // Update badge
  chrome.action.setBadgeText({
    tabId: tabId,
    text: merged.length > 0 ? merged.length.toString() : ''
  });
  
  chrome.action.setBadgeBackgroundColor({
    tabId: tabId,
    color: '#4CAF50'
  });
}

// Handle document download
async function handleDownloadDocument(documentData, tab) {
  try {
    console.log('Downloading document:', documentData);
    
    // Generate filename if not provided
    let filename = documentData.filename;
    if (!filename) {
      const url = new URL(documentData.url);
      filename = url.pathname.split('/').pop() || 'download';
      
      // Add extension if missing
      if (!filename.includes('.')) {
        const type = detectDocumentType(documentData.url);
        const extensions = {
          pdf: '.pdf',
          doc: '.doc',
          image: '.jpg',
          video: '.mp4',
          audio: '.mp3',
          text: '.txt'
        };
        filename += extensions[type] || '.file';
      }
    }
    
    // Start download
    const downloadId = await chrome.downloads.download({
      url: documentData.url,
      filename: filename,
      saveAs: false
    });
    
    console.log('Download started with ID:', downloadId);
    
    // Show notification
    chrome.storage.local.get(['showNotifications']).then(result => {
      if (result.showNotifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'FileGrabber',
          message: `Downloading: ${filename}`
        });
      }
    });
    
  } catch (error) {
    console.error('Download failed:', error);
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'FileGrabber - Download Failed',
      message: `Failed to download: ${documentData.filename || 'file'}`
    });
  }
}

// Handle iframe scanning
function handleIframeScan(iframeData, tab) {
  console.log('Scanning iframe for documents:', iframeData);
  
  // Inject scanning script into iframe if possible
  chrome.scripting.executeScript({
    target: { tabId: tab.id, frameIds: [iframeData.frameId] },
    func: scanIframeForDocuments,
    args: [iframeData]
  }).catch(error => {
    console.log('Could not scan iframe (cross-origin):', error);
    
    // Try alternative method for cross-origin iframes
    handleCrossOriginIframe(iframeData, tab);
  });
}

// Scan iframe content for documents
function scanIframeForDocuments(iframeData) {
  const documents = [];
  
  // Scan all links in iframe
  const links = document.querySelectorAll('a[href]');
  links.forEach(link => {
    const href = link.href;
    if (isDocumentUrl(href)) {
      documents.push({
        url: href,
        type: detectDocumentType(href),
        filename: getFilenameFromUrl(href),
        title: link.textContent.trim() || link.title || 'Document',
        source: 'iframe'
      });
    }
  });
  
  // Scan for embedded objects
  const embeds = document.querySelectorAll('embed[src], object[data], iframe[src]');
  embeds.forEach(embed => {
    const src = embed.src || embed.data;
    if (src && isDocumentUrl(src)) {
      documents.push({
        url: src,
        type: detectDocumentType(src),
        filename: getFilenameFromUrl(src),
        title: 'Embedded Document',
        source: 'iframe-embed'
      });
    }
  });
  
  // Send results back to background
  if (documents.length > 0) {
    chrome.runtime.sendMessage({
      type: 'DOCUMENT_DETECTED',
      data: documents
    });
  }
}

// Handle cross-origin iframe scanning
function handleCrossOriginIframe(iframeData, tab) {
  // For cross-origin iframes, we can try to analyze the src URL
  if (iframeData.src && isDocumentUrl(iframeData.src)) {
    const document = {
      url: iframeData.src,
      type: detectDocumentType(iframeData.src),
      filename: getFilenameFromUrl(iframeData.src),
      title: 'Cross-origin Document',
      source: 'iframe-src'
    };
    
    handleDocumentDetected([document], tab);
  }
}

// Utility functions
function isDocumentUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  return Object.values(documentPatterns).some(pattern => pattern.test(url));
}

function detectDocumentType(url) {
  for (const [type, pattern] of Object.entries(documentPatterns)) {
    if (pattern.test(url)) {
      return type;
    }
  }
  return 'unknown';
}

function getFilenameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return pathname.split('/').pop() || 'document';
  } catch {
    return 'document';
  }
}

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  detectedDocuments.delete(tabId);
});

// Reset badge when navigating to new page
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    detectedDocuments.delete(tabId);
    chrome.action.setBadgeText({ tabId: tabId, text: '' });
  }
});