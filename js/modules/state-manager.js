// State Management für TextCraft AI

export class StateManager {
  constructor() {
    this.currentMode = null;
    this.inputText = "";
    this.outputText = "";
    this.lastProcessedText = null;
  }

  getMode() {
    return this.currentMode;
  }

  setMode(mode) {
    this.currentMode = mode;
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

  hasText() {
    return this.inputText.trim().length > 0;
  }

  hasTextChanged() {
    const currentText = this.inputText.trim();
    return currentText !== this.lastProcessedText;
  }

  canProcess() {
    return this.hasText() && this.hasTextChanged();
  }

  reset() {
    this.currentMode = null;
    this.inputText = "";
    this.outputText = "";
    this.lastProcessedText = null;
  }
}

