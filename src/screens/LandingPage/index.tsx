import Header from "../../components/Header";
import MainContent from "../../components/MainContent";
import styles from "./styles.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ModalEventTopics,
  ModalStateData,
} from "../../state-observables/modal/ModalObserver";
import modalState from "../../state-observables/modal/ModalState";

import Modal from "../../components/Modal";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

type Props = {
  isInModal?: boolean;
}

type ScrollTarget = HTMLElement | Window;

type ScrollCueState = {
  canScrollDown: boolean;
  canScrollUp: boolean;
  hasMeasured: boolean;
  isScrollable: boolean;
  scrollProgress: number;
};

const isWindowTarget = (target: ScrollTarget): target is Window => target === window;

const getScrollTop = (target: ScrollTarget) =>
  isWindowTarget(target)
    ? window.scrollY || document.documentElement.scrollTop || 0
    : target.scrollTop;

const getClientHeight = (target: ScrollTarget) =>
  isWindowTarget(target) ? window.innerHeight : target.clientHeight;

const getScrollHeight = (target: ScrollTarget) =>
  isWindowTarget(target)
    ? Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      )
    : target.scrollHeight;

const isScrollableElement = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);
  const hasScrollableOverflow =
    style.overflowY === "auto" ||
    style.overflowY === "scroll" ||
    style.overflowY === "overlay";

  return hasScrollableOverflow && element.scrollHeight > element.clientHeight + 1;
};

const canScrollInDirection = (target: ScrollTarget, deltaY: number) => {
  const maxScrollTop = getScrollHeight(target) - getClientHeight(target);
  const scrollTop = getScrollTop(target);

  if (deltaY > 0) {
    return scrollTop < maxScrollTop - 1;
  }

  if (deltaY < 0) {
    return scrollTop > 1;
  }

  return false;
};

const normaliseWheelDeltaY = (event: WheelEvent, target: ScrollTarget) => {
  if (event.deltaMode === 1) {
    return event.deltaY * 16;
  }

  if (event.deltaMode === 2) {
    return event.deltaY * getClientHeight(target);
  }

  return event.deltaY;
};

const getEventElement = (target: EventTarget | null) => {
  if (target instanceof HTMLElement) {
    return target;
  }

  if (target instanceof Element) {
    return target.parentElement;
  }

  return null;
};

const hasNestedScrollableTarget = (
  target: EventTarget | null,
  boundary: HTMLElement,
  deltaY: number
) => {
  let currentElement = getEventElement(target);

  while (currentElement && currentElement !== boundary) {
    if (
      isScrollableElement(currentElement) &&
      canScrollInDirection(currentElement, deltaY)
    ) {
      return true;
    }

    currentElement = currentElement.parentElement;
  }

  return false;
};

export default function LandingPage({ isInModal }: Props) {
  const [modalData, setModalData] = useState<null | ModalStateData>(null);
  const [shouldCloseModal, setShouldCloseModal] = useState(false);

  const mainRef = useRef<HTMLDivElement>(null);
  const isModalOpen = Boolean(modalData?.modalContent);

  // Create subscription to the modal state
  useEffect(() => {
    const subscriptionHelper = {
      notify(eventTopic: ModalEventTopics, eventData?: ModalStateData) {
        switch (eventTopic) {
          case "SetModal":
            if (eventData) {
              setModalData(eventData);
            }
            break;
          case "CloseModal":
            setShouldCloseModal(true);
            break;
        }
      },
    };
    // Subscribe
    modalState.subscribe(subscriptionHelper, ["SetModal", "CloseModal"]);

    // Return unsubscribe function
    return () => {
      modalState.unsubscribe(subscriptionHelper);
    };
  }, []);

  const resetModal = () => {
    setShouldCloseModal(false);
    setModalData(null);
  };

  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) {
      return undefined;
    }

    if (isModalOpen) {
      mainElement.setAttribute("inert", "");
    } else {
      mainElement.removeAttribute("inert");
    }

    return () => {
      mainElement.removeAttribute("inert");
    };
  }, [isModalOpen]);

  return (
    <>
      {isModalOpen && <Modal
          title={modalData?.modalTitle ?? ""}
          modalResetter={resetModal}
          shouldCloseModal={shouldCloseModal}
          withLogo={modalData?.withLogo ?? true}
        >
          {modalData?.modalContent}
        </Modal>
      }
      <div id="sensors-dashboard-modal-main-container"></div>
      <main
        aria-label="Sensor Insights Hub"
        aria-hidden={isModalOpen || undefined}
        className={`${styles.mainContainer} ${isInModal ? styles.mainContainerInModal : ""}`}
        ref={mainRef}
        tabIndex={0}
      >
        <ScrollCue mainRef={mainRef} />
        <Header isInModal={isInModal} />
        <MainContent mainRef={mainRef}/>
      </main>
    </>
  );
}

