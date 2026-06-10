import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

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
        <DropdownItem
          component={Link}
          onClick={() => setIsOpen(false)}
          to={Paths.tpaAgentPrompts}
        >
          Prompt manager
        </DropdownItem>
        <DropdownItem
          component={Link}
          onClick={() => setIsOpen(false)}
          to={Paths.tpaAgentMcp}
        >
          MCP settings
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};
