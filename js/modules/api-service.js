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

  async processText(text, mode) {
    if (this.isSimulationMode) {
      return this.simulateApiCall(text, mode);
    }
    return this.callRealApi(text, mode);
  }

  async simulateApiCall(text, mode) {
    // Simuliere API-Call Delay
    await new Promise((resolve) =>
      setTimeout(resolve, CONFIG.UI.API_SIMULATION_DELAY)
    );

    // Generiere simulierte Antwort
    return generateSimulatedResponse(mode, text);
  }

  async callRealApi(text, mode) {
    // TODO: Implementiere echte API-Integration
    const modeConfig = TEXT_MODES[mode];
    if (!modeConfig) {
      throw new Error(`Unknown mode: ${mode}`);
    }

    try {
      const response = await fetch(CONFIG.API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: CONFIG.MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `${modeConfig.prompt}\n\n${text}` },
          ],
          max_tokens: CONFIG.MAX_TOKENS,
          temperature: CONFIG.TEMPERATURE,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  setSimulationMode(enabled) {
    this.isSimulationMode = enabled;
  }
}

