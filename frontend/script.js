// Translations
const translations = {
    fr: {
        nav: {
            features: "Fonctionnalités",
            howItWorks: "Comment ça marche",
            getStarted: "Commencer"
        },
        hero: {
            badge: "Multilingue FR/EN/PT",
            title1: "Transformez vos documents en",
            title2: "Conversations Intelligentes",
            description: "Téléchargez n'importe quel document et posez des questions en langage naturel. Obtenez des réponses instantanées et précises grâce à une technologie IA de pointe.",
            multilingualCompact: "Document dans UNE langue → Questions dans UNE AUTRE ?",
            multilingualCheck: "Ça marche !",
            stat1: "Formats de fichiers",
            stat2: "Langues",
            stat3: "Temps de traitement (petit doc → 20 pages)"
        },
        upload: {
            title: "Commencer l'Analyse",
            subtitle: "Téléchargez votre document pour commencer",
            apiKeyLabel: "Clé API Google Gemini",
            apiKeyPlaceholder: "Entrez votre clé API",
            apiKeyHelp1: "Obtenez votre",
            freeApiKey: "clé API GRATUITE",
            documentLabel: "Sélectionner un document",
            filePrompt: "Cliquez pour parcourir ou glissez-déposez",
            fileHelp: "Formats supportés : PDF, DOCX, PPTX, XLSX, HTML (Max 20 pages)",
            processBtn: "Traiter le document"
        },
        apiKeyModal: {
            title: "Comment obtenir votre clé API gratuite",
            step1: "Visitez <a href='https://aistudio.google.com/app/apikey' target='_blank' rel='noopener'>Google AI Studio</a>",
            step2: "Connectez-vous avec votre adresse email Google",
            step3: "Cliquez sur <strong>« Obtenir une clé API »</strong>",
            step4: "Copiez votre clé et collez-la dans le champ ci-dessus"
        },
        features: {
            title: "Pourquoi choisir IntelliDoc AI ?",
            subtitle: "Intelligence documentaire de niveau entreprise à portée de main",
            feature1: {
                title: "Ultra Rapide",
                desc: "Traitez vos documents en quelques secondes grâce à notre pipeline IA optimisé"
            },
            feature2: {
                title: "Sécurisé et Privé",
                desc: "Vos données restent privées. Aucun stockage, aucun suivi, confidentialité totale"
            },
            feature3: {
                title: "Réponses Intelligentes",
                desc: "Obtenez des réponses précises et contextuelles avec citations des sources"
            },
            feature4: {
                title: "Multi-Format",
                desc: "Support pour les documents PDF, Word, PowerPoint, Excel et HTML"
            },
            feature5: {
                title: "Multilingue Intelligent",
                desc: "Document en portugais mais vous parlez français ? Ou l'inverse ? Aucun problème ! Supporté : FR, EN, PT"
            },
            feature6: {
                title: "Vérification des Sources",
                desc: "Chaque réponse inclut des références au document original"
            }
        },
        howItWorks: {
            title: "Comment ça marche",
            subtitle: "Trois étapes simples pour analyser vos documents intelligemment",
            step1: {
                title: "Télécharger le document",
                desc: "Glissez-déposez simplement ou sélectionnez votre document. Nous supportons tous les formats courants."
            },
            step2: {
                title: "Traitement IA",
                desc: "Notre IA avancée analyse votre document en comprenant le contexte et la structure."
            },
            step3: {
                title: "Posez vos questions",
                desc: "Commencez à converser avec votre document. Obtenez des informations instantanées et précises."
            }
        },
        chat: {
            title: "Analyse du document",
            subtitle: "Posez n'importe quelle question sur votre document",
            newDocument: "Nouveau document",
            ready: "Document prêt !",
            readyDesc: "Votre document a été traité. Commencez à poser vos questions ci-dessous.",
            tryAsking: "Essayez de demander :",
            example1: "\"De quoi parle ce document ?\"",
            example2: "\"Résumez les points principaux\"",
            example3: "\"Quelles sont les conclusions clés ?\"",
            inputPlaceholder: "Posez une question sur votre document...",
            inputHint: "Appuyez sur Entrée pour envoyer • Propulsé par Google Gemini",
            you: "Vous",
            ai: "IntelliDoc AI",
            sources: "Références Sources"
        },
        loading: {
            text: "Traitement en cours...",
            processing: "Traitement de votre document...",
            modelDownload: "Première utilisation : téléchargement du modèle (peut prendre jusqu'à 1 minute)..."
        },
        footer: {
            tagline: "Transformez vos documents en conversations intelligentes",
            copyright: "© 2025 IntelliDoc AI. Propulsé par Google Gemini."
        },
        messages: {
            apiKeyRequired: "Veuillez entrer votre clé API Google Gemini",
            fileRequired: "Veuillez sélectionner un fichier",
            fileTooLarge: "Fichier trop volumineux. Taille maximale : 50Mo",
            uploadFailed: "Échec du téléchargement",
            answerFailed: "Échec de l'obtention de la réponse",
            error: "Erreur",
            clearConfirm: "Démarrer une nouvelle conversation ? Cela effacera le document actuel."
        }
    },
    en: {
        nav: {
            features: "Features",
            howItWorks: "How It Works",
            getStarted: "Get Started"
        },
        hero: {
            badge: "Multilingual FR/EN/PT",
            title1: "Transform Your Documents into",
            title2: "Intelligent Conversations",
            description: "Upload any document and ask questions in natural language. Get instant, accurate answers powered by cutting-edge AI technology.",
            multilingualCompact: "Document in ONE language → Questions in ANOTHER?",
            multilingualCheck: "It works!",
            stat1: "File Formats",
            stat2: "Languages",
            stat3: "Processing Time (small doc → 20 pages)"
        },
        upload: {
            title: "Start Analyzing",
            subtitle: "Upload your document to begin",
            apiKeyLabel: "Google Gemini API Key",
            apiKeyPlaceholder: "Enter your API key",
            apiKeyHelp1: "Get your",
            freeApiKey: "FREE API key",
            documentLabel: "Select Document",
            filePrompt: "Click to browse or drag & drop",
            fileHelp: "Supported: PDF, DOCX, PPTX, XLSX, HTML (Max 20 pages)",
            processBtn: "Process Document"
        },
        apiKeyModal: {
            title: "How to get your free API key",
            step1: "Visit <a href='https://aistudio.google.com/app/apikey' target='_blank' rel='noopener'>Google AI Studio</a>",
            step2: "Sign in with your Google email address",
            step3: "Click on <strong>\"Get API Key\"</strong>",
            step4: "Copy your key and paste it in the field above"
        },
        features: {
            title: "Why Choose IntelliDoc AI?",
            subtitle: "Enterprise-grade document intelligence at your fingertips",
            feature1: {
                title: "Lightning Fast",
                desc: "Process documents in seconds with our optimized AI pipeline"
            },
            feature2: {
                title: "Secure & Private",
                desc: "Your data stays private. No storage, no tracking, complete confidentiality"
            },
            feature3: {
                title: "Smart Answers",
                desc: "Get accurate, contextual answers with source citations"
            },
            feature4: {
                title: "Multi-Format",
                desc: "Support for PDF, Word, PowerPoint, Excel, and HTML documents"
            },
            feature5: {
                title: "Smart Multilingual",
                desc: "Document in Portuguese but you speak English? Or vice versa? No problem! Supported: FR, EN, PT"
            },
            feature6: {
                title: "Source Verification",
                desc: "Every answer includes references to the original document"
            }
        },
        howItWorks: {
            title: "How It Works",
            subtitle: "Three simple steps to intelligent document analysis",
            step1: {
                title: "Upload Document",
                desc: "Simply drag and drop or select your document. We support all major formats."
            },
            step2: {
                title: "AI Processing",
                desc: "Our advanced AI analyzes your document, understanding context and structure."
            },
            step3: {
                title: "Ask & Get Answers",
                desc: "Start conversing with your document. Get instant, accurate insights."
            }
        },
        chat: {
            title: "Document Analysis",
            subtitle: "Ask anything about your document",
            newDocument: "New Document",
            ready: "Document Ready!",
            readyDesc: "Your document has been processed. Start asking questions below.",
            tryAsking: "Try asking:",
            example1: "\"What is this document about?\"",
            example2: "\"Summarize the main points\"",
            example3: "\"What are the key findings?\"",
            inputPlaceholder: "Ask a question about your document...",
            inputHint: "Press Enter to send • AI-powered by Google Gemini",
            you: "You",
            ai: "IntelliDoc AI",
            sources: "Source References"
        },
        loading: {
            text: "Processing...",
            processing: "Processing your document...",
            modelDownload: "First time: downloading model (may take up to 1 minute)..."
        },
        footer: {
            tagline: "Transform your documents into intelligent conversations",
            copyright: "© 2025 IntelliDoc AI. Powered by Google Gemini."
        },
        messages: {
            apiKeyRequired: "Please enter your Google Gemini API key",
            fileRequired: "Please select a file",
            fileTooLarge: "File too large. Maximum size: 50MB",
            uploadFailed: "Upload failed",
            answerFailed: "Failed to get answer",
            error: "Error",
            clearConfirm: "Start a new conversation? This will clear the current document."
        }
    },
    pt: {
        nav: {
            features: "Recursos",
            howItWorks: "Como Funciona",
            getStarted: "Começar"
        },
        hero: {
            badge: "Multilíngue FR/EN/PT",
            title1: "Transforme seus Documentos em",
            title2: "Conversas Inteligentes",
            description: "Carregue qualquer documento e faça perguntas em linguagem natural. Obtenha respostas instantâneas e precisas com tecnologia de IA de ponta.",
            multilingualCompact: "Documento em UM idioma → Perguntas em OUTRO?",
            multilingualCheck: "Funciona!",
            stat1: "Formatos de Arquivo",
            stat2: "Idiomas",
            stat3: "Tempo de Processamento (doc pequeno → 20 páginas)"
        },
        upload: {
            title: "Começar Análise",
            subtitle: "Carregue seu documento para começar",
            apiKeyLabel: "Chave API Google Gemini",
            apiKeyPlaceholder: "Digite sua chave API",
            apiKeyHelp1: "Obtenha sua",
            freeApiKey: "chave API GRATUITA",
            documentLabel: "Selecionar Documento",
            filePrompt: "Clique para procurar ou arraste e solte",
            fileHelp: "Suportados: PDF, DOCX, PPTX, XLSX, HTML (Máx 20 páginas)",
            processBtn: "Processar Documento"
        },
        apiKeyModal: {
            title: "Como obter sua chave API gratuita",
            step1: "Visite o <a href='https://aistudio.google.com/app/apikey' target='_blank' rel='noopener'>Google AI Studio</a>",
            step2: "Conecte-se com seu endereço de email Google",
            step3: "Clique em <strong>\"Obter chave API\"</strong>",
            step4: "Copie sua chave e cole no campo acima"
        },
        features: {
            title: "Por que escolher IntelliDoc AI?",
            subtitle: "Inteligência documental de nível empresarial ao seu alcance",
            feature1: {
                title: "Ultra Rápido",
                desc: "Processe documentos em segundos com nosso pipeline de IA otimizado"
            },
            feature2: {
                title: "Seguro e Privado",
                desc: "Seus dados permanecem privados. Sem armazenamento, sem rastreamento, confidencialidade total"
            },
            feature3: {
                title: "Respostas Inteligentes",
                desc: "Obtenha respostas precisas e contextuais com citações de fontes"
            },
            feature4: {
                title: "Multi-Formato",
                desc: "Suporte para documentos PDF, Word, PowerPoint, Excel e HTML"
            },
            feature5: {
                title: "Multilíngue Inteligente",
                desc: "Documento em francês mas você fala português? Ou vice-versa? Sem problema! Suportado: FR, EN, PT"
            },
            feature6: {
                title: "Verificação de Fontes",
                desc: "Cada resposta inclui referências ao documento original"
            }
        },
        howItWorks: {
            title: "Como Funciona",
            subtitle: "Três passos simples para análise inteligente de documentos",
            step1: {
                title: "Carregar Documento",
                desc: "Simplesmente arraste e solte ou selecione seu documento. Suportamos todos os principais formatos."
            },
            step2: {
                title: "Processamento IA",
                desc: "Nossa IA avançada analisa seu documento, compreendendo o contexto e a estrutura."
            },
            step3: {
                title: "Pergunte e Obtenha Respostas",
                desc: "Comece a conversar com seu documento. Obtenha insights instantâneos e precisos."
            }
        },
        chat: {
            title: "Análise do Documento",
            subtitle: "Pergunte qualquer coisa sobre seu documento",
            newDocument: "Novo Documento",
            ready: "Documento Pronto!",
            readyDesc: "Seu documento foi processado. Comece a fazer perguntas abaixo.",
            tryAsking: "Experimente perguntar:",
            example1: "\"Sobre o que é este documento?\"",
            example2: "\"Resuma os pontos principais\"",
            example3: "\"Quais são as descobertas chave?\"",
            inputPlaceholder: "Faça uma pergunta sobre seu documento...",
            inputHint: "Pressione Enter para enviar • Powered by Google Gemini",
            you: "Você",
            ai: "IntelliDoc AI",
            sources: "Referências de Fontes"
        },
        loading: {
            text: "Processando...",
            processing: "Processando seu documento...",
            modelDownload: "Primeira vez: baixando modelo (pode levar até 1 minuto)..."
        },
        footer: {
            tagline: "Transforme seus documentos em conversas inteligentes",
            copyright: "© 2025 IntelliDoc AI. Powered by Google Gemini."
        },
        messages: {
            apiKeyRequired: "Por favor, digite sua chave API Google Gemini",
            fileRequired: "Por favor, selecione um arquivo",
            fileTooLarge: "Arquivo muito grande. Tamanho máximo: 50MB",
            uploadFailed: "Falha no upload",
            answerFailed: "Falha ao obter resposta",
            error: "Erro",
            clearConfirm: "Iniciar uma nova conversa? Isso limpará o documento atual."
        }
    }
};

