let hasQListenerBeenAdded = false;
let hasQPressed = false;

export const qIsPressedRule = (val: number) => {
  if (!hasQListenerBeenAdded) {
    hasQListenerBeenAdded = true;
    window.addEventListener("keydown", qListener);
  }
  return hasQPressed;
};

const qListener = (e: KeyboardEvent) => {
  if (e.key === "q") {
    hasQPressed = true;
  }
};

export const qRuleCleanup = () => {
  hasQPressed = false;
  hasQListenerBeenAdded = false;
  window.removeEventListener("keydown", qListener);
};
