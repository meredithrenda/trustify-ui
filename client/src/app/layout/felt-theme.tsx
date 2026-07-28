import React from "react";

import {
  ThemeContext,
  type ThemeMode,
  isThemeModeValid,
} from "@tsd-ui/core";

import {
  Divider,
  Icon,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectGroup,
  SelectList,
  SelectOption,
} from "@patternfly/react-core";
import AdjustIcon from "@patternfly/react-icons/dist/esm/icons/adjust-icon";
import CogIcon from "@patternfly/react-icons/dist/esm/icons/cog-icon";
import DesktopIcon from "@patternfly/react-icons/dist/esm/icons/desktop-icon";
import LayerGroupIcon from "@patternfly/react-icons/dist/esm/icons/layer-group-icon";
import OutlinedMoonIcon from "@patternfly/react-icons/dist/esm/icons/outlined-moon-icon";
import OutlinedSunIcon from "@patternfly/react-icons/dist/esm/icons/outlined-sun-icon";
import PaletteIcon from "@patternfly/react-icons/dist/esm/icons/palette-icon";

import { useLocalStorage } from "@app/hooks/useStorage";

const FELT_THEME_CLASS = "pf-v6-theme-felt";
const GLASS_THEME_CLASS = "pf-v6-theme-glass";
const HIGH_CONTRAST_THEME_CLASS = "pf-v6-theme-high-contrast";

export const CONTRAST_STORAGE_KEY = "contrast-preference";

/** Matches PatternFly.org masthead theme switcher contrast options. */
export type ContrastMode = "glass" | "default" | "high-contrast";

type FeltThemeContextValue = {
  contrastMode: ContrastMode;
  setContrastMode: (mode: ContrastMode) => void;
  /** Effective contrast after OS accessibility overrides. */
  effectiveContrastMode: ContrastMode;
};

const FeltThemeContext = React.createContext<FeltThemeContextValue | null>(
  null,
);

const isContrastMode = (value: unknown): value is ContrastMode =>
  value === "glass" || value === "default" || value === "high-contrast";

const getSystemContrastOverride = (): ContrastMode | null => {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return null;
  }
  if (window.matchMedia("(prefers-contrast: more)").matches) {
    return "high-contrast";
  }
  if (window.matchMedia("(prefers-reduced-transparency: reduce)").matches) {
    return "default";
  }
  return null;
};

/**
 * Enables PatternFly Project Felt and manages contrast (glass / default /
 * high contrast) per the PatternFly glass mode handbook and masthead demo.
 */