function ScrollCue({ mainRef }: { mainRef: React.RefObject<HTMLDivElement> }) {
  const scrollTargetRef = useRef<ScrollTarget | null>(null);
  const [scrollCueState, setScrollCueState] = useState<ScrollCueState>({
    canScrollDown: false,
    canScrollUp: false,
    hasMeasured: false,
    isScrollable: false,
    scrollProgress: 0,
  });

  const getScrollTarget = useCallback((): ScrollTarget => {
    let currentElement: HTMLElement | null = mainRef.current;

    while (currentElement) {
      if (isScrollableElement(currentElement)) {
        return currentElement;
      }

      currentElement = currentElement.parentElement;
    }

    return window;
  }, [mainRef]);

  const updateScrollCue = useCallback(() => {
    const target = getScrollTarget();
    const maxScrollTop = getScrollHeight(target) - getClientHeight(target);
    const scrollTop = getScrollTop(target);
    const scrollProgress = maxScrollTop > 1 ? scrollTop / maxScrollTop : 0;
    const nextState = {
      canScrollDown: scrollTop < maxScrollTop - 1,
      canScrollUp: scrollTop > 1,
      hasMeasured: true,
      isScrollable: maxScrollTop > 1,
      scrollProgress: Math.min(Math.max(scrollProgress, 0), 1),
    };

    scrollTargetRef.current = target;
    setScrollCueState((currentState) =>
      currentState.canScrollDown === nextState.canScrollDown &&
      currentState.canScrollUp === nextState.canScrollUp &&
      currentState.hasMeasured === nextState.hasMeasured &&
      currentState.isScrollable === nextState.isScrollable &&
      Math.abs(currentState.scrollProgress - nextState.scrollProgress) < 0.01
        ? currentState
        : nextState
    );
  }, [getScrollTarget]);

  useEffect(() => {
    const watchedTargets: ScrollTarget[] = [];
    let currentElement: HTMLElement | null = mainRef.current;
    let mutationAnimationFrame: number | null = null;
    let secondAnimationFrame: number | null = null;

    while (currentElement) {
      watchedTargets.push(currentElement);
      currentElement = currentElement.parentElement;
    }

    watchedTargets.push(window);

    const scheduleScrollCueUpdate = () => {
      if (mutationAnimationFrame !== null) {
        return;
      }

      mutationAnimationFrame = requestAnimationFrame(() => {
        mutationAnimationFrame = null;
        updateScrollCue();
      });
    };

    const resizeObserver = new ResizeObserver(updateScrollCue);
    const mutationObserver = new MutationObserver(scheduleScrollCueUpdate);
    watchedTargets.forEach((target) => {
      target.addEventListener("scroll", updateScrollCue, { passive: true });
      if (!isWindowTarget(target)) {
        resizeObserver.observe(target);
      }
    });

    if (mainRef.current) {
      mutationObserver.observe(mainRef.current, {
        attributeFilter: ["class", "style"],
        attributes: true,
        childList: true,
        subtree: true,
      });
    }

    const timeoutIds = [80, 220, 500, 1000].map((delay) =>
      window.setTimeout(updateScrollCue, delay)
    );
    const animationFrame = requestAnimationFrame(() => {
      updateScrollCue();
      secondAnimationFrame = requestAnimationFrame(updateScrollCue);
    });
    window.addEventListener("resize", updateScrollCue);

    return () => {
      cancelAnimationFrame(animationFrame);
      if (secondAnimationFrame !== null) {
        cancelAnimationFrame(secondAnimationFrame);
      }
      if (mutationAnimationFrame !== null) {
        cancelAnimationFrame(mutationAnimationFrame);
      }
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      window.removeEventListener("resize", updateScrollCue);
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      watchedTargets.forEach((target) => {
        target.removeEventListener("scroll", updateScrollCue);
      });
    };
  }, [mainRef, updateScrollCue]);

  useEffect(() => {
    const mainElement = mainRef.current;

    if (!mainElement) {
      return undefined;
    }

    const handleWheel = (event: WheelEvent) => {
      const target = scrollTargetRef.current || getScrollTarget();
      const deltaY = normaliseWheelDeltaY(event, target);

      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        Math.abs(deltaY) < 1 ||
        Math.abs(deltaY) <= Math.abs(event.deltaX) ||
        hasNestedScrollableTarget(event.target, mainElement, deltaY) ||
        !canScrollInDirection(target, deltaY)
      ) {
        return;
      }

      event.preventDefault();
      target.scrollBy({ top: deltaY, behavior: "auto" });
      requestAnimationFrame(updateScrollCue);
    };

    mainElement.addEventListener("wheel", handleWheel, {
      capture: true,
      passive: false,
    });

    return () => {
      mainElement.removeEventListener("wheel", handleWheel, { capture: true });
    };
  }, [getScrollTarget, mainRef, updateScrollCue]);

  if (scrollCueState.hasMeasured && !scrollCueState.isScrollable) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={styles.scrollCue}
      style={{
        "--scroll-cue-progress": scrollCueState.scrollProgress,
      } as React.CSSProperties}
    >
      <div className={styles.scrollCueControls}>
        <FaChevronUp
          className={`${styles.scrollCueIcon} ${!scrollCueState.canScrollUp ? styles.scrollCueIconMuted : ""}`}
        />
        <div className={styles.scrollCueTrack}>
          <div className={styles.scrollCueThumb} />
        </div>
        <FaChevronDown
          className={`${styles.scrollCueIcon} ${!scrollCueState.canScrollDown ? styles.scrollCueIconMuted : ""}`}
        />
      </div>
    </div>
  );
}
