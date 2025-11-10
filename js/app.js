// Main Application Logic für TextCraft AI

import { CSS_CLASSES, UI_TEXTS } from "./config.js";
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
    this.syncInitialSelections();
    this.setupEventListeners();
    this.updateCharCount();
    this.updateProcessButton();
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
    const trimmedText = inputText.trim();
    const lastProcessed = this.state.getLastProcessedText() ?? "";
    const matchesLastProcessed =
      inputText === lastProcessed && trimmedText.length > 0;
    const hasInput = trimmedText.length > 0;

    this.state.setInputText(inputText);
    this.ui.resetCopyFeedback();

    if (!hasInput) {
      this.state.setOutputText("");
      this.ui.clearOutput();
      this.ui.updateCopyButtonState(false);
    } else if (matchesLastProcessed) {
      this.state.setOutputText(lastProcessed);
      this.ui.displayResult(lastProcessed);
      this.ui.updateCopyButtonState(true);
    } else {
      this.state.setOutputText("");
      this.ui.displayProcessing();
      this.ui.updateCopyButtonState(false);
    }

    this.updateCharCount();
    this.updateProcessButton();
  }

  handleTabClick(clickedBtn) {
    const mode = clickedBtn.dataset.mode;
    const tab = clickedBtn.dataset.tab;

    if (tab === "1") {
      const isActive = this.ui.toggleTabButton(clickedBtn);
      this.state.setProcessingMode(mode, isActive);
    } else {
      this.ui.activateExclusiveTabButton(clickedBtn);
      this.state.setStyleMode(mode);
    }

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
    const currentText = elements.inputTextarea.value;

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

    const currentProcessingModes = this.state.getProcessingModes();
    const currentStyleMode = this.state.getStyleMode();

    this.state.setLastProcessedState({
      text: rawInputText,
      processingModes: currentProcessingModes,
      styleMode: currentStyleMode,
    });

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

  syncInitialSelections() {
    const elements = this.ui.getAllElements();
    elements.tabButtons.forEach((btn) => {
      if (!btn.classList.contains(CSS_CLASSES.ACTIVE)) {
        return;
      }

      const mode = btn.dataset.mode;
      const tab = btn.dataset.tab;

      if (tab === "1") {
        this.state.setProcessingMode(mode, true);
      } else if (tab === "2") {
        this.state.setStyleMode(mode);
      }
    });
  }
}

// Initialize App when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new TextCraftApp();
});
