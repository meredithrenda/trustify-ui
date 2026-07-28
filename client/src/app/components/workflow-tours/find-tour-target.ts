/** Prefer the interactive control (menu row / button) over an inner label span. */
const preferHighlightNode = (el: HTMLElement): HTMLElement => {
  const option = el.closest<HTMLElement>('[role="option"], [role="menuitem"]');
  if (option) {
    return option;
  }
  const button = el.closest<HTMLElement>("button, a, [role='button']");
  if (button) {
    return button;
  }
  return el;
};

const isVisible = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  return rect.width > 1 && rect.height > 1;
};

const findVisibleOptionByLabel = (label: string): HTMLElement | null => {
  const items = document.querySelectorAll<HTMLElement>(
    '[role="option"], [role="menuitem"]',
  );
  for (const item of items) {
    if (item.textContent?.trim() === label && isVisible(item)) {
      return item;
    }
  }
  return null;
};

/** Find the visible DOM node for a tour step highlight. */
export const findTourTarget = (tourAttr: string): HTMLElement | null => {
  const attributed = [
    ...document.querySelectorAll<HTMLElement>(`[data-tour="${tourAttr}"]`),
  ];
  const visibleAttributed = attributed.find(isVisible);
  if (visibleAttributed) {
    return preferHighlightNode(visibleAttributed);
  }

  // Menu items are portaled and may mount a frame after the step advances.
  if (tourAttr.endsWith(".run-policy")) {
    return findVisibleOptionByLabel("Run policy evaluation");
  }

  const contrastTourLabels: Record<string, string> = {
    "switch-contrast-modes.choose-glass": "Glass",
    "switch-contrast-modes.choose-dark": "Dark",
    "switch-contrast-modes.choose-light": "Light",
    "switch-contrast-modes.choose-high-contrast": "High contrast",
  };
  const label = contrastTourLabels[tourAttr];
  if (label) {
    return findVisibleOptionByLabel(label);
  }

  return null;
};
