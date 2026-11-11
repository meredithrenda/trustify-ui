import type React from "react";

import { ToggleGroup, ToggleGroupItem } from "@patternfly/react-core";

import {
  PROTOTYPE_MODE_LABELS,
  PROTOTYPE_MODES,
  type PrototypeMode,
} from "./prototype-modes";
import { usePrototypeMode } from "./PrototypeModeProvider";

const PROTOTYPE_MODE_OPTIONS = [
  PROTOTYPE_MODES.default,
  PROTOTYPE_MODES.correlation,
] as const;

export const PrototypeModeSwitcher: React.FC = () => {
  const { mode, setMode } = usePrototypeMode();

  return (
    <div className="workflow-tours-bar__mode">
      <span className="workflow-tours-bar__mode-label">Prototype</span>
      <ToggleGroup isCompact aria-label="Prototype mode">
        {PROTOTYPE_MODE_OPTIONS.map((option) => (
          <ToggleGroupItem
            key={option}
            text={PROTOTYPE_MODE_LABELS[option]}
            aria-label={PROTOTYPE_MODE_LABELS[option]}
            isSelected={mode === option}
            data-testid={`prototype-mode-${option}`}
            onChange={(_event, selected) => {
              if (selected) {
                setMode(option as PrototypeMode);
              }
            }}
          />
        ))}
      </ToggleGroup>
    </div>
  );
};
