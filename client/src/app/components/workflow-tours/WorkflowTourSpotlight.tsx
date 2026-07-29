import React from "react";

import { Button, Content, Icon } from "@patternfly/react-core";
import GripVerticalIcon from "@patternfly/react-icons/dist/esm/icons/grip-vertical-icon";
import TimesIcon from "@patternfly/react-icons/dist/esm/icons/times-icon";

import { useWorkflowTours } from "./WorkflowToursProvider";
import { findTourTarget } from "./find-tour-target";

const CARD_MARGIN = 24;
const CARD_MAX_WIDTH = 352;

type CardPosition = { top: number; left: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const bottomRightPosition = (cardWidth: number, cardHeight: number): CardPosition => {
  const maxLeft = Math.max(CARD_MARGIN, window.innerWidth - cardWidth - CARD_MARGIN);
  const maxTop = Math.max(CARD_MARGIN, window.innerHeight - cardHeight - CARD_MARGIN);
  return { top: maxTop, left: maxLeft };
};

/**
 * Visual mock of a tour spotlight. Positions the highlight ring over the
 * element marked with data-tour matching the current step.
 * Action steps advance when the UI calls notifyTourAction — no Next needed.
 *
 * The step card stays bottom-right by default (predictable), and can be dragged
 * when it blocks something the reviewer needs to see.
 */
export const WorkflowTourSpotlight: React.FC = () => {
  const { activeTour, stepIndex, nextStep, dismissTour } = useWorkflowTours();
  const ringRef = React.useRef<HTMLDivElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [hasTarget, setHasTarget] = React.useState(false);
  const [cardPosition, setCardPosition] = React.useState<CardPosition>({
    top: CARD_MARGIN,
    left: CARD_MARGIN,
  });
  const [isDragging, setIsDragging] = React.useState(false);
  const userMovedRef = React.useRef(false);
  const dragOffsetRef = React.useRef({ x: 0, y: 0 });

  const step = activeTour?.steps[stepIndex];
  // Only spotlight when the step declares a target — omit tourAttr for
  // full-page review beats (e.g. high contrast applied).
  const tourAttr = step?.tourAttr ?? null;

  const placeBottomRight = React.useCallback(() => {
    const card = cardRef.current;
    const cardWidth = Math.min(
      card?.offsetWidth || CARD_MAX_WIDTH,
      window.innerWidth - CARD_MARGIN * 2,
    );
    const cardHeight = card?.offsetHeight || 200;
    setCardPosition(bottomRightPosition(cardWidth, cardHeight));
  }, []);

  React.useEffect(() => {
    userMovedRef.current = false;
    placeBottomRight();
  }, [tourAttr, stepIndex, activeTour?.id, placeBottomRight]);

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

  React.useEffect(() => {
    if (!isDragging) {
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      const card = cardRef.current;
      const cardWidth = card?.offsetWidth ?? CARD_MAX_WIDTH;
      const cardHeight = card?.offsetHeight ?? 200;
      const maxLeft = Math.max(
        CARD_MARGIN,
        window.innerWidth - cardWidth - CARD_MARGIN,
      );
      const maxTop = Math.max(
        CARD_MARGIN,
        window.innerHeight - cardHeight - CARD_MARGIN,
      );
      setCardPosition({
        top: clamp(event.clientY - dragOffsetRef.current.y, CARD_MARGIN, maxTop),
        left: clamp(
          event.clientX - dragOffsetRef.current.x,
          CARD_MARGIN,
          maxLeft,
        ),
      });
    };

    const onPointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [isDragging]);

  React.useEffect(() => {
    const onResize = () => {
      if (!userMovedRef.current) {
        placeBottomRight();
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [placeBottomRight]);

  if (!activeTour || !step) {
    return null;
  }

  const isLast = stepIndex >= activeTour.steps.length - 1;
  const awaitsAction = step.advanceOn === "action";
  const stepLabel = `Step ${stepIndex + 1} of ${activeTour.steps.length}`;

  const onDragHandlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (event.button !== 0) {
      return;
    }
    const card = cardRef.current;
    if (!card) {
      return;
    }
    const rect = card.getBoundingClientRect();
    dragOffsetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    userMovedRef.current = true;
    setIsDragging(true);
    event.preventDefault();
  };

  return (
    <>
      <div
        ref={ringRef}
        className="workflow-tour-spotlight__ring"
        hidden={!hasTarget}
        aria-hidden
      />
      <div
        ref={cardRef}
        className={`workflow-tour-spotlight${isDragging ? " workflow-tour-spotlight--dragging" : ""}`}
        role="dialog"
        aria-modal="false"
        aria-labelledby="workflow-tour-spotlight-title"
        style={{ top: cardPosition.top, left: cardPosition.left }}
      >
        <div
          className="workflow-tour-spotlight__drag-handle"
          onPointerDown={onDragHandlePointerDown}
          role="button"
          tabIndex={0}
          aria-label="Drag to move"
          title="Drag to move"
        >
          <Icon className="workflow-tour-spotlight__drag-icon">
            <GripVerticalIcon aria-hidden />
          </Icon>
          <Button
            variant="plain"
            aria-label="Dismiss tour"
            onClick={dismissTour}
            onPointerDown={(event) => event.stopPropagation()}
            icon={<TimesIcon />}
          />
        </div>
        <div className="workflow-tour-spotlight__header">
          <Content
            id="workflow-tour-spotlight-title"
            component="h2"
            className="workflow-tour-spotlight__title"
          >
            {step.title}
          </Content>
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
