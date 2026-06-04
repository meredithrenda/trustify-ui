import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
} from "@patternfly/react-core";
import CogIcon from "@patternfly/react-icons/dist/esm/icons/cog-icon";

import { Paths } from "@app/Routes";

import { TPA_INTELLIGENCE_ASSISTANT_DISPLAY_NAME } from "./constants";

export const TpaAgentHeaderSettingsMenu: React.FC = () => {
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
          className="tpa-agent-settings-menu__toggle"
          isExpanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          variant="plain"
        >
          <CogIcon aria-hidden className="tpa-agent-settings-menu__icon" />
        </MenuToggle>
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
