// Main Application Logic für TextCraft AI

import { DEFAULT_MODE, UI_TEXTS } from "./config.js";
import { StateManager } from "./modules/state-manager.js";
import { ApiService } from "./modules/api-service.js";
import { UIHandler } from "./modules/ui-handler.js";

class TextCraftApp {
  constructor() {
    this.state = new StateManager();
    this.api = new ApiService();
    this.ui = new UIHandler();

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateCharCount();
  }

  setupEventListeners() {
    const elements = this.ui.getAllElements();

    // Input Textarea
    elements.inputTextarea.addEventListener("input", () => {
      this.handleInputChange();
    });

    // Tab Buttons
    elements.tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.handleTabClick(btn);
      });
    });

    // Process Button
    elements.processBtn.addEventListener("click", () => {
      this.handleProcessClick();
    });

    // Copy Button
    elements.copyBtn.addEventListener("click", () => {
      this.handleCopyClick();
    });
  }

  handleInputChange() {
    const elements = this.ui.getAllElements();
    const inputText = elements.inputTextarea.value;

    this.state.setInputText(inputText);
    this.state.setOutputText(inputText);
    this.ui.resetCopyFeedback();
    this.ui.displayResult(inputText);
    this.ui.updateCopyButtonState(inputText.length > 0);
    this.updateCharCount();
    this.updateProcessButton();
  }

  handleTabClick(clickedBtn) {
    const mode = clickedBtn.dataset.mode;

    this.ui.activateTabButton(clickedBtn);
    this.state.setMode(mode);
    this.updateProcessButton();
  }

  handleProcessClick() {
    this.processText();
  }

  async handleCopyClick() {
    await this.copyToClipboard();
  }

  updateCharCount() {
    const elements = this.ui.getAllElements();
    const count = elements.inputTextarea.value.length;
    this.ui.updateCharCount(count);
  }

  updateProcessButton() {
    const elements = this.ui.getAllElements();
    const currentText = elements.inputTextarea.value.trim();

    this.state.setInputText(currentText);
    const canProcess = this.state.canProcess();
    this.ui.updateProcessButtonState(canProcess);
  }

  async processText() {
    const elements = this.ui.getAllElements();
    const rawInputText = elements.inputTextarea.value;
    const trimmedInputText = rawInputText.trim();

    if (!trimmedInputText) {
      return;
    }

    // Speichere den Text zum Zeitpunkt des Klicks
    this.state.setLastProcessedText(trimmedInputText);

    // Ergebnis entspricht exakt dem eingegebenen Text
    this.state.setOutputText(rawInputText);
    this.ui.displayResult(rawInputText);
    this.ui.updateCopyButtonState(true);
    this.ui.showLoading(false);
    this.updateProcessButton();
  }

  async copyToClipboard() {
    const outputText = this.state.getOutputText();
    if (!outputText) return;

    try {
      await navigator.clipboard.writeText(outputText);
      this.ui.showCopyFeedback();
    } catch (error) {
      console.error("Failed to copy:", error);
      alert(UI_TEXTS.ERROR_COPY);
    }
  }
}

// Initialize App when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new TextCraftApp();
});
