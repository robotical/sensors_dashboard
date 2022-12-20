let hasSpacebarListenerBeenAdded = false;
let hasSpacebarPressed = false;

export const spacebarIsPressedRule = (val: number) => {
  if (!hasSpacebarListenerBeenAdded) {
    hasSpacebarListenerBeenAdded = true;
    window.addEventListener("keydown", spacebarListener);
  }
  return hasSpacebarPressed;
};

const spacebarListener = (e: KeyboardEvent) => {
  if (e.key === " ") {
    hasSpacebarPressed = true;
  }
};

export const spacebarRuleCleanup = () => {
  hasSpacebarPressed = false;
  hasSpacebarListenerBeenAdded = false;
  window.removeEventListener("keydown", spacebarListener);
};
