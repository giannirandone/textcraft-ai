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
      if (enabled) {
        this.elements.copyBtn.style.display = "";
      }
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
    if (!this.elements.outputTextarea) return;

    this.elements.outputTextarea.value = text;
    this.elements.outputTextarea.style.color = "var(--text-primary)";
  }

  displayError(message) {
    if (!this.elements.outputTextarea) return;

    this.elements.outputTextarea.value = message;
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
    if (!this.elements.copyBtn || !this.elements.outputStatus) return;

    this.elements.copyBtn.style.display = "none";
    this.setOutputStatus("Kopiert!", true);

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

  setOutputStatus(message, withAnimation = false) {
    if (!this.elements.outputStatus) return;

    const statusEl = this.elements.outputStatus;
    statusEl.textContent = message;
    statusEl.classList.remove("copy-feedback");

    if (withAnimation && message) {
      // Trigger reflow to restart animation
      void statusEl.offsetWidth;
      statusEl.classList.add("copy-feedback");
    }
  }

  resetCopyFeedback() {
    if (this.elements.copyBtn) {
      this.elements.copyBtn.style.display = "";
    }
    this.setOutputStatus("");
  }
}

