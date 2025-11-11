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
    this.isAnimatingSubtitle = false;
    this.typingTimeouts = []; // Track all typing timeouts to clear them

    this.init();
  }

  init() {
    this.syncInitialSelections();
    this.setupEventListeners();
    this.updateCharCount();
    this.updateProcessButton();
    this.initTypingEffect();
    this.initSubtitleVisibility();
  }

  initTypingEffect() {
    this.restartTypingEffect(500);
  }

  stopTypingEffect() {
    // Clear all typing timeouts
    this.typingTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.typingTimeouts = [];

    // Clear subtitle content
    const subtitleContent = document.getElementById("subtitleContent");
    if (subtitleContent) {
      subtitleContent.textContent = "";
    }

    // Reset cursor animation
    const subtitleElement = document.getElementById("subtitleText");
    const cursorElement = subtitleElement?.querySelector(".typing-cursor");
    if (cursorElement) {
      cursorElement.style.animation = "";
    }
  }

  restartTypingEffect(initialDelay = 0) {
    // Stop any existing typing effect first
    this.stopTypingEffect();

    const subtitleElement = document.getElementById("subtitleText");
    const subtitleContent = document.getElementById("subtitleContent");
    const cursorElement = subtitleElement?.querySelector(".typing-cursor");

    if (!subtitleElement || !subtitleContent) return;

    const fullText = subtitleElement.getAttribute("data-text") || "";
    let currentIndex = 0;
    const typingSpeed = 80; // milliseconds per character
    const pauseAfterTyping = 2000; // pause before cursor starts blinking continuously

    const typeNextChar = () => {
      if (currentIndex < fullText.length) {
        subtitleContent.textContent = fullText.substring(0, currentIndex + 1);
        currentIndex++;
        const timeout = setTimeout(typeNextChar, typingSpeed);
        this.typingTimeouts.push(timeout);
      } else {
        // Typing complete, cursor will continue blinking via CSS animation
        const timeout = setTimeout(() => {
          if (cursorElement) {
            cursorElement.style.animation = "cursor-blink 1s infinite";
          }
        }, pauseAfterTyping);
        this.typingTimeouts.push(timeout);
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
    this.typingTimeouts.push(timeout);
  }

  setupEventListeners() {
    const domElements = this.ui.getAllElements();

    // Input Textarea
    domElements.inputTextarea.addEventListener("input", () => {
      this.handleInputChange();
    });

    // Input Textarea Focus - Hide Subtitle
    domElements.inputTextarea.addEventListener("focus", () => {
      // Hide subtitle
      this.hideSubtitle();
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
      this.handleScroll();
    });

    // Click anywhere (except input fields and buttons) - Show Subtitle
    document.addEventListener("click", (event) => {
      this.handleDocumentClick(event);
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

  initSubtitleVisibility() {
    // Check initial scroll position - if not at top and input has focus, hide subtitle
    const isAtTop = (window.scrollY || window.pageYOffset) === 0;
    const domElements = this.ui.getAllElements();
    const inputHasFocus = document.activeElement === domElements.inputTextarea;

    if (!isAtTop && inputHasFocus) {
      const subtitleElement = document.getElementById("subtitleText");
      if (subtitleElement && !subtitleElement.classList.contains("hidden")) {
        subtitleElement.classList.add("hidden");
        subtitleElement.dataset.hiddenByFocus = "true";
      }
    }
  }

  handleScroll() {
    // Don't handle scroll during animation
    if (this.isAnimatingSubtitle) return;

    const currentScrollY = window.scrollY || window.pageYOffset;
    const isAtTop = currentScrollY === 0;
    const subtitleElement = document.getElementById("subtitleText");

    if (!subtitleElement) return;

    // Show subtitle if at top and it was hidden by focus
    // But only if we're scrolling up to the top (not if we're already at top)
    if (
      isAtTop &&
      subtitleElement.classList.contains("hidden") &&
      subtitleElement.dataset.hiddenByFocus === "true"
    ) {
      // Small delay to ensure we're actually scrolling to top, not just clicking while at top
      setTimeout(() => {
        const stillAtTop = (window.scrollY || window.pageYOffset) === 0;
        if (
          stillAtTop &&
          subtitleElement.classList.contains("hidden") &&
          subtitleElement.dataset.hiddenByFocus === "true"
        ) {
          this.showSubtitle();
        }
      }, 100);
    }
  }

  hideSubtitle() {
    const subtitleElement = document.getElementById("subtitleText");
    if (!subtitleElement) return;

    // Don't hide if already hidden or currently animating
    if (
      subtitleElement.classList.contains("hidden") ||
      this.isAnimatingSubtitle
    )
      return;

    // Set animation flag
    this.isAnimatingSubtitle = true;

    // Stop typing effect immediately when hiding
    this.stopTypingEffect();

    // Mark that it was hidden by focus
    subtitleElement.dataset.hiddenByFocus = "true";

    // Get main content and footer elements
    const mainContent = document.querySelector(".main-content");
    const footer = document.querySelector(".footer");
    const logoElement = document.querySelector(".logo");
    const containerElement = document.querySelector(".container");
    const optionsPanel = document.querySelector(".options-panel");

    // Calculate the height of the subtitle to slide up (including margin)
    const subtitleHeight =
      subtitleElement.offsetHeight +
        parseInt(window.getComputedStyle(subtitleElement).marginBottom) || 0;

    // Store the height for later use when showing
    subtitleElement.dataset.height = subtitleHeight.toString();

    // Calculate scroll position for balanced spacing
    if (logoElement && containerElement && optionsPanel) {
      setTimeout(() => {
        // Get container padding-top
        const containerPaddingTop =
          parseInt(window.getComputedStyle(containerElement).paddingTop) || 0;

        // Get logo position and height
        const logoRect = logoElement.getBoundingClientRect();
        const logoHeight = logoRect.height;

        // Get options panel position relative to document
        const optionsPanelRect = optionsPanel.getBoundingClientRect();
        const optionsPanelTopAbsolute = optionsPanelRect.top + window.scrollY;

        // Current logo bottom position relative to document
        const logoBottomAbsolute = logoRect.bottom + window.scrollY;

        // We want: Abstand oben = Abstand unten
        // Abstand oben = Logo-Bottom (nach Scroll) - containerPaddingTop
        // Abstand unten = optionsPanel-Top - Logo-Bottom (nach Scroll)
        // Also: Logo-Bottom (nach Scroll) - containerPaddingTop = optionsPanel-Top - Logo-Bottom (nach Scroll)
        // 2 * Logo-Bottom (nach Scroll) = containerPaddingTop + optionsPanel-Top
        // Logo-Bottom (nach Scroll) = (containerPaddingTop + optionsPanel-Top) / 2

        const desiredLogoBottom =
          (containerPaddingTop + optionsPanelTopAbsolute) / 2;

        // Calculate scroll offset
        const scrollOffset = logoBottomAbsolute - desiredLogoBottom;

        // Scroll to calculated position
        if (Math.abs(scrollOffset) > 1) {
          // Only scroll if difference is more than 1px
          window.scrollTo({ top: scrollOffset, behavior: "smooth" });
        }
      }, 50); // Small delay for calculations
    }

    // Remove any existing animation classes and hidden class
    subtitleElement.classList.remove(
      "slide-fade-in",
      "slide-fade-out",
      "hidden"
    );

    // Force a reflow to ensure the element is in its base state
    void subtitleElement.offsetWidth;

    // Add slide-fade-out animation to subtitle
    subtitleElement.classList.add("slide-fade-out");

    // Slide up main content and footer simultaneously
    if (mainContent) {
      mainContent.classList.add("slide-up");
      mainContent.style.transform = `translateY(-${subtitleHeight}px)`;
    }
    if (footer) {
      footer.classList.add("slide-up");
      footer.style.transform = `translateY(-${subtitleHeight}px)`;
    }

    // After animation completes, add hidden class and remove animation
    setTimeout(() => {
      subtitleElement.classList.add("hidden");
      subtitleElement.classList.remove("slide-fade-out");

      // Keep the transform for main and footer
      if (mainContent) {
        mainContent.style.transform = `translateY(-${subtitleHeight}px)`;
      }
      if (footer) {
        footer.style.transform = `translateY(-${subtitleHeight}px)`;
      }

      this.isAnimatingSubtitle = false;
    }, 300); // Match animation duration
  }

  showSubtitle() {
    const subtitleElement = document.getElementById("subtitleText");
    if (!subtitleElement) return;

    // Don't show if already visible or currently animating
    if (
      !subtitleElement.classList.contains("hidden") ||
      this.isAnimatingSubtitle
    )
      return;

    // Set animation flag
    this.isAnimatingSubtitle = true;

    // Ensure typing effect is stopped and content is cleared before showing
    this.stopTypingEffect();

    // Remove hidden flag
    subtitleElement.dataset.hiddenByFocus = "false";

    // Get main content and footer elements
    const mainContent = document.querySelector(".main-content");
    const footer = document.querySelector(".footer");
    const logoElement = document.querySelector(".logo");

    // Get the height that was stored when hiding (or calculate it)
    const subtitleHeight =
      parseFloat(subtitleElement.dataset.height) ||
      subtitleElement.offsetHeight ||
      50;

    // Remove any existing animation classes
    subtitleElement.classList.remove("slide-fade-in", "slide-fade-out");

    // Ensure hidden class is present before starting animation
    subtitleElement.classList.add("hidden");

    // Reset main and footer transform to slide them back down
    if (mainContent) {
      mainContent.style.transform = `translateY(-${subtitleHeight}px)`;
    }
    if (footer) {
      footer.style.transform = `translateY(-${subtitleHeight}px)`;
    }

    // Force a reflow
    void subtitleElement.offsetWidth;

    // Remove hidden class and add slide-fade-in animation
    subtitleElement.classList.remove("hidden");
    subtitleElement.classList.add("slide-fade-in");

    // Slide down main content and footer simultaneously
    if (mainContent) {
      mainContent.style.transform = "translateY(0)";
    }
    if (footer) {
      footer.style.transform = "translateY(0)";
    }

    // After animation completes, remove animation class and reset transforms
    setTimeout(() => {
      subtitleElement.classList.remove("slide-fade-in");
      if (mainContent) {
        mainContent.style.transform = "";
        mainContent.classList.remove("slide-up");
      }
      if (footer) {
        footer.style.transform = "";
        footer.classList.remove("slide-up");
      }
      this.isAnimatingSubtitle = false;

      // Restart typing effect as if page was reloaded (with delay like initial load)
      this.restartTypingEffect(500);
    }, 300); // Match animation duration
  }

  handleDocumentClick(event) {
    // Check if clicked element is an input field or button
    const target = event.target;
    const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
    const isButton = target.tagName === "BUTTON" || target.closest("button");

    // Don't proceed if clicked on input field or button
    if (isInput || isButton) {
      return;
    }

    // Check if clicked element is inside an input field or button
    const isInsideInput = target.closest("textarea") || target.closest("input");
    const isInsideButton = target.closest("button");

    if (isInsideInput || isInsideButton) {
      return;
    }

    // Proceed with showing subtitle
    this.showSubtitleOnClick();
  }

  showSubtitleOnClick() {
    const subtitleElement = document.getElementById("subtitleText");
    if (!subtitleElement) return;

    // Only show if subtitle is hidden
    if (!subtitleElement.classList.contains("hidden")) return;

    // Check if page is scrollable
    const isScrollable =
      document.documentElement.scrollHeight >
      document.documentElement.clientHeight;

    // Only proceed if page is NOT scrollable
    if (isScrollable) {
      return; // Don't show subtitle if page is scrollable
    }

    // Page is not scrollable, show subtitle
    this.showSubtitle();
  }
}

// Initialize App when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new TextCraftApp();
});
