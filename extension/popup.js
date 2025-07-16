// FileGrabber Popup Script
document.addEventListener('DOMContentLoaded', function() {
  console.log('FileGrabber popup loaded');
  
  // Load current documents and settings
  loadDocuments();
  loadSettings();
  
  // Set up event listeners
  setupEventListeners();
});

function setupEventListeners() {
  // Refresh button
  document.getElementById('refreshBtn').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'RESCAN' });
      setTimeout(loadDocuments, 1000);
    });
  });
  
  // Settings toggles
  document.getElementById('autoDetectToggle').addEventListener('click', function() {
    toggleSetting('autoDetect', this);
  });
  
  document.getElementById('notificationsToggle').addEventListener('click', function() {
    toggleSetting('showNotifications', this);
  });
}

function loadDocuments() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs[0]) {
      chrome.runtime.sendMessage({ type: 'GET_DETECTED_DOCUMENTS' }, function(documents) {
        displayDocuments(documents || []);
      });
    }
  });
}

function displayDocuments(documents) {
  const documentsList = document.getElementById('documentsList');
  
  if (!documents || documents.length === 0) {
    documentsList.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
        <div>No documents found on this page</div>
        <div style="font-size: 10px; margin-top: 8px;">Try refreshing or navigate to a page with downloadable files</div>
      </div>
    `;
    return;
  }
  
  documentsList.innerHTML = documents.map((doc, index) => `
    <div class="document-item">
      <div class="document-info">
        <div class="document-name" title="${doc.filename}">${doc.filename}</div>
        <div class="document-type">${doc.type} • ${doc.source}</div>
      </div>
      <button class="download-btn" data-index="${index}">Download</button>
    </div>
  `).join('');
  
  // Add click listeners to download buttons
  documentsList.querySelectorAll('.download-btn').forEach(button => {
    button.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      const document = documents[index];
      
      if (document) {
        chrome.runtime.sendMessage({
          type: 'DOWNLOAD_DOCUMENT',
          data: document
        });
        
        // Visual feedback
        this.textContent = 'Downloading...';
        this.disabled = true;
        
        setTimeout(() => {
          this.textContent = 'Download';
          this.disabled = false;
        }, 2000);
      }
    });
  });
}

function loadSettings() {
  chrome.storage.local.get(['autoDetect', 'showNotifications'], function(result) {
    const autoDetectToggle = document.getElementById('autoDetectToggle');
    const notificationsToggle = document.getElementById('notificationsToggle');
    
    if (result.autoDetect !== false) {
      autoDetectToggle.classList.add('active');
    } else {
      autoDetectToggle.classList.remove('active');
    }
    
    if (result.showNotifications !== false) {
      notificationsToggle.classList.add('active');
    } else {
      notificationsToggle.classList.remove('active');
    }
  });
}

function toggleSetting(setting, toggleElement) {
  const isActive = toggleElement.classList.contains('active');
  const newValue = !isActive;
  
  // Update UI
  if (newValue) {
    toggleElement.classList.add('active');
  } else {
    toggleElement.classList.remove('active');
  }
  
  // Save setting
  chrome.storage.local.set({ [setting]: newValue });
  
  console.log(`Setting ${setting} changed to:`, newValue);
}