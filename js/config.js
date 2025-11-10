// Configuration für TextCraft AI

export const CONFIG = {
    // API Configuration (wird später durch Backend ersetzt)
    API_ENDPOINT: '/api/optimize-text', // Für lokale Entwicklung
    // API_ENDPOINT: 'https://api.openai.com/v1/chat/completions', // Direkt (nur mit API Key)
    
    MODEL: 'gpt-3.5-turbo',
    MAX_TOKENS: 2000,
    TEMPERATURE: 0.7,
    
    // UI Configuration
    UI: {
        ANIMATION_DURATION: 300, // ms
        COPY_FEEDBACK_DURATION: 2000, // ms
        API_SIMULATION_DELAY: 1500, // ms
        BUTTON_SIZES: {
            ICON: 44,
            PROCESS_CENTER: 60,
            COPY_ICON: 40,
        },
    },
};

// Text-Modi mit entsprechenden Prompts
export const TEXT_MODES = {
    summarize: {
        name: 'Zusammenfassen',
        prompt: 'Fasse den folgenden Text prägnant zusammen, behalte die wichtigsten Informationen bei:'
    },
    correct: {
        name: 'Korrigieren',
        prompt: 'Korrigiere Rechtschreibung, Grammatik und Stil des folgenden Textes. Verbessere die Formulierung, behalte aber die ursprüngliche Bedeutung bei:'
    },
    formal: {
        name: 'Formal',
        prompt: 'Formuliere den folgenden Text in einem formellen, höflichen Stil um. Verwende eine professionelle Sprache:'
    },
    casual: {
        name: 'Freundlich',
        prompt: 'Formuliere den folgenden Text in einem lockeren, freundlichen und zugänglichen Stil um:'
    },
    professional: {
        name: 'Professionell',
        prompt: 'Formuliere den folgenden Text in einem professionellen, geschäftlichen Stil um. Verwende eine klare, präzise Sprache:'
    },
    creative: {
        name: 'Kreativ',
        prompt: 'Formuliere den folgenden Text in einem kreativen, lebendigen und ausdrucksstarken Stil um:'
    },
    simple: {
        name: 'Einfach',
        prompt: 'Formuliere den folgenden Text in einfachen, leicht verständlichen Worten um. Verwende kurze Sätze und vermeide Fachbegriffe:'
    }
};

// System Prompt für bessere Ergebnisse
export const SYSTEM_PROMPT = 'Du bist ein professioneller Textoptimierungs-Assistent. Du hilfst Nutzern dabei, ihre Texte zu verbessern, zu optimieren und in verschiedene Stile umzuformulieren. Antworte immer nur mit dem optimierten Text, ohne zusätzliche Erklärungen oder Kommentare.';

// UI Text Constants
export const UI_TEXTS = {
    PLACEHOLDER_INPUT: 'Geben Sie hier Ihren Text ein...',
    PLACEHOLDER_OUTPUT: 'Hier erscheint der optimierte Text...',
    LOADING_MESSAGE: 'Text wird verarbeitet...',
    ERROR_PROCESSING: 'Fehler beim Verarbeiten des Textes. Bitte versuchen Sie es erneut.',
    ERROR_COPY: 'Kopieren fehlgeschlagen. Bitte manuell kopieren.',
    COPY_SUCCESS: 'Kopiert!',
    CHAR_COUNT: (characterCount) => `${characterCount} Zeichen`,
};

// Simulierte Antworten für Demo-Zwecke
export function generateSimulatedResponse(textMode, inputText) {
    const simulatedResponses = {
        summarize: `Zusammenfassung: ${inputText.substring(
            0,
            Math.min(100, inputText.length)
        )}...`,
        correct: inputText
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
        formal: `Sehr geehrte Damen und Herren,\n\n${inputText}\n\nMit freundlichen Grüßen`,
        casual: `Hey! 👋\n\n${inputText}\n\nViele Grüße! 😊`,
        professional: `Betreff: ${inputText.substring(0, 50)}...\n\n${inputText}`,
        creative: `✨ ${inputText
            .split("")
            .map((char, i) => (i % 2 === 0 ? char.toUpperCase() : char))
            .join("")} ✨`,
        simple: inputText.toLowerCase().replace(/[.,!?]/g, ""),
    };

    return simulatedResponses[textMode] || inputText;
}

// Constants
export const DEFAULT_MODE = 'summarize';
export const CSS_CLASSES = {
    ACTIVE: 'active',
    HIDDEN: 'hidden',
    COPIED: 'copied',
    PLACEHOLDER_TEXT: 'placeholder-text',
};
export const DOM_SELECTORS = {
    TAB_BUTTON: '.tab-btn',
    TAB_BUTTON_BY_MODE: (textMode) => `.tab-btn[data-mode="${textMode}"]`,
    TAB_BUTTON_BY_TAB: (tabGroup) => `[data-tab="${tabGroup}"]`,
    PLACEHOLDER_TEXT: '.placeholder-text',
};

