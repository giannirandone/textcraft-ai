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

  setProcessingMode(mode, isSelected) {
    if (!mode) {
      return;
    }
    if (isSelected) {
      this.selectedProcessingModes.add(mode);
    } else {
      this.selectedProcessingModes.delete(mode);
    }
  }

  isProcessingModeSelected(mode) {
    return this.selectedProcessingModes.has(mode);
  }

  getStyleMode() {
    return this.selectedStyleMode;
  }

  setStyleMode(mode) {
    this.selectedStyleMode = mode;
  }

  getInputText() {
    return this.inputText;
  }

  setInputText(text) {
    this.inputText = text;
  }

  getOutputText() {
    return this.outputText;
  }

  setOutputText(text) {
    this.outputText = text;
  }

  getLastProcessedText() {
    return this.lastProcessedText;
  }

  setLastProcessedText(text) {
    this.lastProcessedText = text;
  }

  setLastProcessedState({ text, processingModes, styleMode }) {
    this.setLastProcessedText(text);
    const normalizedProcessing = Array.isArray(processingModes)
      ? [...processingModes].sort()
      : [];
    this.lastProcessedConfig = {
      processingModes: normalizedProcessing,
      styleMode: styleMode ?? null,
    };
    this.lastProcessedSelectionSignature = this.getSelectionSignature();
  }

  hasText() {
    return this.inputText.trim().length > 0;
  }

  hasTextChanged() {
    const currentText = this.inputText;
    const lastProcessed = this.lastProcessedText ?? "";
    return currentText !== lastProcessed;
  }

  hasSelectionChanged() {
    if (!this.lastProcessedConfig) {
      return true;
    }

    const currentSignature = this.getSelectionSignature();
    if (this.lastProcessedSelectionSignature !== currentSignature) {
      return true;
    }

    const currentProcessing = [...this.selectedProcessingModes].sort();
    const lastProcessing = this.lastProcessedConfig.processingModes ?? [];

    if (currentProcessing.length !== lastProcessing.length) {
      return true;
    }

    for (let i = 0; i < currentProcessing.length; i += 1) {
      if (currentProcessing[i] !== lastProcessing[i]) {
        return true;
      }
    }

    return this.selectedStyleMode !== this.lastProcessedConfig.styleMode;
  }

  getSelectionSignature() {
    const sortedProcessing = [...this.selectedProcessingModes].sort();
    const style = this.selectedStyleMode ?? "";
    return `${sortedProcessing.join("|")}::${style}`;
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