// Current language (default: French)
let currentLanguage = localStorage.getItem('language') || 'fr';

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

// Translation functions
function getNestedTranslation(key) {
    const keys = key.split('.');
    let value = translations[currentLanguage];

    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            return key; // Return key if translation not found
        }
    }

    return value || key;
}

function updatePageLanguage() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = getNestedTranslation(key);
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = getNestedTranslation(key);
    });

    // Update language toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === currentLanguage) {
            btn.classList.add('active');
        }
    });
}

function switchLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    updatePageLanguage();
}

// Event Listeners
uploadBtn.addEventListener('click', handleUpload);
sendBtn.addEventListener('click', handleSendQuestion);
clearBtn.addEventListener('click', handleClear);

// Language toggle listeners
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        switchLanguage(btn.getAttribute('data-lang'));
    });
});

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
        fileNameSpan.textContent = getNestedTranslation('upload.filePrompt');
    }
});

// Show loading overlay
function showLoading(message = null) {
    loadingText.textContent = message || getNestedTranslation('loading.text');
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
        showStatus(getNestedTranslation('messages.apiKeyRequired'), 'error');
        return;
    }

    if (!file) {
        showStatus(getNestedTranslation('messages.fileRequired'), 'error');
        return;
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
        showStatus(getNestedTranslation('messages.fileTooLarge'), 'error');
        return;
    }

    try {
        showLoading(getNestedTranslation('loading.processing'));
        hideStatus();

        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);

        // Show model download message after 15 seconds
        const loadingTimeoutId = setTimeout(() => {
            showLoading(getNestedTranslation('loading.modelDownload'));
        }, 15000);

        // Upload (no timeout - CPU processing can take a while)
        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData
        });

        clearTimeout(loadingTimeoutId);

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
        addMessage('assistant', `${getNestedTranslation('messages.error')}: ${error.message}`, []);
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
            ${getNestedTranslation('chat.you')}
        `;
    } else {
        header.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 108 8 8 8 0 00-8-8zm0 14a6 6 0 116-6 6 6 0 01-6 6z"/>
                <path d="M6.5 7a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3a.5.5 0 01.5-.5zm3 0a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3a.5.5 0 01.5-.5z"/>
            </svg>
            ${getNestedTranslation('chat.ai')}
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
            ${getNestedTranslation('chat.sources')}
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
    if (!confirm(getNestedTranslation('messages.clearConfirm'))) {
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
                <h3 data-i18n="chat.ready">${getNestedTranslation('chat.ready')}</h3>
                <p data-i18n="chat.readyDesc">${getNestedTranslation('chat.readyDesc')}</p>
                <div class="example-questions">
                    <p class="example-label" data-i18n="chat.tryAsking">${getNestedTranslation('chat.tryAsking')}</p>
                    <div class="example-chips">
                        <span class="chip" data-i18n="chat.example1">${getNestedTranslation('chat.example1')}</span>
                        <span class="chip" data-i18n="chat.example2">${getNestedTranslation('chat.example2')}</span>
                        <span class="chip" data-i18n="chat.example3">${getNestedTranslation('chat.example3')}</span>
                    </div>
                </div>
            </div>
        `;
        questionInput.value = '';
        fileInput.value = '';
        fileNameSpan.textContent = getNestedTranslation('upload.filePrompt');
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

