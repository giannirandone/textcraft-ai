// API Service für TextCraft AI

import {
  CONFIG,
  SYSTEM_PROMPT,
  TEXT_MODES,
  generateSimulatedResponse,
} from "../config.js";

export class ApiService {
  constructor() {
    this.isSimulationMode = true; // TODO: Später durch Feature-Flag ersetzen
  }

  async processText(inputText, textMode) {
    if (this.isSimulationMode) {
      return this.simulateApiCall(inputText, textMode);
    }
    return this.callRealApi(inputText, textMode);
  }

  async simulateApiCall(inputText, textMode) {
    // Simuliere API-Call Delay
    await new Promise((resolve) =>
      setTimeout(resolve, CONFIG.UI.API_SIMULATION_DELAY)
    );

    // Generiere simulierte Antwort
    return generateSimulatedResponse(textMode, inputText);
  }

  async callRealApi(inputText, textMode) {
    // TODO: Implementiere echte API-Integration
    const textModeConfiguration = TEXT_MODES[textMode];
    if (!textModeConfiguration) {
      throw new Error(`Unknown mode: ${textMode}`);
    }

    try {
      const apiResponse = await fetch(CONFIG.API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: CONFIG.MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `${textModeConfiguration.prompt}\n\n${inputText}` },
          ],
          max_tokens: CONFIG.MAX_TOKENS,
          temperature: CONFIG.TEMPERATURE,
        }),
      });

      if (!apiResponse.ok) {
        throw new Error(`API request failed: ${apiResponse.statusText}`);
      }

      const apiResponseData = await apiResponse.json();
      return apiResponseData.choices[0].message.content.trim();
    } catch (apiError) {
      console.error("API Error:", apiError);
      throw apiError;
    }
  }

  setSimulationMode(isEnabled) {
    this.isSimulationMode = isEnabled;
  }
}

