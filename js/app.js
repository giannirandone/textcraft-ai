// Main Application Logic für TextCraft AI

import { CSS_CLASSES, UI_TEXTS } from "./config.js";
import { StateManager } from "./modules/state-manager.js";
import { ApiService } from "./modules/api-service.js";
import { UIHandler } from "./modules/ui-handler.js";
import { TypingEffect } from "./modules/typing-effect.js";
import { SubtitleManager } from "./modules/subtitle-manager.js";

class TextCraftApp {
  constructor() {
    this.state = new StateManager();
    this.api = new ApiService();
    this.ui = new UIHandler();
    this.typingEffect = new TypingEffect(this.ui);
    this.subtitleManager = new SubtitleManager(this.ui, this.typingEffect);

    this.init();
  }

  init() {
    this.syncInitialSelections();
    this.setupEventListeners();
    this.updateCharCount();
    this.updateProcessButton();
    this.typingEffect.init();
    this.subtitleManager.init();
  }

  setupEventListeners() {
    const domElements = this.ui.getAllElements();

    // Input Textarea
    domElements.inputTextarea.addEventListener("input", () => {
      this.handleInputChange();
    });

    // Input Textarea Focus - Hide Subtitle
    domElements.inputTextarea.addEventListener("focus", () => {
      this.subtitleManager.hide();
    });

    // Tab Buttons
    domElements.tabButtons.forEach((tabButton) => {
      tabButton.addEventListener("click", () => {
        this.handleTabClick(tabButton);
      });
    });

    // Process Button
    domElements.processBtn.addEventListener("click", () => {
      this.handleProcessClick();
    });

    // Copy Button
    domElements.copyBtn.addEventListener("click", () => {
      this.handleCopyClick();
    });

    // Scroll Event - Show Subtitle when at top
    window.addEventListener("scroll", () => {
      this.subtitleManager.handleScroll();
    });

    // Click anywhere (except input fields and buttons) - Show Subtitle
    document.addEventListener("click", (event) => {
      this.subtitleManager.handleDocumentClick(event);
    });
  }

  handleInputChange() {
    const domElements = this.ui.getAllElements();
    const untrimmedInputText = domElements.inputTextarea.value;
    const inputTextContent = untrimmedInputText.trim();
    const lastProcessedText = this.state.getLastProcessedText() ?? "";
    const matchesPreviousInput =
      untrimmedInputText === lastProcessedText && inputTextContent.length > 0;
    const hasInputContent = inputTextContent.length > 0;

    this.state.setInputText(untrimmedInputText);
    this.ui.resetCopyFeedback();

    if (!hasInputContent) {
      this.handleEmptyInput();
    } else if (matchesPreviousInput) {
      this.handleMatchingPreviousInput(lastProcessedText);
    } else {
      this.handleNewInput();
    }

    this.updateCharCount();
    this.updateProcessButton();
  }

  handleEmptyInput() {
    this.state.setOutputText("");
    this.ui.clearOutput();
    this.ui.updateCopyButtonState(false);
  }

  handleMatchingPreviousInput(lastProcessedText) {
    this.state.setOutputText(lastProcessedText);
    this.ui.displayResult(lastProcessedText);
    this.ui.updateCopyButtonState(true);
  }

  handleNewInput() {
    this.state.setOutputText("");
    this.ui.displayProcessing();
    this.ui.updateCopyButtonState(false);
  }

  handleTabClick(clickedTabButton) {
    const processingMode = clickedTabButton.dataset.mode;
    const tabGroup = clickedTabButton.dataset.tab;

    if (tabGroup === "1") {
      const isButtonActive = this.ui.toggleTabButton(clickedTabButton);
      this.state.setProcessingMode(processingMode, isButtonActive);
    } else {
      this.ui.activateExclusiveTabButton(clickedTabButton);
      this.state.setStyleMode(processingMode);
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
    const domElements = this.ui.getAllElements();
    const characterCount = domElements.inputTextarea.value.length;
    this.ui.updateCharCount(characterCount);
  }

  updateProcessButton() {
    const domElements = this.ui.getAllElements();
    const currentInputText = domElements.inputTextarea.value;

    this.state.setInputText(currentInputText);
    const canProcess = this.state.canProcess();
    this.ui.updateProcessButtonState(canProcess);
  }

  async processText() {
    const domElements = this.ui.getAllElements();
    const untrimmedInputText = domElements.inputTextarea.value;
    const inputTextContent = untrimmedInputText.trim();

    if (!inputTextContent) {
      return;
    }

    const selectedProcessingModes = this.state.getProcessingModes();
    const selectedStyleMode = this.state.getStyleMode();

    this.state.setLastProcessedState({
      text: untrimmedInputText,
      processingModes: selectedProcessingModes,
      styleMode: selectedStyleMode,
    });

    // Ergebnis entspricht exakt dem eingegebenen Text
    this.state.setOutputText(untrimmedInputText);
    this.ui.displayResult(untrimmedInputText);
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
    } catch (copyError) {
      console.error("Failed to copy:", copyError);
      alert(UI_TEXTS.ERROR_COPY);
    }
  }

  syncInitialSelections() {
    const domElements = this.ui.getAllElements();
    domElements.tabButtons.forEach((tabButton) => {
      if (!tabButton.classList.contains(CSS_CLASSES.ACTIVE)) {
        return;
      }

      const processingMode = tabButton.dataset.mode;
      const tabGroup = tabButton.dataset.tab;

      if (tabGroup === "1") {
        this.state.setProcessingMode(processingMode, true);
      } else if (tabGroup === "2") {
        this.state.setStyleMode(processingMode);
      }
    });
  }
}

// Initialize App when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new TextCraftApp();
});
