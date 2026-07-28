import React from "react";

import { Button, Content } from "@patternfly/react-core";
import TimesIcon from "@patternfly/react-icons/dist/esm/icons/times-icon";

import { useWorkflowTours } from "./WorkflowToursProvider";
import { findTourTarget } from "./find-tour-target";

/**
 * Visual mock of a tour spotlight. Positions the highlight ring over the
 * element marked with data-tour matching the current step.
 * Action steps advance when the UI calls notifyTourAction — no Next needed.
 *
 * Ring position tracks the live target every animation frame so portaled
 * menus (Actions → Run policy) are correct after Popper finishes layout.
 */
export const WorkflowTourSpotlight: React.FC = () => {
  const { activeTour, stepIndex, nextStep, dismissTour } = useWorkflowTours();
  const ringRef = React.useRef<HTMLDivElement>(null);
  const [hasTarget, setHasTarget] = React.useState(false);

  const step = activeTour?.steps[stepIndex];
  const tourAttr =
    step?.tourAttr ??
    (activeTour && step ? `${activeTour.id}.${step.id}` : null);

  React.useLayoutEffect(() => {
    if (!tourAttr) {
      setHasTarget(false);
      return;
    }

    let rafId = 0;
    let lastKey = "";

    const updateRing = () => {
      const ring = ringRef.current;
      const target = findTourTarget(tourAttr);
      if (!ring || !target) {
        if (lastKey !== "") {
          lastKey = "";
          setHasTarget(false);
        }
        return;
      }
      const rect = target.getBoundingClientRect();
      const pad = 8;
      const top = Math.max(0, rect.top - pad);
      const left = Math.max(0, rect.left - pad);
      const width = rect.width + pad * 2;
      const height = rect.height + pad * 2;
      const key = `${top}:${left}:${width}:${height}`;
      if (key !== lastKey) {
        lastKey = key;
        ring.style.top = `${top}px`;
        ring.style.left = `${left}px`;
        ring.style.width = `${width}px`;
        ring.style.height = `${height}px`;
        setHasTarget(true);
      }
    };

    const tick = () => {
      updateRing();
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [tourAttr, stepIndex, activeTour?.id]);

  if (!activeTour || !step) {
    return null;
  }

  const isLast = stepIndex >= activeTour.steps.length - 1;
  const awaitsAction = step.advanceOn === "action";
  const stepLabel = `Step ${stepIndex + 1} of ${activeTour.steps.length}`;

  return (
    <>
      <div
        ref={ringRef}
        className="workflow-tour-spotlight__ring"
        hidden={!hasTarget}
        aria-hidden
      />
      <div
        className="workflow-tour-spotlight"
        role="dialog"
        aria-modal="false"
        aria-labelledby="workflow-tour-spotlight-title"
      >
        <div className="workflow-tour-spotlight__header">
          <Content
            id="workflow-tour-spotlight-title"
            component="h2"
            className="workflow-tour-spotlight__title"
          >
            {step.title}
          </Content>
          <Button
            variant="plain"
            aria-label="Dismiss tour"
            onClick={dismissTour}
            icon={<TimesIcon />}
          />
        </div>
        <Content component="p" className="workflow-tour-spotlight__body">
          {step.body}
        </Content>
        {step.annotation ? (
          <aside
            className="workflow-tour-spotlight__annotation"
            aria-label="Design annotation"
          >
            <span className="workflow-tour-spotlight__annotation-label">
              Design annotation
            </span>
            <Content
              component="p"
              className="workflow-tour-spotlight__annotation-text"
            >
              {step.annotation}
            </Content>
          </aside>
        ) : null}
        <div className="workflow-tour-spotlight__footer">
          <span className="workflow-tour-spotlight__meta">{stepLabel}</span>
          <div className="workflow-tour-spotlight__actions">
            <Button variant="link" onClick={dismissTour}>
              Dismiss
            </Button>
            {awaitsAction ? null : (
              <Button variant="primary" onClick={nextStep}>
                {isLast ? "Done" : "Next"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
