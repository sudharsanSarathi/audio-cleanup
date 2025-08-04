// Global variables
let selectedFile = null;
let processingStartTime = null;

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const settingsSection = document.getElementById('settingsSection');
const progressSection = document.getElementById('progressSection');
const resultsSection = document.getElementById('resultsSection');
const fileDetails = document.getElementById('fileDetails');
const processBtn = document.getElementById('processBtn');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const downloadBtn = document.getElementById('downloadBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    handleGitHubPagesRouting();
});

// Handle GitHub Pages routing for SPA
function handleGitHubPagesRouting() {
    // Check if we're on GitHub Pages and need to redirect
    if (window.location.search.startsWith('?/')) {
        // Remove the redirect query string and update the URL
        var redirect = window.location.search.slice(2).replace(/~and~/g, '&');
        window.history.replaceState(null, null, 
            window.location.pathname.slice(0, -1) + redirect + window.location.hash
        );
    }
}

function initializeEventListeners() {
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Process button
    processBtn.addEventListener('click', startProcessing);
    
    // Download button
    downloadBtn.addEventListener('click', downloadFile);
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processSelectedFile(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        processSelectedFile(file);
    }
}

function processSelectedFile(file) {
    // Validate file type
    const allowedTypes = [
        'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/aac', 'audio/ogg',
        'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'
    ];
    
    if (!allowedTypes.includes(file.type)) {
        showError('Invalid file type. Please select an audio or video file.');
        return;
    }
    
    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
        showError('File size too large. Maximum size is 100MB.');
        return;
    }
    
    selectedFile = file;
    displayFileInfo(file);
    showSection(settingsSection);
}

function displayFileInfo(file) {
    const fileSize = formatFileSize(file.size);
    const fileType = file.type.startsWith('video/') ? 'Video' : 'Audio';
    
    fileDetails.innerHTML = `
        <div class="file-detail">
            <strong>Name:</strong> ${file.name}
        </div>
        <div class="file-detail">
            <strong>Type:</strong> ${fileType}
        </div>
        <div class="file-detail">
            <strong>Size:</strong> ${fileSize}
        </div>
        <div class="file-detail">
            <strong>Format:</strong> ${file.type}
        </div>
    `;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function startProcessing() {
    if (!selectedFile) {
        showError('Please select a file first.');
        return;
    }
    
    processingStartTime = Date.now();
    
    // Get processing settings
    const enhancementLevel = document.getElementById('enhancementLevel').value;
    const processingMode = document.getElementById('processingMode').value;
    
    // Show progress section
    showSection(progressSection);
    updateProgress(0, 'Preparing file for processing...');
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('enhancementLevel', enhancementLevel);
    formData.append('processingMode', processingMode);
    
    // Start processing
    processFile(formData);
}

async function processFile(formData) {
    try {
        updateProgress(10, 'Uploading file...');
        updateStep(1, 'completed');
        updateStep(2, 'active');
        
        const response = await fetch('/api/process', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Processing failed');
        }
        
        updateProgress(50, 'Processing audio/video...');
        
        const result = await response.json();
        
        if (result.success) {
            updateProgress(100, 'Processing complete!');
            updateStep(2, 'completed');
            updateStep(3, 'active');
            
            // Store result data
            window.processedFileData = result;
            
            // Show results
            setTimeout(() => {
                showResults(result);
            }, 1000);
        } else {
            throw new Error(result.message || 'Processing failed');
        }
        
    } catch (error) {
        console.error('Processing error:', error);
        showError(`Processing failed: ${error.message}`);
        resetProgress();
    }
}

function updateProgress(percentage, text) {
    progressFill.style.width = percentage + '%';
    progressText.textContent = text;
}

function updateStep(stepNumber, status) {
    const step = document.getElementById(`step${stepNumber}`);
    step.className = `step ${status}`;
}

function showResults(result) {
    // Update stats
    document.getElementById('originalSize').textContent = formatFileSize(result.originalSize);
    document.getElementById('enhancedSize').textContent = formatFileSize(result.processedSize);
    document.getElementById('processingTime').textContent = formatProcessingTime(result.processingTime);
    
    // Show results section
    showSection(resultsSection);
}

function formatProcessingTime(ms) {
    if (ms < 1000) {
        return `${ms}ms`;
    } else if (ms < 60000) {
        return `${(ms / 1000).toFixed(1)}s`;
    } else {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}m ${seconds}s`;
    }
}

function downloadFile() {
    if (window.processedFileData && window.processedFileData.downloadUrl) {
        const link = document.createElement('a');
        link.href = window.processedFileData.downloadUrl;
        link.download = window.processedFileData.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function showSection(section) {
    // Hide all sections
    document.querySelectorAll('section').forEach(s => {
        if (s.classList.contains('upload-section') || 
            s.classList.contains('settings-section') || 
            s.classList.contains('progress-section') || 
            s.classList.contains('results-section')) {
            s.style.display = 'none';
        }
    });
    
    // Show the specified section
    section.style.display = 'block';
}

function showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    notification.querySelector('.error-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    notification.querySelector('button').style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        margin-left: 10px;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function resetProgress() {
    updateProgress(0, 'Initializing...');
    updateStep(1, 'active');
    updateStep(2, '');
    updateStep(3, '');
}

function resetApp() {
    // Reset file input
    fileInput.value = '';
    selectedFile = null;
    
    // Reset progress
    resetProgress();
    
    // Show upload section
    showSection(document.querySelector('.upload-section'));
    
    // Clear stored data
    window.processedFileData = null;
}

// Add file detail styles
const fileDetailStyles = `
    .file-detail {
        margin-bottom: 10px;
        padding: 8px 0;
        border-bottom: 1px solid rgba(102, 126, 234, 0.1);
    }
    
    .file-detail:last-child {
        border-bottom: none;
    }
    
    .file-detail strong {
        color: #667eea;
        margin-right: 10px;
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = fileDetailStyles;
document.head.appendChild(styleSheet); 