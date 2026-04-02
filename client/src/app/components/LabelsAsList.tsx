import type React from "react";

import { Label, LabelGroup, Truncate } from "@patternfly/react-core";

import { joinKeyValueAsString } from "@app/api/model-utils";

interface LabelsAsListProps {
  defaultIsOpen?: boolean;
  value: { [key: string]: string };
  onClick?: (label: { key: string; value: string }) => void;
}

const getLabelColor = (
  key: string,
  value: string,
): "blue" | "purple" | "green" | "teal" | "orange" | "red" | "grey" => {
  if (key === "kind" && value === "aibom") return "purple";
  return "blue";
};

export const LabelsAsList: React.FC<LabelsAsListProps> = ({
  value,
  defaultIsOpen,
  onClick,
}) => {
  return (
    <LabelGroup defaultIsOpen={defaultIsOpen} numLabels={5}>
      {Object.entries(value)
        .sort(([keyA], [keyB]) => keyB.localeCompare(keyA))
        .map(([k, v]) => (
          <Label
            key={k}
            color={getLabelColor(k, v)}
            onClick={onClick ? () => onClick({ key: k, value: v }) : undefined}
          >
            <Truncate content={joinKeyValueAsString({ key: k, value: v })} />
          </Label>
        ))}
    </LabelGroup>
  );
};
