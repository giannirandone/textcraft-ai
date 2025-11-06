// Configuration für TextCraft AI

export const CONFIG = {
    // API Configuration (wird später durch Backend ersetzt)
    API_ENDPOINT: '/api/optimize-text', // Für lokale Entwicklung
    // API_ENDPOINT: 'https://api.openai.com/v1/chat/completions', // Direkt (nur mit API Key)
    
    MODEL: 'gpt-3.5-turbo',
    MAX_TOKENS: 2000,
    TEMPERATURE: 0.7,
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

