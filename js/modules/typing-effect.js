// Typing Effect Manager für TextCraft AI

import { CONFIG } from "../config.js";

export class TypingEffect {
  constructor(uiHandler) {
    this.ui = uiHandler;
    this.timeouts = [];
  }

  init() {
    this.restart(CONFIG.UI.TYPING.INITIAL_DELAY);
  }

  stop() {
    // Clear all typing timeouts
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts = [];

    // Clear subtitle content
    const subtitleContent = this.ui.getSubtitleContent();
    if (subtitleContent) {
      subtitleContent.textContent = "";
    }

    // Reset cursor animation
    const cursorElement = this.ui.getCursorElement();
    if (cursorElement) {
      cursorElement.style.animation = "";
    }
  }

  restart(initialDelay = 0) {
    // Stop any existing typing effect first
    this.stop();

    const subtitleElement = this.ui.getSubtitleElement();
    const subtitleContent = this.ui.getSubtitleContent();
    const cursorElement = this.ui.getCursorElement();

    if (!subtitleElement || !subtitleContent) return;

    const fullText = subtitleElement.getAttribute("data-text") || "";
    let currentIndex = 0;
    const typingSpeed = CONFIG.UI.TYPING.SPEED;
    const pauseAfterTyping = CONFIG.UI.TYPING.PAUSE_AFTER_TYPING;

    const typeNextChar = () => {
      if (currentIndex < fullText.length) {
        subtitleContent.textContent = fullText.substring(0, currentIndex + 1);
        currentIndex++;
        const timeout = setTimeout(typeNextChar, typingSpeed);
        this.timeouts.push(timeout);
      } else {
        // Typing complete, cursor will continue blinking via CSS animation
        const timeout = setTimeout(() => {
          if (cursorElement) {
            cursorElement.style.animation = "cursor-blink 1s infinite";
          }
        }, pauseAfterTyping);
        this.timeouts.push(timeout);
      }
    };

    // Reset cursor animation
    if (cursorElement) {
      cursorElement.style.animation = "";
    }

    // Ensure content is empty before starting
    subtitleContent.textContent = "";

    // Start typing effect after delay
    const timeout = setTimeout(() => {
      subtitleContent.textContent = "";
      typeNextChar();
    }, initialDelay);
    this.timeouts.push(timeout);
  }
}

