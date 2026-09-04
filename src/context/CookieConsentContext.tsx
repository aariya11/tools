import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CookiePreferences {
  necessary: boolean;      // Always true
  analytics: boolean;      // For privacy-first anonymous telemetry
  functional: boolean;     // For saving tool state, recently used tools
  advertising: boolean;    // For future monetization / ads
}

export interface CookieConsentContextType {
  hasConsent: boolean;
  preferences: CookiePreferences;
  isBannerOpen: boolean;
  isPreferencesModalOpen: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (custom: Partial<CookiePreferences>) => void;
  openPreferencesModal: () => void;
  closePreferencesModal: () => void;
  resetConsent: () => void;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  functional: false,
  advertising: false,
};

const COOKIE_STORAGE_KEY = 'toolboxx_cookie_consent_v1';

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasConsent, setHasConsent] = useState<boolean>(true); // initially true to avoid flash
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [isBannerOpen, setIsBannerOpen] = useState<boolean>(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences({
          necessary: true,
          analytics: Boolean(parsed.analytics),
          functional: Boolean(parsed.functional),
          advertising: Boolean(parsed.advertising),
        });
        setHasConsent(true);
        setIsBannerOpen(false);
      } else {
        setHasConsent(false);
        setIsBannerOpen(true);
      }
    } catch {
      setHasConsent(false);
      setIsBannerOpen(true);
    }
  }, []);

  const saveToStorage = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(
        COOKIE_STORAGE_KEY,
        JSON.stringify({
          ...prefs,
          updatedAt: new Date().toISOString(),
        })
      );
      // Dispatch standard event so scripts can listen
      window.dispatchEvent(
        new CustomEvent('cookie_consent_updated', {
          detail: prefs,
        })
      );
    } catch (err) {
      console.warn('Unable to persist cookie consent to localStorage', err);
    }
  };

  const acceptAll = () => {
    const full: CookiePreferences = {
      necessary: true,
      analytics: true,
      functional: true,
      advertising: true,
    };
    setPreferences(full);
    setHasConsent(true);
    setIsBannerOpen(false);
    setIsPreferencesModalOpen(false);
    saveToStorage(full);
  };

  const rejectNonEssential = () => {
    const minimal: CookiePreferences = {
      necessary: true,
      analytics: false,
      functional: false,
      advertising: false,
    };
    setPreferences(minimal);
    setHasConsent(true);
    setIsBannerOpen(false);
    setIsPreferencesModalOpen(false);
    saveToStorage(minimal);
  };

  const savePreferences = (custom: Partial<CookiePreferences>) => {
    const updated: CookiePreferences = {
      necessary: true,
      analytics: Boolean(custom.analytics),
      functional: Boolean(custom.functional),
      advertising: Boolean(custom.advertising),
    };
    setPreferences(updated);
    setHasConsent(true);
    setIsBannerOpen(false);
    setIsPreferencesModalOpen(false);
    saveToStorage(updated);
  };

  const openPreferencesModal = () => {
    setIsPreferencesModalOpen(true);
  };

  const closePreferencesModal = () => {
    setIsPreferencesModalOpen(false);
  };

  const resetConsent = () => {
    try {
      localStorage.removeItem(COOKIE_STORAGE_KEY);
    } catch {}
    setHasConsent(false);
    setIsBannerOpen(true);
  };

  return (
    <CookieConsentContext.Provider
      value={{
        hasConsent,
        preferences,
        isBannerOpen,
        isPreferencesModalOpen,
        acceptAll,
        rejectNonEssential,
        savePreferences,
        openPreferencesModal,
        closePreferencesModal,
        resetConsent,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
};
