/** Prefer the interactive control (menu row / button) over an inner label span. */
const preferHighlightNode = (el: HTMLElement): HTMLElement => {
  // Full menus should stay full-size (multi-action steps).
  if (
    el.classList.contains("pf-v6-c-menu") ||
    el.getAttribute("data-tour")?.endsWith(".appearance-menu")
  ) {
    return el;
  }
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

const findVisibleAppearanceMenu = (): HTMLElement | null => {
  const menus = document.querySelectorAll<HTMLElement>(".pf-v6-c-menu");
  for (const menu of menus) {
    const text = menu.textContent ?? "";
    if (
      isVisible(menu) &&
      text.includes("Light") &&
      text.includes("High contrast")
    ) {
      return menu;
    }
  }
  return null;
};

/** Find the visible DOM node for a tour step highlight. */
export const findTourTarget = (tourAttr: string): HTMLElement | null => {
  if (tourAttr === "switch-contrast-modes.appearance-menu") {
    const menu = findVisibleAppearanceMenu();
    if (menu) {
      menu.setAttribute("data-tour", tourAttr);
      return menu;
    }
  }

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
  };
  const label = contrastTourLabels[tourAttr];
  if (label) {
    return findVisibleOptionByLabel(label);
  }

  return null;
};
