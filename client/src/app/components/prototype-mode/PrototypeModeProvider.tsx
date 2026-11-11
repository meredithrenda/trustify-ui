import React from "react";
import { useSearchParams } from "react-router-dom";

import {
  PROTOTYPE_MODE_URL_PARAM,
  PROTOTYPE_MODES,
  type PrototypeMode,
  readStoredPrototypeMode,
  resolvePrototypeModeFromSearch,
  writeStoredPrototypeMode,
} from "./prototype-modes";

type PrototypeModeContextValue = {
  mode: PrototypeMode;
  setMode: (mode: PrototypeMode) => void;
  isCorrelationMode: boolean;
};

const PrototypeModeContext =
  React.createContext<PrototypeModeContextValue | null>(null);

const readInitialPrototypeMode = (): PrototypeMode => {
  if (typeof window !== "undefined") {
    const fromUrl = resolvePrototypeModeFromSearch(window.location.search);
    if (fromUrl) {
      writeStoredPrototypeMode(fromUrl);
      return fromUrl;
    }
  }
  return readStoredPrototypeMode();
};

export const PrototypeModeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setModeState] = React.useState<PrototypeMode>(
    readInitialPrototypeMode,
  );

  React.useEffect(() => {
    const fromUrl = resolvePrototypeModeFromSearch(
      `?${searchParams.toString()}`,
    );
    if (fromUrl && fromUrl !== mode) {
      setModeState(fromUrl);
      writeStoredPrototypeMode(fromUrl);
    }
  }, [searchParams, mode]);

  const setMode = React.useCallback(
    (nextMode: PrototypeMode) => {
      setModeState(nextMode);
      writeStoredPrototypeMode(nextMode);

      const next = new URLSearchParams(searchParams);
      if (nextMode === PROTOTYPE_MODES.default) {
        next.delete(PROTOTYPE_MODE_URL_PARAM);
      } else {
        next.set(PROTOTYPE_MODE_URL_PARAM, nextMode);
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const value = React.useMemo(
    () => ({
      mode,
      setMode,
      isCorrelationMode: mode === PROTOTYPE_MODES.correlation,
    }),
    [mode, setMode],
  );

  return (
    <PrototypeModeContext.Provider value={value}>
      {children}
    </PrototypeModeContext.Provider>
  );
};

export const usePrototypeMode = (): PrototypeModeContextValue => {
  const context = React.useContext(PrototypeModeContext);
  if (!context) {
    throw new Error(
      "usePrototypeMode must be used within PrototypeModeProvider",
    );
  }
  return context;
};

/** Safe outside the demo chrome — returns Default when the provider is absent. */
export const usePrototypeModeOptional = (): PrototypeModeContextValue => {
  const context = React.useContext(PrototypeModeContext);
  if (context) {
    return context;
  }
  return {
    mode: PROTOTYPE_MODES.default,
    setMode: () => undefined,
    isCorrelationMode: false,
  };
};
