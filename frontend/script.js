// State
let sessionId = null;
let apiKey = null;

// DOM Elements
const uploadCard = document.getElementById('uploadCard');
const chatOverlay = document.getElementById('chatOverlay');
const uploadBtn = document.getElementById('uploadBtn');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const fileInput = document.getElementById('fileInput');
const apiKeyInput = document.getElementById('apiKey');
const questionInput = document.getElementById('questionInput');
const messagesContainer = document.getElementById('messagesContainer');
const documentNameEl = document.getElementById('documentName');
const uploadStatus = document.getElementById('uploadStatus');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const fileNameSpan = document.getElementById('fileName');

// API Base URL
const API_BASE = window.location.origin;

// Event Listeners
uploadBtn.addEventListener('click', handleUpload);
sendBtn.addEventListener('click', handleSendQuestion);
clearBtn.addEventListener('click', handleClear);

questionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendQuestion();
    }
});

// File input change handler
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileNameSpan.textContent = file.name;
    } else {
        fileNameSpan.textContent = 'Click to browse or drag & drop';
    }
});

// Show loading overlay
function showLoading(message = 'Processing...') {
    loadingText.textContent = message;
    loadingOverlay.classList.add('active');
}

// Hide loading overlay
function hideLoading() {
    loadingOverlay.classList.remove('active');
}

// Show status message
function showStatus(message, type = 'info') {
    uploadStatus.textContent = message;
    uploadStatus.className = `status-message ${type}`;
}

// Hide status message
function hideStatus() {
    uploadStatus.className = 'status-message';
}

// Handle document upload
async function handleUpload() {
    const file = fileInput.files[0];
    apiKey = apiKeyInput.value.trim();

    // Validation
    if (!apiKey) {
        showStatus('Please enter your Google Gemini API key', 'error');
        return;
    }

    if (!file) {
        showStatus('Please select a file', 'error');
        return;
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
        showStatus('File too large. Maximum size: 50MB', 'error');
        return;
    }

    try {
        showLoading('Processing your document...');
        hideStatus();

        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);

        // Upload
        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Upload failed');
        }

        // Success
        sessionId = data.session_id;
        documentNameEl.textContent = data.filename;

        // Show chat interface
        chatOverlay.classList.add('active');

    } catch (error) {
        console.error('Upload error:', error);
        showStatus(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Handle sending question
async function handleSendQuestion() {
    const question = questionInput.value.trim();

    if (!question) {
        return;
    }

    if (!sessionId) {
        return;
    }

    // Disable input while processing
    questionInput.disabled = true;
    sendBtn.disabled = true;

    // Add user message to chat
    addMessage('user', question);

    // Clear input
    questionInput.value = '';

    try {
        // Create FormData
        const formData = new FormData();
        formData.append('session_id', sessionId);
        formData.append('question', question);

        // Ask question
        const response = await fetch(`${API_BASE}/ask`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Failed to get answer');
        }

        // Add assistant message to chat
        addMessage('assistant', data.answer, data.sources);

    } catch (error) {
        console.error('Question error:', error);
        addMessage('assistant', `Error: ${error.message}`, []);
    } finally {
        // Re-enable input
        questionInput.disabled = false;
        sendBtn.disabled = false;
        questionInput.focus();
    }
}

// Add message to chat
function addMessage(role, content, sources = null) {
    // Remove welcome message if it exists
    const welcomeMsg = messagesContainer.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const header = document.createElement('div');
    header.className = 'message-header';

    if (role === 'user') {
        header.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm0 2c-4 0-6 2-6 4v2h12v-2c0-2-2-4-6-4z"/>
            </svg>
            You
        `;
    } else {
        header.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 108 8 8 8 0 00-8-8zm0 14a6 6 0 116-6 6 6 0 01-6 6z"/>
                <path d="M6.5 7a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3a.5.5 0 01.5-.5zm3 0a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3a.5.5 0 01.5-.5z"/>
            </svg>
            IntelliDoc AI
        `;
    }

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;

    messageDiv.appendChild(header);
    messageDiv.appendChild(messageContent);

    // Add sources if available
    if (sources && sources.length > 0) {
        const sourcesDiv = document.createElement('div');
        sourcesDiv.className = 'sources';

        const sourcesHeader = document.createElement('div');
        sourcesHeader.className = 'sources-header';
        sourcesHeader.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" style="display: inline; margin-right: 4px;">
                <path d="M9 4H5a1 1 0 000 2h4a1 1 0 000-2zM9 7H5a1 1 0 000 2h4a1 1 0 000-2z"/>
                <path d="M11 0H3a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V2a2 2 0 00-2-2zm0 12H3V2h8v10z"/>
            </svg>
            Source References
        `;
        sourcesDiv.appendChild(sourcesHeader);

        sources.forEach((source, index) => {
            const sourceItem = document.createElement('div');
            sourceItem.className = 'source-item';
            sourceItem.textContent = source.substring(0, 200) + (source.length > 200 ? '...' : '');
            sourcesDiv.appendChild(sourceItem);
        });

        messageDiv.appendChild(sourcesDiv);
    }

    messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Handle clear
async function handleClear() {
    if (!confirm('Start a new conversation? This will clear the current document.')) {
        return;
    }

    try {
        if (sessionId) {
            const formData = new FormData();
            formData.append('session_id', sessionId);

            await fetch(`${API_BASE}/clear`, {
                method: 'POST',
                body: formData
            });
        }
    } catch (error) {
        console.error('Clear error:', error);
    } finally {
        // Reset UI
        sessionId = null;
        apiKey = null;
        messagesContainer.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <rect width="48" height="48" rx="12" fill="url(#gradient2)"/>
                        <path d="M18 15h12v3h-12v-3zm0 6h12v3h-12v-3zm0 6h8v3h-8v-3z" fill="white"/>
                        <defs>
                            <linearGradient id="gradient2" x1="0" y1="0" x2="48" y2="48">
                                <stop offset="0%" style="stop-color:#4F46E5"/>
                                <stop offset="100%" style="stop-color:#7C3AED"/>
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <h3>Document Ready!</h3>
                <p>Your document has been processed. Start asking questions below.</p>
                <div class="example-questions">
                    <p class="example-label">Try asking:</p>
                    <div class="example-chips">
                        <span class="chip">"What is this document about?"</span>
                        <span class="chip">"Summarize the main points"</span>
                        <span class="chip">"What are the key findings?"</span>
                    </div>
                </div>
            </div>
        `;
        questionInput.value = '';
        fileInput.value = '';
        fileNameSpan.textContent = 'Click to browse or drag & drop';
        apiKeyInput.value = '';
        chatOverlay.classList.remove('active');
        hideStatus();
    }
}

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
