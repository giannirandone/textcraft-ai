// State Management für TextCraft AI

export class StateManager {
  constructor() {
    this.selectedProcessingModes = new Set();
    this.selectedStyleMode = null;
    this.inputText = "";
    this.outputText = "";
    this.lastProcessedText = null;
    this.lastProcessedConfig = null;
    this.lastProcessedSelectionSignature = null;
  }

  getProcessingModes() {
    return Array.from(this.selectedProcessingModes);
  }

  setProcessingMode(processingMode, isSelected) {
    if (!processingMode) {
      return;
    }
    if (isSelected) {
      this.selectedProcessingModes.add(processingMode);
    } else {
      this.selectedProcessingModes.delete(processingMode);
    }
  }

  isProcessingModeSelected(processingMode) {
    return this.selectedProcessingModes.has(processingMode);
  }

  getStyleMode() {
    return this.selectedStyleMode;
  }

  setStyleMode(styleMode) {
    this.selectedStyleMode = styleMode;
  }

  getInputText() {
    return this.inputText;
  }

  setInputText(inputText) {
    this.inputText = inputText;
  }

  getOutputText() {
    return this.outputText;
  }

  setOutputText(outputText) {
    this.outputText = outputText;
  }

  getLastProcessedText() {
    return this.lastProcessedText;
  }

  setLastProcessedText(inputText) {
    this.lastProcessedText = inputText;
  }

  setLastProcessedState({ text, processingModes, styleMode }) {
    this.setLastProcessedText(text);
    const normalizedProcessingModes = Array.isArray(processingModes)
      ? [...processingModes].sort()
      : [];
    this.lastProcessedConfig = {
      processingModes: normalizedProcessingModes,
      styleMode: styleMode ?? null,
    };
    this.lastProcessedSelectionSignature = this.getSelectionSignature();
  }

  hasText() {
    return this.inputText.trim().length > 0;
  }

  hasTextChanged() {
    const currentInputText = this.inputText;
    const lastProcessedText = this.lastProcessedText ?? "";
    return currentInputText !== lastProcessedText;
  }

  hasSelectionChanged() {
    if (!this.lastProcessedConfig) {
      return true;
    }

    const currentSelectionSignature = this.getSelectionSignature();
    if (this.lastProcessedSelectionSignature !== currentSelectionSignature) {
      return true;
    }

    // Additional validation: compare processing modes arrays
    const currentProcessingModes = [...this.selectedProcessingModes].sort();
    const lastProcessedProcessingModes = this.lastProcessedConfig.processingModes ?? [];

    if (currentProcessingModes.length !== lastProcessedProcessingModes.length) {
      return true;
    }

    // Check if processing modes arrays differ
    const processingModesDiffer = currentProcessingModes.some(
      (mode, index) => mode !== lastProcessedProcessingModes[index]
    );
    if (processingModesDiffer) {
      return true;
    }

    // Check if style mode changed
    return this.selectedStyleMode !== this.lastProcessedConfig.styleMode;
  }

  getSelectionSignature() {
    const sortedProcessingModes = [...this.selectedProcessingModes].sort();
    const selectedStyle = this.selectedStyleMode ?? "";
    return `${sortedProcessingModes.join("|")}::${selectedStyle}`;
  }

  canProcess() {
    if (!this.hasText()) {
      return false;
    }

    if (this.selectedProcessingModes.size === 0) {
      return false;
    }

    if (!this.selectedStyleMode) {
      return false;
    }

    if (!this.lastProcessedConfig) {
      return true;
    }

    return this.hasTextChanged() || this.hasSelectionChanged();
  }

  reset() {
    this.selectedProcessingModes.clear();
    this.selectedStyleMode = null;
    this.inputText = "";
    this.outputText = "";
    this.lastProcessedText = null;
    this.lastProcessedConfig = null;
    this.lastProcessedSelectionSignature = null;
  }
}

