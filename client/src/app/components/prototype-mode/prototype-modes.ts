export const PROTOTYPE_MODES = {
  default: "default",
  correlation: "correlation",
} as const;

export type PrototypeMode =
  (typeof PROTOTYPE_MODES)[keyof typeof PROTOTYPE_MODES];

export const PROTOTYPE_MODE_LABELS: Record<PrototypeMode, string> = {
  [PROTOTYPE_MODES.default]: "Default",
  [PROTOTYPE_MODES.correlation]: "Correlation engine",
};

export const PROTOTYPE_MODE_STORAGE_KEY = "trustify-prototype-mode";

/** URL query param to deep-link a prototype mode for review. */
export const PROTOTYPE_MODE_URL_PARAM = "mode";

export const isPrototypeMode = (value: string): value is PrototypeMode =>
  Object.values(PROTOTYPE_MODES).includes(value as PrototypeMode);

export const resolvePrototypeModeFromSearch = (
  search: string,
): PrototypeMode | undefined => {
  const value = new URLSearchParams(search).get(PROTOTYPE_MODE_URL_PARAM);
  if (value && isPrototypeMode(value)) {
    return value;
  }
  return undefined;
};

export const readStoredPrototypeMode = (): PrototypeMode => {
  if (typeof sessionStorage === "undefined") {
    return PROTOTYPE_MODES.default;
  }

  const stored = sessionStorage.getItem(PROTOTYPE_MODE_STORAGE_KEY);
  if (stored && isPrototypeMode(stored)) {
    return stored;
  }

  return PROTOTYPE_MODES.default;
};

export const writeStoredPrototypeMode = (mode: PrototypeMode): void => {
  sessionStorage.setItem(PROTOTYPE_MODE_STORAGE_KEY, mode);
};