export const FeltThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [contrastMode, setContrastMode] = useLocalStorage<ContrastMode>({
    key: CONTRAST_STORAGE_KEY,
    defaultValue: "glass",
  });
  const [systemOverride, setSystemOverride] = React.useState<
    ContrastMode | null
  >(getSystemContrastOverride);

  const preferredContrast = isContrastMode(contrastMode)
    ? contrastMode
    : "glass";
  const effectiveContrastMode = systemOverride ?? preferredContrast;

  React.useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.add(FELT_THEME_CLASS);
    return () => {
      htmlElement.classList.remove(FELT_THEME_CLASS);
    };
  }, []);

  React.useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.toggle(
      GLASS_THEME_CLASS,
      effectiveContrastMode === "glass",
    );
    htmlElement.classList.toggle(
      HIGH_CONTRAST_THEME_CLASS,
      effectiveContrastMode === "high-contrast",
    );
  }, [effectiveContrastMode]);

  React.useEffect(() => {
    const transparencyQuery = window.matchMedia(
      "(prefers-reduced-transparency: reduce)",
    );
    const contrastQuery = window.matchMedia("(prefers-contrast: more)");
    const handleChange = () => {
      setSystemOverride(getSystemContrastOverride());
    };

    transparencyQuery.addEventListener("change", handleChange);
    contrastQuery.addEventListener("change", handleChange);
    return () => {
      transparencyQuery.removeEventListener("change", handleChange);
      contrastQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return (
    <FeltThemeContext.Provider
      value={{
        contrastMode: preferredContrast,
        setContrastMode: (mode) => {
          if (isContrastMode(mode)) {
            setContrastMode(mode);
          }
        },
        effectiveContrastMode,
      }}
    >
      {children}
    </FeltThemeContext.Provider>
  );
};

export const useFeltTheme = (): FeltThemeContextValue => {
  const context = React.useContext(FeltThemeContext);
  if (!context) {
    throw new Error("useFeltTheme must be used within FeltThemeProvider");
  }
  return context;
};

const colorSchemeMetadata: Record<
  ThemeMode,
  {
    value: ThemeMode;
    icon: React.ReactNode;
    displayText: string;
  }
> = {
  light: {
    value: "light",
    icon: <OutlinedSunIcon />,
    displayText: "Light",
  },
  dark: {
    value: "dark",
    icon: <OutlinedMoonIcon />,
    displayText: "Dark",
  },
  system: {
    value: "system",
    icon: <DesktopIcon />,
    displayText: "System",
  },
};

const contrastMetadata: Record<
  ContrastMode,
  {
    value: ContrastMode;
    icon: React.ReactNode;
    displayText: string;
  }
> = {
  glass: {
    value: "glass",
    icon: <LayerGroupIcon />,
    displayText: "Glass",
  },
  default: {
    value: "default",
    icon: <PaletteIcon />,
    displayText: "Default contrast",
  },
  "high-contrast": {
    value: "high-contrast",
    icon: <AdjustIcon />,
    displayText: "High contrast",
  },
};

/**
 * Masthead appearance menu matching PatternFly.org / Project Felt demos:
 * Color scheme + Contrast (Glass / Default / High contrast).
 * Built with PatternFly Select — same pattern as the PF theme switcher.
 */
export const AppearanceSelector: React.FC = () => {
  const { mode, setMode } = React.useContext(ThemeContext);
  const { setContrastMode, effectiveContrastMode } = useFeltTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  const safeMode: ThemeMode = isThemeModeValid(mode) ? mode : "system";
  const selectedContrast = effectiveContrastMode;

  const handleSelect = (
    _event: unknown,
    value: string | number | undefined,
  ) => {
    if (typeof value !== "string") {
      return;
    }
    if (isContrastMode(value)) {
      setContrastMode(value);
      setIsOpen(false);
      return;
    }
    if (isThemeModeValid(value)) {
      setMode(value);
      setIsOpen(false);
    }
  };

  return (
    <Select
      isOpen={isOpen}
      selected={[safeMode, selectedContrast]}
      onSelect={handleSelect}
      onOpenChange={(open) => setIsOpen(open)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          variant="plain"
          onClick={() => setIsOpen(!isOpen)}
          isExpanded={isOpen}
          icon={
            <Icon size="lg">
              <CogIcon />
            </Icon>
          }
          aria-label={`Display settings. Color scheme: ${colorSchemeMetadata[safeMode].displayText}. Contrast: ${contrastMetadata[selectedContrast].displayText}.`}
        />
      )}
      shouldFocusToggleOnSelect
      onOpenChangeKeys={["Escape"]}
      popperProps={{
        position: "right",
        enableFlip: true,
        preventOverflow: true,
      }}
    >
      <SelectGroup
        label={
          <div
            className="pf-v6-c-menu__group-title"
            id="appearance-color-scheme-title"
          >
            Color scheme
          </div>
        }
      >
        <SelectList aria-labelledby="appearance-color-scheme-title">
          {(Object.keys(colorSchemeMetadata) as ThemeMode[]).map(
            (themeName) => {
              const item = colorSchemeMetadata[themeName];
              return (
                <SelectOption
                  key={themeName}
                  value={item.value}
                  icon={item.icon}
                >
                  {item.displayText}
                </SelectOption>
              );
            },
          )}
        </SelectList>
      </SelectGroup>
      <Divider component="li" />
      <SelectGroup
        label={
          <div
            className="pf-v6-c-menu__group-title"
            id="appearance-contrast-title"
          >
            Contrast
          </div>
        }
      >
        <SelectList aria-labelledby="appearance-contrast-title">
          {(Object.keys(contrastMetadata) as ContrastMode[]).map((key) => {
            const item = contrastMetadata[key];
            return (
              <SelectOption key={key} value={item.value} icon={item.icon}>
                {item.displayText}
              </SelectOption>
            );
          })}
        </SelectList>
      </SelectGroup>
    </Select>
  );
};
