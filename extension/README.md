# FileGrabber - Document Detector & Downloader

**Version 1.0.0**

A powerful browser extension that intelligently detects and downloads documents from any webpage, including content within iframes. Built for Chrome and Edge with Manifest V3 compliance.

## 🚀 Features

- **Smart Document Detection**: Automatically detects PDFs, DOCs, images, videos, audio files, and more
- **Iframe Support**: Scans content within iframes and embedded objects
- **One-Click Downloads**: Simple download buttons appear next to detected documents
- **Cross-Origin Support**: Uses advanced techniques to detect documents in cross-origin iframes
- **Manifest V3 Compliant**: Works with the latest browser security standards
- **Background Processing**: Uses Service Workers for efficient document detection
- **Customizable Settings**: Control auto-detection and notification preferences

## 📋 Supported File Types

- **Documents**: PDF, DOC, DOCX, RTF, ODT
- **Spreadsheets**: XLS, XLSX, ODS, CSV
- **Presentations**: PPT, PPTX, ODP
- **Archives**: ZIP, RAR, 7Z, TAR, GZ, BZ2
- **Images**: JPG, PNG, GIF, BMP, SVG, WEBP, TIFF
- **Videos**: MP4, AVI, MKV, MOV, WMV, FLV, WEBM
- **Audio**: MP3, WAV, FLAC, AAC, OGG, WMA
- **Text**: TXT, MD, LOG, JSON, XML, HTML

## 🔧 Installation

1. **Download**: Get the FileGrabber extension package
2. **Extract**: Unzip the downloaded file to a folder
3. **Open Browser**: Navigate to `chrome://extensions/` or `edge://extensions/`
4. **Developer Mode**: Enable "Developer mode" toggle
5. **Load Extension**: Click "Load unpacked" and select the extracted folder
6. **Ready**: FileGrabber will now work on all websites!

## 🎯 How It Works

1. **Auto-Detection**: FileGrabber scans webpages for downloadable documents
2. **Smart UI**: Clean download buttons appear below detected files
3. **One-Click Download**: Click to instantly save documents to your device
4. **Iframe Analysis**: Advanced scanning of embedded content and iframes

## 🛡️ Privacy & Security

- **No Data Collection**: FileGrabber doesn't collect or transmit personal data
- **Local Processing**: All document detection happens locally in your browser
- **Secure Downloads**: Uses browser's native download mechanism
- **Open Source**: Transparent code for security review

## ⚙️ Technical Details

- **Manifest Version**: 3 (Latest standard)
- **Browser Support**: Chrome, Edge, and Chromium-based browsers
- **API Usage**: 
  - `chrome.downloads` for file downloads
  - `chrome.declarativeNetRequest` for network analysis
  - `chrome.webRequest` for iframe content detection
- **Background Processing**: Service Worker for efficient operation

## 🔄 Advanced Features

### Iframe Document Detection
FileGrabber uses multiple techniques to detect documents in iframes:
- Same-origin iframe content scanning
- Cross-origin iframe source analysis
- Background script coordination for secure access

### Dynamic Content Support
- Mutation observers for real-time detection
- Periodic rescanning for dynamic websites
- Support for single-page applications (SPAs)

## 📞 Support & Issues

If you encounter any issues:
1. Try refreshing the page
2. Check that Developer mode is enabled
3. Reload the extension in browser settings
4. Ensure the website allows downloads

## 🔖 Version History

- **v1.0.0**: Initial release with full document detection and iframe support

## 🤝 Contributing

FileGrabber is built with web standards and modern JavaScript. The extension follows best practices for browser security and performance.

---

**Developed for enhanced productivity and seamless document management.**