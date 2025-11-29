import { createContext, useContext, useEffect, useState } from 'react';

export type Settings = {
  nBack: number;
  durationSec: number;
};

const SETTINGS_KEY = 'nback-settings';
const defaultSettings: Settings = { nBack: 2, durationSec: 30 };

const loadSettings = (): Settings => {
  const raw =
    typeof window !== 'undefined'
      ? window.localStorage.getItem(SETTINGS_KEY)
      : null;
  if (!raw) return defaultSettings;
  try {
    const parsed = JSON.parse(raw);
    return {
      nBack: parsed.nBack ?? defaultSettings.nBack,
      durationSec: parsed.durationSec ?? defaultSettings.durationSec,
    };
  } catch (e) {
    console.error(e);
    return defaultSettings;
  }
};

type SettingsContextValue = {
  settings: Settings;
  updateSettings: (next: Partial<Settings>) => void;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
);

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (next: Partial<Settings>) =>
    setSettings((prev) => ({ ...prev, ...next }));

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Fast refresh対象のコンポーネントと併記するため許容
// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
};
