// FileGrabber Content Script
console.log('FileGrabber content script loaded on:', window.location.href);

let detectedDocuments = [];
let isScanning = false;

// Document type patterns
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

function initialize() {
  console.log('Initializing FileGrabber...');
  
  // Start document detection
  startDocumentDetection();
  
  // Set up mutation observer for dynamic content
  setupMutationObserver();
  
  // Scan for iframes
  scanIframes();
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener(handleMessage);
}

function startDocumentDetection() {
  if (isScanning) return;
  isScanning = true;
  
  try {
    // Scan current page
    scanForDocuments();
    
    // Re-scan periodically for dynamic content
    setTimeout(() => {
      isScanning = false;
      startDocumentDetection();
    }, 3000);
    
  } catch (error) {
    console.error('Error during document detection:', error);
    isScanning = false;
  }
}

function scanForDocuments() {
  const documents = [];
  
  // Scan all links
  const links = document.querySelectorAll('a[href]');
  links.forEach((link, index) => {
    const href = link.href;
    if (isDocumentUrl(href)) {
      const doc = {
        url: href,
        type: detectDocumentType(href),
        filename: getFilenameFromUrl(href),
        title: link.textContent.trim() || link.title || link.getAttribute('download') || 'Document',
        element: link,
        elementId: `fg-link-${index}`,
        source: 'link'
      };
      
      documents.push(doc);
      addDownloadButton(link, doc);
    }
  });
  
  // Scan embedded objects
  const embeds = document.querySelectorAll('embed[src], object[data]');
  embeds.forEach((embed, index) => {
    const src = embed.src || embed.data;
    if (src && isDocumentUrl(src)) {
      const doc = {
        url: src,
        type: detectDocumentType(src),
        filename: getFilenameFromUrl(src),
        title: embed.title || 'Embedded Document',
        element: embed,
        elementId: `fg-embed-${index}`,
        source: 'embed'
      };
      
      documents.push(doc);
      addDownloadButton(embed, doc);
    }
  });
  
  // Scan iframe sources
  const iframes = document.querySelectorAll('iframe[src]');
  iframes.forEach((iframe, index) => {
    const src = iframe.src;
    if (src && isDocumentUrl(src)) {
      const doc = {
        url: src,
        type: detectDocumentType(src),
        filename: getFilenameFromUrl(src),
        title: iframe.title || 'Iframe Document',
        element: iframe,
        elementId: `fg-iframe-${index}`,
        source: 'iframe'
      };
      
      documents.push(doc);
      addDownloadButton(iframe, doc);
    }
  });
  
  // Update detected documents
  detectedDocuments = documents;
  
  // Send to background script
  if (documents.length > 0) {
    chrome.runtime.sendMessage({
      type: 'DOCUMENT_DETECTED',
      data: documents.map(doc => ({
        url: doc.url,
        type: doc.type,
        filename: doc.filename,
        title: doc.title,
        source: doc.source
      }))
    });
  }
}

function addDownloadButton(element, document) {
  // Skip if button already exists
  const existingButton = element.parentNode.querySelector(`[data-fg-doc="${document.elementId}"]`);
  if (existingButton) return;
  
  // Create download button
  const downloadButton = createDownloadButton(document);
  
  // Position button based on element type
  if (element.tagName.toLowerCase() === 'iframe') {
    // For iframes, add button as overlay
    addIframeButton(element, downloadButton);
  } else {
    // For links and embeds, add button after element
    element.parentNode.insertBefore(downloadButton, element.nextSibling);
  }
}

function createDownloadButton(document) {
  const button = document.createElement('div');
  button.className = 'fg-download-button';
  button.setAttribute('data-fg-doc', document.elementId);
  
  button.innerHTML = `
    <div class="fg-button-container">
      <button class="fg-download-btn" title="Download ${document.filename}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download
      </button>
      <button class="fg-close-btn" title="Hide button">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="fg-file-info">
      <span class="fg-file-type">${document.type.toUpperCase()}</span>
      <span class="fg-file-name">${document.filename}</span>
    </div>
  `;
  
  // Add event listeners
  const downloadBtn = button.querySelector('.fg-download-btn');
  const closeBtn = button.querySelector('.fg-close-btn');
  
  downloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    downloadDocument(document);
  });
  
  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    button.remove();
  });
  
  return button;
}

