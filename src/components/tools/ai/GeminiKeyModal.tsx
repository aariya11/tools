import React, { useState, useEffect } from 'react';
import { Sparkles, Key, Check, AlertCircle, X, ExternalLink, Cpu, Eye, EyeOff, Loader2, ShieldCheck, Trash2 } from 'lucide-react';
import {
  getGeminiApiKey,
  setGeminiApiKey,
  removeGeminiApiKey,
  hasGeminiApiKey,
  getSelectedGeminiModel,
  setSelectedGeminiModel,
  validateGeminiApiKey,
  subscribeToGeminiKeyChange,
  GEMINI_MODELS,
} from '../../../utils/geminiClient';
import { showToast } from '../../common/Toast';

interface GeminiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiKeyModal: React.FC<GeminiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-1.5-flash');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{ valid?: boolean; error?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(getGeminiApiKey());
      setSelectedModel(getSelectedGeminiModel());
      setValidationResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      removeGeminiApiKey();
      showToast({ type: 'info', title: 'API Key Cleared', message: 'Switched to local smart NLP engine.' });
      onClose();
      return;
    }

    setGeminiApiKey(trimmed);
    setSelectedGeminiModel(selectedModel);
    showToast({ type: 'success', title: 'Gemini Key Saved', message: 'Gemini AI mode is now enabled!' });
    onClose();
  };

  const handleTest = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      setValidationResult({ valid: false, error: 'Please enter an API key to test.' });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    const res = await validateGeminiApiKey(trimmed);
    setIsValidating(false);
    setValidationResult(res);

    if (res.valid) {
      showToast({ type: 'success', title: 'Connection Successful', message: 'Gemini API key is active and working!' });
    } else {
      showToast({ type: 'error', title: 'Connection Failed', message: res.error || 'Invalid API key.' });
    }
  };

  const handleRemove = () => {
    removeGeminiApiKey();
    setApiKeyInput('');
    setValidationResult(null);
    showToast({ type: 'info', title: 'Key Removed', message: 'Switched to offline NLP mode.' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--c-surface)',
          borderColor: 'var(--c-border)',
          color: 'var(--c-text)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-card)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border"
              style={{
                backgroundColor: 'var(--c-bg)',
                borderColor: 'var(--c-border)',
                color: 'var(--c-gold)',
              }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm font-serif" style={{ color: 'var(--c-text)' }}>
                Gemini AI Configuration
              </h3>
              <p className="text-xs" style={{ color: 'var(--c-muted)' }}>
                Connect Google Generative AI for deep LLM responses
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:opacity-80 cursor-pointer"
            style={{ color: 'var(--c-muted)' }}
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Dual Mode Callout */}
          <div
            className="p-3.5 rounded-xl border text-xs space-y-2 leading-relaxed"
            style={{
              backgroundColor: 'var(--c-bg)',
              borderColor: 'var(--c-border)',
              color: 'var(--c-muted)',
            }}
          >
            <div className="flex items-center gap-2 font-semibold" style={{ color: 'var(--c-text)' }}>
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Free & Privacy-Preserving</span>
            </div>
            <p>
              ToolBoxX includes built-in smart client-side NLP algorithms that work <strong>100% offline</strong> in your browser with zero latency. 
              Optionally provide your own Google Gemini API key to unlock full neural language generation.
            </p>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
                Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs flex items-center gap-1 hover:underline"
                style={{ color: 'var(--c-gold)' }}
              >
                <span>Get Free Key at Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setValidationResult(null);
                }}
                placeholder="AIzaSy..."
                className="w-full pl-3 pr-10 py-2.5 rounded-xl border text-sm font-mono tracking-wide focus:outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--c-bg)',
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-text)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 p-1 rounded transition-colors cursor-pointer"
                style={{ color: 'var(--c-subtle)' }}
                aria-label={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Model Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
              Preferred Gemini Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--c-bg)',
                borderColor: 'var(--c-border)',
                color: 'var(--c-text)',
              }}
            >
              {GEMINI_MODELS.map((m) => (
                <option key={m.id} value={m.id} style={{ backgroundColor: 'var(--c-surface)', color: 'var(--c-text)' }}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Validation Status */}
          {validationResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                validationResult.valid
                  ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-900/60 text-rose-300'
              }`}
            >
              {validationResult.valid ? (
                <>
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>API Key verified successfully! Gemini generative mode is ready.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{validationResult.error || 'API Key is invalid.'}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between gap-3"
          style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-card)' }}
        >
          {apiKeyInput ? (
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-950/40 text-rose-400 border border-rose-900/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Disconnect Key
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={isValidating || !apiKeyInput.trim()}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
              style={{
                backgroundColor: 'var(--c-bg)',
                borderColor: 'var(--c-border)',
                color: 'var(--c-text)',
              }}
            >
              {isValidating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
              Test Connection
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              style={{
                backgroundColor: 'var(--c-gold)',
                color: '#11110F',
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GeminiBanner: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [modelName, setModelName] = useState<string>('gemini-1.5-flash');
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setHasKey(hasGeminiApiKey());
    setModelName(getSelectedGeminiModel());

    const unsubscribe = subscribeToGeminiKeyChange((key) => {
      setHasKey(Boolean(key));
      setModelName(getSelectedGeminiModel());
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <div
        className="mb-6 p-3.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm transition-all"
        style={{
          backgroundColor: 'var(--c-card)',
          borderColor: 'var(--c-border)',
        }}
      >
        <div className="flex items-center gap-2.5">
          {hasKey ? (
            <div className="relative flex items-center justify-center w-2.5 h-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
          ) : (
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--c-gold)' }} />
          )}

          <div className="flex items-center gap-2">
            <span className="font-bold" style={{ color: 'var(--c-text)' }}>
              {hasKey ? 'Google Gemini AI Connected' : '⚡ Offline Smart NLP Engine'}
            </span>
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-mono border hidden sm:inline-block"
              style={{
                backgroundColor: 'var(--c-bg)',
                borderColor: 'var(--c-border)',
                color: 'var(--c-muted)',
              }}
            >
              {hasKey ? modelName : 'Local • 100% Private • Instant'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-102 active:scale-98 ml-auto sm:ml-0 cursor-pointer"
          style={{
            backgroundColor: 'var(--c-bg)',
            borderColor: hasKey ? 'var(--c-border)' : 'var(--c-gold)',
            color: hasKey ? 'var(--c-muted)' : 'var(--c-gold)',
          }}
        >
          {hasKey ? (
            <>
              <Key className="w-3.5 h-3.5" /> Manage API Key
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> Connect Gemini Key
            </>
          )}
        </button>
      </div>

      <GeminiKeyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