// API Key Modal functionality
const apiKeyModal = document.getElementById('apiKeyModal');
const showApiKeyInstructionsBtn = document.getElementById('showApiKeyInstructions');
const closeApiKeyModalBtn = document.getElementById('closeApiKeyModal');
const apiKeyStepsContainer = document.getElementById('apiKeySteps');

// Function to populate modal with steps
function populateApiKeyModal() {
    const steps = [
        getNestedTranslation('apiKeyModal.step1'),
        getNestedTranslation('apiKeyModal.step2'),
        getNestedTranslation('apiKeyModal.step3'),
        getNestedTranslation('apiKeyModal.step4')
    ];

    apiKeyStepsContainer.innerHTML = steps.map((step, index) => `
        <div class="api-key-step">
            <div class="api-key-step-number">${index + 1}</div>
            <div class="api-key-step-content">
                <p>${step}</p>
            </div>
        </div>
    `).join('');
}

// Show modal
function showApiKeyModal(e) {
    if (e) {
        e.preventDefault();
    }
    populateApiKeyModal();
    apiKeyModal.classList.add('active');
}

// Hide modal
function hideApiKeyModal() {
    apiKeyModal.classList.remove('active');
}

// Event listeners
showApiKeyInstructionsBtn.addEventListener('click', showApiKeyModal);
closeApiKeyModalBtn.addEventListener('click', hideApiKeyModal);