function addIframeButton(iframe, button) {
  // Create container for iframe overlay
  const container = document.createElement('div');
  container.className = 'fg-iframe-container';
  container.style.position = 'relative';
  container.style.display = 'inline-block';
  
  // Wrap iframe
  iframe.parentNode.insertBefore(container, iframe);
  container.appendChild(iframe);
  
  // Style button for overlay
  button.classList.add('fg-iframe-overlay');
  container.appendChild(button);
}

function downloadDocument(document) {
  console.log('Downloading document:', document);
  
  chrome.runtime.sendMessage({
    type: 'DOWNLOAD_DOCUMENT',
    data: {
      url: document.url,
      filename: document.filename,
      type: document.type,
      title: document.title
    }
  });
  
  // Visual feedback
  const button = document.element.parentNode.querySelector(`[data-fg-doc="${document.elementId}"]`);
  if (button) {
    const downloadBtn = button.querySelector('.fg-download-btn');
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<span>Downloading...</span>';
    downloadBtn.disabled = true;
    
    setTimeout(() => {
      downloadBtn.innerHTML = originalText;
      downloadBtn.disabled = false;
    }, 2000);
  }
}

function scanIframes() {
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe, index) => {
    try {
      // Try to access iframe content (same-origin)
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      if (iframeDoc) {
        scanIframeContent(iframe, index);
      }
    } catch (error) {
      // Cross-origin iframe - send info to background for analysis
      chrome.runtime.sendMessage({
        type: 'IFRAME_SCAN_REQUEST',
        data: {
          src: iframe.src,
          frameId: index,
          title: iframe.title || ''
        }
      });
    }
  });
}

function scanIframeContent(iframe, frameIndex) {
  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const documents = [];
    
    // Scan iframe links
    const links = iframeDoc.querySelectorAll('a[href]');
    links.forEach(link => {
      const href = link.href;
      if (isDocumentUrl(href)) {
        documents.push({
          url: href,
          type: detectDocumentType(href),
          filename: getFilenameFromUrl(href),
          title: link.textContent.trim() || 'Iframe Document',
          source: 'iframe-content'
        });
      }
    });
    
    if (documents.length > 0) {
      chrome.runtime.sendMessage({
        type: 'DOCUMENT_DETECTED',
        data: documents
      });
    }
  } catch (error) {
    console.log('Could not scan iframe content:', error);
  }
}

function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    let shouldRescan = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            // Check if new links or embeds were added
            if (node.matches && (
              node.matches('a[href]') ||
              node.matches('embed[src]') ||
              node.matches('object[data]') ||
              node.matches('iframe[src]') ||
              node.querySelector('a[href], embed[src], object[data], iframe[src]')
            )) {
              shouldRescan = true;
            }
          }
        });
      }
    });
    
    if (shouldRescan && !isScanning) {
      setTimeout(scanForDocuments, 1000);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function handleMessage(message, sender, sendResponse) {
  switch (message.type) {
    case 'GET_DOCUMENTS':
      sendResponse(detectedDocuments);
      break;
      
    case 'RESCAN':
      scanForDocuments();
      break;
  }
  
  return true;
}

// Utility functions
function isDocumentUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Skip javascript: and data: URLs
  if (url.startsWith('javascript:') || url.startsWith('data:')) return false;
  
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
    const filename = pathname.split('/').pop();
    
    // Clean up filename
    if (filename && filename.includes('.')) {
      return decodeURIComponent(filename).split('?')[0].split('#')[0];
    }
    
    return 'document';
  } catch {
    return 'document';
  }
}