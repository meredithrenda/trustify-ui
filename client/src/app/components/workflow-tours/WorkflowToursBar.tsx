import React from "react";

import {
  Button,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Tooltip,
} from "@patternfly/react-core";
import InfoCircleIcon from "@patternfly/react-icons/dist/esm/icons/info-circle-icon";

import { WORKFLOW_TOURS } from "./tours";
import { useWorkflowTours } from "./WorkflowToursProvider";

const WORKFLOW_TOURS_HELP =
  "Select a workflow to open its starting page and follow highlighted steps.";

export const WorkflowToursBar: React.FC = () => {
  const { activeTour, startTour } = useWorkflowTours();
  const [isOpen, setIsOpen] = React.useState(false);

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      id="workflow-tours-select"
      aria-label="Select a workflow tour"
      size="sm"
      isExpanded={isOpen}
      onClick={() => setIsOpen((open) => !open)}
      className="workflow-tours-bar__toggle"
    >
      {activeTour?.label ?? "Select a workflow"}
    </MenuToggle>
  );

  return (
    <div className="workflow-tours-bar" role="region" aria-label="Workflow tours">
      <div className="workflow-tours-bar__inner">
        <span className="workflow-tours-bar__label">
          Workflow tours
          <Tooltip content={WORKFLOW_TOURS_HELP} position="bottom-start">
            <Button
              variant="plain"
              aria-label="About workflow tours"
              className="workflow-tours-bar__help"
              icon={<InfoCircleIcon />}
            />
          </Tooltip>
        </span>
        <Select
          id="workflow-tours-select-list"
          isOpen={isOpen}
          selected={activeTour?.id}
          onOpenChange={setIsOpen}
          onSelect={(_event, value) => {
            setIsOpen(false);
            if (value === undefined) {
              return;
            }
            startTour(String(value));
          }}
          toggle={toggle}
        >
          <SelectList>
            {WORKFLOW_TOURS.map((tour) => (
              <SelectOption
                key={tour.id}
                value={tour.id}
                description={tour.summary}
              >
                {tour.label}
              </SelectOption>
            ))}
          </SelectList>
        </Select>
      </div>
    </div>
  );
};