// Close modal when clicking outside
apiKeyModal.addEventListener('click', (e) => {
    if (e.target === apiKeyModal) {
        hideApiKeyModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && apiKeyModal.classList.contains('active')) {
        hideApiKeyModal();
    }
});

// Create loading banner element
function createLoadingBanner() {
    const banner = document.createElement('div');
    banner.id = 'model-loading-banner';
    banner.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    banner.innerHTML = `
        <div style="animation: spin 1s linear infinite; width: 20px; height: 20px;">⏳</div>
        <div>
            <div style="font-weight: 600;">AI Models Loading...</div>
            <div style="font-size: 12px; opacity: 0.9;">Please wait ~2-3 minutes for models to download. The app will be ready shortly.</div>
        </div>
    `;
    return banner;
}

// Check model status and disable upload button until ready
async function checkModelStatus() {
    try {
        const response = await fetch(`${API_BASE}/api/model-status`);
        const data = await response.json();

        const existingBanner = document.getElementById('model-loading-banner');

        if (data.any_loaded) {
            // At least one model is loaded, enable upload button
            uploadBtn.disabled = false;
            uploadBtn.textContent = translations[currentLanguage].upload.processBtn;
            // Remove loading banner if it exists
            if (existingBanner) {
                existingBanner.remove();
            }
            return true; // Stop polling
        } else {
            // No models loaded yet, keep upload button disabled
            uploadBtn.disabled = true;
            uploadBtn.textContent = "⏳ Waiting for models...";
            // Add loading banner if it doesn't exist
            if (!existingBanner) {
                const uploadCard = document.getElementById('uploadCard');
                const cardHeader = uploadCard.querySelector('.card-header');
                cardHeader.after(createLoadingBanner());
            }
            return false; // Continue polling
        }
    } catch (error) {
        // If can't reach server yet, keep polling
        console.log('Waiting for server...', error);
        uploadBtn.disabled = true;
        uploadBtn.textContent = "⏳ Connecting...";
        return false;
    }
}

// Poll model status on page load
async function initializeModelStatus() {
    // Disable upload button initially
    uploadBtn.disabled = true;

    // Poll every 2 seconds until at least one model is ready
    const pollInterval = setInterval(async () => {
        const ready = await checkModelStatus();
        if (ready) {
            clearInterval(pollInterval);
        }
    }, 2000);

    // Also check immediately
    const ready = await checkModelStatus();
    if (ready) {
        clearInterval(pollInterval);
    }
}

// Initialize language on page load
updatePageLanguage();

// Initialize model status check
initializeModelStatus();
