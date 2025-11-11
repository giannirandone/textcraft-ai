// Subtitle Manager für TextCraft AI - Verwaltet Subtitle-Animationen und Scroll-Verhalten

import { CONFIG, CSS_CLASSES } from "../config.js";

export class SubtitleManager {
  constructor(uiHandler, typingEffect) {
    this.ui = uiHandler;
    this.typingEffect = typingEffect;
    this.isAnimating = false;
  }

  init() {
    // Check initial scroll position - if not at top and input has focus, hide subtitle
    const isAtTop = (window.scrollY || window.pageYOffset) === 0;
    const inputHasFocus =
      document.activeElement === this.ui.getElement("inputTextarea");

    if (!isAtTop && inputHasFocus) {
      const subtitleElement = this.ui.getSubtitleElement();
      if (subtitleElement && !subtitleElement.classList.contains("hidden")) {
        subtitleElement.classList.add("hidden");
        subtitleElement.dataset.hiddenByFocus = "true";
      }
    }
  }

  handleScroll() {
    // Don't handle scroll during animation
    if (this.isAnimating) return;

    const currentScrollY = window.scrollY || window.pageYOffset;
    const isAtTop = currentScrollY === 0;
    const subtitleElement = this.ui.getSubtitleElement();

    if (!subtitleElement) return;

    // Show subtitle if at top and it was hidden by focus
    if (
      isAtTop &&
      subtitleElement.classList.contains("hidden") &&
      subtitleElement.dataset.hiddenByFocus === "true"
    ) {
      // Small delay to ensure we're actually scrolling to top
      setTimeout(() => {
        const stillAtTop = (window.scrollY || window.pageYOffset) === 0;
        if (
          stillAtTop &&
          subtitleElement.classList.contains("hidden") &&
          subtitleElement.dataset.hiddenByFocus === "true"
        ) {
          this.show();
        }
      }, CONFIG.UI.SUBTITLE.SCROLL_CHECK_DELAY);
    }
  }

  handleDocumentClick(event) {
    // Check if clicked element is an input field or button
    const target = event.target;
    const isInput =
      target.tagName === "INPUT" || target.tagName === "TEXTAREA";
    const isButton = target.tagName === "BUTTON" || target.closest("button");

    // Don't proceed if clicked on input field or button
    if (isInput || isButton) {
      return;
    }

    // Check if clicked element is inside an input field or button
    const isInsideInput =
      target.closest("textarea") || target.closest("input");
    const isInsideButton = target.closest("button");

    if (isInsideInput || isInsideButton) {
      return;
    }

    // Proceed with showing subtitle
    this.showOnClick();
  }

  showOnClick() {
    const subtitleElement = this.ui.getSubtitleElement();
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
    this.show();
  }

  hide() {
    const subtitleElement = this.ui.getSubtitleElement();
    if (!subtitleElement) return;

    // Don't hide if already hidden or currently animating
    if (
      subtitleElement.classList.contains("hidden") ||
      this.isAnimating
    ) {
      return;
    }

    // Set animation flag
    this.isAnimating = true;

    // Stop typing effect immediately when hiding
    this.typingEffect.stop();

    // Mark that it was hidden by focus
    subtitleElement.dataset.hiddenByFocus = "true";

    // Get layout elements
    const mainContent = this.ui.getMainContent();
    const footer = this.ui.getFooter();
    const logoElement = this.ui.getLogo();
    const containerElement = this.ui.getContainer();
    const optionsPanel = this.ui.getOptionsPanel();

    // Calculate the height of the subtitle to slide up (including margin)
    const subtitleHeight =
      subtitleElement.offsetHeight +
      (parseInt(window.getComputedStyle(subtitleElement).marginBottom) || 0);

    // Store the height for later use when showing
    subtitleElement.dataset.height = subtitleHeight.toString();

    // Calculate scroll position for balanced spacing
    if (logoElement && containerElement && optionsPanel) {
      setTimeout(() => {
        this.calculateAndScrollToBalancedPosition(
          logoElement,
          containerElement,
          optionsPanel
        );
      }, CONFIG.UI.SUBTITLE.SCROLL_CALC_DELAY);
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

      this.isAnimating = false;
    }, CONFIG.UI.ANIMATION_DURATION);
  }

  show() {
    const subtitleElement = this.ui.getSubtitleElement();
    if (!subtitleElement) return;

    // Don't show if already visible or currently animating
    if (
      !subtitleElement.classList.contains("hidden") ||
      this.isAnimating
    ) {
      return;
    }

    // Set animation flag
    this.isAnimating = true;

    // Ensure typing effect is stopped and content is cleared before showing
    this.typingEffect.stop();

    // Remove hidden flag
    subtitleElement.dataset.hiddenByFocus = "false";

    // Get layout elements
    const mainContent = this.ui.getMainContent();
    const footer = this.ui.getFooter();

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
      this.isAnimating = false;

      // Restart typing effect as if page was reloaded
      this.typingEffect.restart(CONFIG.UI.TYPING.INITIAL_DELAY);
    }, CONFIG.UI.ANIMATION_DURATION);
  }

  calculateAndScrollToBalancedPosition(logoElement, containerElement, optionsPanel) {
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
    // Logo-Bottom (nach Scroll) = (containerPaddingTop + optionsPanelTop) / 2

    const desiredLogoBottom =
      (containerPaddingTop + optionsPanelTopAbsolute) / 2;

    // Calculate scroll offset
    const scrollOffset = logoBottomAbsolute - desiredLogoBottom;

    // Scroll to calculated position
    if (Math.abs(scrollOffset) > 1) {
      // Only scroll if difference is more than 1px
      window.scrollTo({ top: scrollOffset, behavior: "smooth" });
    }
  }
}

