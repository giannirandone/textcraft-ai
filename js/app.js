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
    this.initTypingEffect();
  }

  initTypingEffect() {
    const subtitleElement = document.getElementById('subtitleText');
    const subtitleContent = document.getElementById('subtitleContent');
    const cursorElement = subtitleElement?.querySelector('.typing-cursor');
    
    if (!subtitleElement || !subtitleContent) return;

    const fullText = subtitleElement.getAttribute('data-text') || '';
    let currentIndex = 0;
    const typingSpeed = 80; // milliseconds per character
    const pauseAfterTyping = 2000; // pause before cursor starts blinking continuously

    const typeNextChar = () => {
      if (currentIndex < fullText.length) {
        subtitleContent.textContent = fullText.substring(0, currentIndex + 1);
        currentIndex++;
        setTimeout(typeNextChar, typingSpeed);
      } else {
        // Typing complete, cursor will continue blinking via CSS animation
        setTimeout(() => {
          if (cursorElement) {
            cursorElement.style.animation = 'cursor-blink 1s infinite';
          }
        }, pauseAfterTyping);
      }
    };

    // Start typing effect after a short delay
    setTimeout(() => {
      subtitleContent.textContent = '';
      typeNextChar();
    }, 500);
  }

  setupEventListeners() {
    const domElements = this.ui.getAllElements();

    // Input Textarea
    domElements.inputTextarea.addEventListener("input", () => {
      this.handleInputChange();
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
