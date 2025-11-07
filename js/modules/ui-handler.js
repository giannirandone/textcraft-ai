// UI Handler für TextCraft AI - DOM-Manipulation und UI-Updates

import { UI_TEXTS, CSS_CLASSES, DOM_SELECTORS, DEFAULT_MODE } from "../config.js";

export class UIHandler {
  constructor() {
    this.elements = {};
    this.initElements();
  }

  initElements() {
    this.elements = {
      inputTextarea: document.getElementById("inputText"),
      outputArea: document.getElementById("outputText"),
      processBtn: document.getElementById("processBtn"),
      copyBtn: document.getElementById("copyBtn"),
      inputCharCount: document.getElementById("inputCharCount"),
      loadingOverlay: document.getElementById("loadingOverlay"),
      tabButtons: document.querySelectorAll(DOM_SELECTORS.TAB_BUTTON),
    };
  }

  // Character Count Updates
  updateCharCount(count) {
    if (this.elements.inputCharCount) {
      this.elements.inputCharCount.textContent = UI_TEXTS.CHAR_COUNT(count);
    }
  }

  // Process Button State
  updateProcessButtonState(enabled) {
    if (this.elements.processBtn) {
      this.elements.processBtn.disabled = !enabled;
    }
  }

  // Copy Button State
  updateCopyButtonState(enabled) {
    if (this.elements.copyBtn) {
      this.elements.copyBtn.disabled = !enabled;
    }
  }

  // Tab Management
  activateTabButton(button) {
    const tab = button.dataset.tab;
    const sameTabButtons = document.querySelectorAll(
      DOM_SELECTORS.TAB_BUTTON_BY_TAB(tab)
    );
    sameTabButtons.forEach((btn) => {
      btn.classList.remove(CSS_CLASSES.ACTIVE);
      btn.setAttribute("aria-pressed", "false");
    });
    button.classList.add(CSS_CLASSES.ACTIVE);
    button.setAttribute("aria-pressed", "true");
  }

  activateDefaultMode() {
    const firstBtn = document.querySelector(
      DOM_SELECTORS.TAB_BUTTON_BY_MODE(DEFAULT_MODE)
    );
    if (firstBtn) {
      this.activateTabButton(firstBtn);
    }
  }

  // Output Display
  displayResult(text) {
    if (!this.elements.outputArea) return;

    const placeholder = this.elements.outputArea.querySelector(
      DOM_SELECTORS.PLACEHOLDER_TEXT
    );
    if (placeholder) {
      placeholder.remove();
    }

    this.elements.outputArea.textContent = text;
    this.elements.outputArea.style.color = "var(--text-primary)";
  }

  displayError(message) {
    if (!this.elements.outputArea) return;

    this.elements.outputArea.innerHTML = `<p style="color: var(--error-color);">${message}</p>`;
  }

  clearOutput() {
    if (!this.elements.outputArea) return;

    this.elements.outputArea.textContent = "";
    this.elements.outputArea.innerHTML = `<p class="${CSS_CLASSES.PLACEHOLDER_TEXT}">${UI_TEXTS.PLACEHOLDER_OUTPUT}</p>`;
  }

  // Loading Overlay
  showLoading(show) {
    if (!this.elements.loadingOverlay) return;

    if (show) {
      this.elements.loadingOverlay.classList.remove(CSS_CLASSES.HIDDEN);
    } else {
      this.elements.loadingOverlay.classList.add(CSS_CLASSES.HIDDEN);
    }
  }

  // Copy Feedback
  showCopyFeedback() {
    if (!this.elements.copyBtn) return;

    const originalIcon = this.elements.copyBtn.innerHTML;
    this.elements.copyBtn.innerHTML = "✅";
    this.elements.copyBtn.classList.add(CSS_CLASSES.COPIED);

    setTimeout(() => {
      this.elements.copyBtn.innerHTML = originalIcon;
      this.elements.copyBtn.classList.remove(CSS_CLASSES.COPIED);
    }, 2000);
  }

  // Get Elements (for event listeners)
  getElement(name) {
    return this.elements[name];
  }

  getAllElements() {
    return this.elements;
  }
}

