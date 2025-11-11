// UI Handler für TextCraft AI - DOM-Manipulation und UI-Updates

import {
  CONFIG,
  UI_TEXTS,
  CSS_CLASSES,
  DOM_SELECTORS,
  DEFAULT_MODE,
} from "../config.js";

export class UIHandler {
  constructor() {
    this.elements = {};
    this.initElements();
  }

  initElements() {
    this.elements = {
      inputTextarea: document.getElementById("inputText"),
      outputTextarea: document.getElementById("outputText"),
      processBtn: document.getElementById("processBtn"),
      copyBtn: document.getElementById("copyBtn"),
      inputCharCount: document.getElementById("inputCharCount"),
      outputStatus: document.getElementById("outputStatus"),
      loadingOverlay: document.getElementById("loadingOverlay"),
      tabButtons: document.querySelectorAll(DOM_SELECTORS.TAB_BUTTON),
    };
  }

  // Subtitle Elements
  getSubtitleElement() {
    return document.getElementById("subtitleText");
  }

  getSubtitleContent() {
    return document.getElementById("subtitleContent");
  }

  getCursorElement() {
    const subtitleElement = this.getSubtitleElement();
    return subtitleElement?.querySelector(".typing-cursor");
  }

  // Layout Elements
  getMainContent() {
    return document.querySelector(".main-content");
  }

  getFooter() {
    return document.querySelector(".footer");
  }

  getLogo() {
    return document.querySelector(".logo");
  }

  getContainer() {
    return document.querySelector(".container");
  }

  getOptionsPanel() {
    return document.querySelector(".options-panel");
  }

  // Character Count Updates
  updateCharCount(characterCount) {
    if (this.elements.inputCharCount) {
      this.elements.inputCharCount.textContent =
        UI_TEXTS.CHAR_COUNT(characterCount);
    }
  }

  // Process Button State
  updateProcessButtonState(isEnabled) {
    if (this.elements.processBtn) {
      this.elements.processBtn.disabled = !isEnabled;
    }
  }

  // Copy Button State
  updateCopyButtonState(isEnabled) {
    if (this.elements.copyBtn) {
      this.elements.copyBtn.disabled = !isEnabled;
      if (isEnabled) {
        this.elements.copyBtn.style.display = "";
      }
    }
  }

  // Tab Management
  activateExclusiveTabButton(tabButton) {
    const tabGroup = tabButton.dataset.tab;
    const sameTabButtons = document.querySelectorAll(
      DOM_SELECTORS.TAB_BUTTON_BY_TAB(tabGroup)
    );
    sameTabButtons.forEach((button) => {
      const isButtonActive = button === tabButton;
      this.setTabButtonState(button, isButtonActive);
    });
  }

  toggleTabButton(tabButton) {
    const isButtonActive = tabButton.classList.contains(CSS_CLASSES.ACTIVE);
    const isNowActive = !isButtonActive;
    this.setTabButtonState(tabButton, isNowActive);
    return isNowActive;
  }

  activateDefaultMode() {
    const firstTabButton = document.querySelector(
      DOM_SELECTORS.TAB_BUTTON_BY_MODE(DEFAULT_MODE)
    );
    if (firstTabButton) {
      this.activateExclusiveTabButton(firstTabButton);
    }
  }

  // Output Display
  displayResult(outputText) {
    if (!this.elements.outputTextarea) return;

    this.elements.outputTextarea.value = outputText;
    this.elements.outputTextarea.style.color = "var(--text-primary)";
    this.setOutputStatus("");
  }

  displayError(errorMessage) {
    if (!this.elements.outputTextarea) return;

    this.elements.outputTextarea.value = errorMessage;
    this.elements.outputTextarea.style.color = "var(--error-color)";
    this.setOutputStatus("");
  }

  clearOutput() {
    if (!this.elements.outputTextarea) return;

    this.elements.outputTextarea.value = "";
    this.elements.outputTextarea.style.removeProperty("color");
    this.setOutputStatus("");
    this.resetCopyFeedback();
  }

  displayProcessing() {
    if (!this.elements.outputTextarea) return;

    this.elements.outputTextarea.value = UI_TEXTS.LOADING_MESSAGE;
    this.elements.outputTextarea.style.color = "var(--text-secondary)";
    this.setOutputStatus("");
  }

  // Loading Overlay
  showLoading(shouldShow) {
    if (!this.elements.loadingOverlay) return;

    if (shouldShow) {
      this.elements.loadingOverlay.classList.remove(CSS_CLASSES.HIDDEN);
    } else {
      this.elements.loadingOverlay.classList.add(CSS_CLASSES.HIDDEN);
    }
  }

  // Copy Feedback
  showCopyFeedback() {
    if (!this.elements.copyBtn || !this.elements.outputStatus) return;

    this.elements.copyBtn.style.display = "none";
    this.setOutputStatus(UI_TEXTS.COPY_SUCCESS, true);

    setTimeout(() => {
      this.elements.copyBtn.style.display = "";
      this.setOutputStatus("");
    }, CONFIG.UI.COPY_FEEDBACK_DURATION);
  }

  // Get Elements (for event listeners)
  getElement(name) {
    return this.elements[name];
  }

  getAllElements() {
    return this.elements;
  }

  setOutputStatus(statusMessage, withAnimation = false) {
    if (!this.elements.outputStatus) return;

    const statusElement = this.elements.outputStatus;
    statusElement.textContent = statusMessage;
    statusElement.classList.remove("copy-feedback");

    if (withAnimation && statusMessage) {
      // Trigger reflow to restart animation
      void statusElement.offsetWidth;
      statusElement.classList.add("copy-feedback");
    }
  }

  resetCopyFeedback() {
    if (this.elements.copyBtn) {
      this.elements.copyBtn.style.display = "";
    }
    this.setOutputStatus("");
  }

  setTabButtonState(tabButton, isButtonActive) {
    if (!tabButton) {
      return;
    }
    if (isButtonActive) {
      tabButton.classList.add(CSS_CLASSES.ACTIVE);
      tabButton.setAttribute("aria-pressed", "true");
    } else {
      tabButton.classList.remove(CSS_CLASSES.ACTIVE);
      tabButton.setAttribute("aria-pressed", "false");
    }
  }
}
