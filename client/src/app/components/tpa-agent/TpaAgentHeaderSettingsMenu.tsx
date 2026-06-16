import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Dropdown,
  DropdownItem,
  DropdownList,
  Icon,
  MenuToggle,
} from "@patternfly/react-core";
import CogIcon from "@patternfly/react-icons/dist/esm/icons/cog-icon";

import { Paths } from "@app/Routes";

import { TPA_INTELLIGENCE_ASSISTANT_DISPLAY_NAME } from "./constants";

interface TpaAgentHeaderSettingsMenuProps {
  /** Match ChatbotHeaderOptionsDropdown — full-size icons in the popup header. */
  isCompact?: boolean;
}

export const TpaAgentHeaderSettingsMenu: React.FC<
  TpaAgentHeaderSettingsMenuProps
> = ({ isCompact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const goTo = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(_event, open) => setIsOpen(open)}
      popperProps={{ position: "right" }}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          aria-label={`${TPA_INTELLIGENCE_ASSISTANT_DISPLAY_NAME} settings`}
          className={`pf-chatbot__button--toggle-options tpa-agent-settings-menu__toggle${isCompact ? " pf-m-compact" : ""}`}
          icon={
            <Icon isInline size={isCompact ? "lg" : "xl"}>
              <CogIcon aria-hidden />
            </Icon>
          }
          isExpanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          size={isCompact ? "sm" : undefined}
          variant="plain"
        />
      )}
    >
      <DropdownList>
        <DropdownItem onClick={() => goTo(Paths.tpaAgentPrompts)}>
          Prompt manager
        </DropdownItem>
        <DropdownItem onClick={() => goTo(Paths.tpaAgentMcp)}>
          MCP settings
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};
