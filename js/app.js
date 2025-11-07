// Main Application Logic für TextCraft AI

import { CONFIG, TEXT_MODES, SYSTEM_PROMPT } from "./config.js";

class TextCraftApp {
  constructor() {
    this.currentMode = null;
    this.inputText = "";
    this.outputText = "";
    this.lastProcessedText = null; // Speichert den Text zum Zeitpunkt des letzten Klicks

    this.init();
  }

  init() {
    // DOM Elements
    this.inputTextarea = document.getElementById("inputText");
    this.outputArea = document.getElementById("outputText");
    this.processBtn = document.getElementById("processBtn");
    this.copyBtn = document.getElementById("copyBtn");
    this.inputCharCount = document.getElementById("inputCharCount");
    this.loadingOverlay = document.getElementById("loadingOverlay");

    // Tab Buttons
    this.tabButtons = document.querySelectorAll(".tab-btn");

    // Event Listeners
    this.setupEventListeners();

    // Initial State
    this.updateCharCount();
  }

  setupEventListeners() {
    // Input Textarea
    this.inputTextarea.addEventListener("input", () => {
      this.inputText = this.inputTextarea.value;
      this.updateCharCount();
      this.updateProcessButton();
    });

    // Tab Buttons
    this.tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.handleTabClick(btn);
      });
    });

    // Process Button
    this.processBtn.addEventListener("click", () => {
      this.processText();
    });

    // Copy Button
    this.copyBtn.addEventListener("click", () => {
      this.copyToClipboard();
    });
  }

  updateCharCount() {
    const count = this.inputTextarea.value.length;
    this.inputCharCount.textContent = `${count} Zeichen`;
  }

  handleTabClick(clickedBtn) {
    const mode = clickedBtn.dataset.mode;
    const tab = clickedBtn.dataset.tab;

    // Deaktiviere alle Buttons im gleichen Tab-Bereich
    const sameTabButtons = document.querySelectorAll(`[data-tab="${tab}"]`);
    sameTabButtons.forEach((btn) => btn.classList.remove("active"));

    // Aktiviere geklickten Button
    clickedBtn.classList.add("active");

    // Setze aktuellen Modus
    this.currentMode = mode;

    // Update Process Button
    this.updateProcessButton();
  }

  updateProcessButton() {
    const currentText = this.inputTextarea.value.trim();
    const hasText = currentText.length > 0;
    const textChanged = currentText !== this.lastProcessedText;

    // Button disabled wenn: kein Text ODER Text unverändert seit letztem Klick
    this.processBtn.disabled = !hasText || !textChanged;
  }

  async processText() {
    const inputText = this.inputTextarea.value.trim();

    if (!inputText) {
      return;
    }

    // Speichere den Text zum Zeitpunkt des Klicks (vor der Verarbeitung)
    this.lastProcessedText = inputText;

    // Wenn kein Modus gewählt, verwende Standard-Modus
    if (!this.currentMode) {
      this.currentMode = "summarize";
      // Aktiviere den ersten Button visuell
      const firstBtn = document.querySelector(
        '.tab-btn[data-mode="summarize"]'
      );
      if (firstBtn) {
        firstBtn.classList.add("active");
      }
    }

    // Show Loading
    this.showLoading(true);
    this.processBtn.disabled = true;

    try {
      const modeConfig = TEXT_MODES[this.currentMode];
      const optimizedText = await this.callAI(inputText, modeConfig.prompt);

      // Display Result
      this.displayResult(optimizedText);
      this.copyBtn.disabled = false;
    } catch (error) {
      console.error("Error processing text:", error);
      this.displayError(
        "Fehler beim Verarbeiten des Textes. Bitte versuchen Sie es erneut."
      );
    } finally {
      this.showLoading(false);
      // Button-Status basierend auf Texteingabe aktualisieren
      this.updateProcessButton();
    }
  }

  async callAI(text, userPrompt) {
    // TODO: Hier wird später die echte API-Integration implementiert
    // Für jetzt: Simulierte Antwort für Demo-Zwecke

    // Simuliere API-Call Delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Demo: Simuliere verschiedene Antworten basierend auf Modus
    return this.simulateAIResponse(text, userPrompt);
  }

  simulateAIResponse(text, prompt) {
    // Simulierte Antworten für Demo
    // In Production wird hier die echte OpenAI API aufgerufen

    const responses = {
      summarize: `Zusammenfassung: ${text.substring(
        0,
        Math.min(100, text.length)
      )}...`,
      correct: text
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      formal: `Sehr geehrte Damen und Herren,\n\n${text}\n\nMit freundlichen Grüßen`,
      casual: `Hey! 👋\n\n${text}\n\nViele Grüße! 😊`,
      professional: `Betreff: ${text.substring(0, 50)}...\n\n${text}`,
      creative: `✨ ${text
        .split("")
        .map((char, i) => (i % 2 === 0 ? char.toUpperCase() : char))
        .join("")} ✨`,
      simple: text.toLowerCase().replace(/[.,!?]/g, ""),
    };

    return responses[this.currentMode] || text;
  }

  displayResult(text) {
    this.outputText = text;
    const outputElement = this.outputArea;

    // Entferne Placeholder
    const placeholder = outputElement.querySelector(".placeholder-text");
    if (placeholder) {
      placeholder.remove();
    }

    // Setze neuen Text
    outputElement.textContent = text;
    outputElement.style.color = "var(--text-primary)";
  }

  displayError(message) {
    const outputElement = this.outputArea;
    outputElement.innerHTML = `<p style="color: var(--error-color);">${message}</p>`;
  }

  async copyToClipboard() {
    if (!this.outputText) return;

    try {
      await navigator.clipboard.writeText(this.outputText);

      // Visual Feedback
      const originalIcon = this.copyBtn.innerHTML;
      this.copyBtn.innerHTML = "✅";
      this.copyBtn.classList.add("copied");

      setTimeout(() => {
        this.copyBtn.innerHTML = originalIcon;
        this.copyBtn.classList.remove("copied");
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Kopieren fehlgeschlagen. Bitte manuell kopieren.");
    }
  }

  showLoading(show) {
    if (show) {
      this.loadingOverlay.classList.remove("hidden");
    } else {
      this.loadingOverlay.classList.add("hidden");
    }
  }
}

// Initialize App when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new TextCraftApp();
});
