/**
 * Gemini AI Client Utility for ToolBoxX
 * Enables direct client-side requests to Google Generative Language API
 * with local storage persistence, multi-model support, and graceful fallback.
 */

const STORAGE_KEY = 'toolboxx_gemini_api_key';
const MODEL_KEY = 'toolboxx_gemini_model';
const EVENT_NAME = 'toolboxx_gemini_key_changed';

export const GEMINI_MODELS = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Fast & Balanced)', recommended: true },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Next-Gen Speed)' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Deep Reasoning)' },
];

export function getGeminiApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY) || '';
}

export function setGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = key.trim();
  if (trimmed) {
    localStorage.setItem(STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { key: trimmed } }));
}

export function removeGeminiApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { key: '' } }));
}

export function hasGeminiApiKey(): boolean {
  return Boolean(getGeminiApiKey());
}

export function getSelectedGeminiModel(): string {
  if (typeof window === 'undefined') return 'gemini-1.5-flash';
  return localStorage.getItem(MODEL_KEY) || 'gemini-1.5-flash';
}

export function setSelectedGeminiModel(model: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MODEL_KEY, model);
}

export function subscribeToGeminiKeyChange(callback: (key: string) => void): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<{ key: string }>;
    callback(customEvent.detail?.key || getGeminiApiKey());
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

export interface GeminiCallParams {
  prompt: string;
  systemInstruction?: string;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Execute a Gemini AI API Call directly from the browser
 */
export async function callGeminiApi({
  prompt,
  systemInstruction,
  apiKey,
  model,
  temperature = 0.7,
  maxTokens = 3000,
}: GeminiCallParams): Promise<string> {
  const key = (apiKey || getGeminiApiKey()).trim();
  if (!key) {
    throw new Error('No Gemini API key configured. Connect your Gemini API Key in settings or use Offline NLP mode.');
  }

  const selectedModel = model || getSelectedGeminiModel() || 'gemini-1.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${key}`;

  const bodyPayload: Record<string, any> = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      topP: 0.95,
      topK: 40,
    },
  };

  if (systemInstruction) {
    bodyPayload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });
  } catch (netErr: any) {
    throw new Error(`Network error connecting to Gemini API: ${netErr.message || netErr}`);
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error?.message || response.statusText;
    } catch {
      errorDetail = response.statusText;
    }

    if (response.status === 400) {
      throw new Error(`Gemini API Error (400): ${errorDetail}`);
    } else if (response.status === 403) {
      throw new Error(`Gemini API Error (403): Access denied. Make sure your API key has Generative Language API enabled.`);
    } else if (response.status === 429) {
      throw new Error(`Gemini Rate Limit (429): Quota exceeded. Please wait a few moments before trying again.`);
    } else {
      throw new Error(`Gemini API Error (${response.status}): ${errorDetail}`);
    }
  }

  const data = await response.json();
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof textOutput !== 'string') {
    const finishReason = data?.candidates?.[0]?.finishReason;
    if (finishReason === 'SAFETY') {
      throw new Error('Gemini output was blocked due to safety guidelines.');
    }
    throw new Error('Received unexpected empty response from Gemini API.');
  }

  return textOutput.trim();
}

/**
 * Validate a user-provided Gemini API Key
 */
export async function validateGeminiApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    return { valid: false, error: 'API key cannot be empty.' };
  }

  try {
    const res = await callGeminiApi({
      prompt: 'Respond with the word OK',
      apiKey: trimmed,
      model: 'gemini-1.5-flash',
      temperature: 0.1,
      maxTokens: 10,
    });
    if (res) {
      return { valid: true };
    }
    return { valid: false, error: 'Received empty response from validation test.' };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Failed to validate API key.' };
  }
}
