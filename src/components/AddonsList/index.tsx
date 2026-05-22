import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import styles from "./styles.module.css";
import AddonItem from "./AddonItem";
import Addon from "../../models/addons/Addon";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface AddonsListProps {
  addons: Addon[];
}

const SCROLL_STEP_PX = 160;

export default function AddonsList({ addons }: AddonsListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [scrollControls, setScrollControls] = useState({
    canScrollDown: false,
    canScrollUp: false,
  });

  const updateScrollControls = useCallback(() => {
    const container = parentRef.current;

    if (!container) {
      return;
    }

    const maxScrollTop = container.scrollHeight - container.clientHeight;
    const nextControls = {
      canScrollDown: container.scrollTop < maxScrollTop - 1,
      canScrollUp: container.scrollTop > 1,
    };

    setScrollControls((currentControls) =>
      currentControls.canScrollDown === nextControls.canScrollDown &&
      currentControls.canScrollUp === nextControls.canScrollUp
        ? currentControls
        : nextControls
    );
  }, []);

  const scrollList = useCallback((direction: "down" | "up") => {
    const container = parentRef.current;

    if (!container) {
      return;
    }

    const top = direction === "down" ? SCROLL_STEP_PX : -SCROLL_STEP_PX;

    if (typeof container.scrollBy === "function") {
      container.scrollBy({ top, behavior: "smooth" });
    } else {
      container.scrollTop += top;
    }

    requestAnimationFrame(updateScrollControls);
  }, [updateScrollControls]);

  useEffect(() => {
    updateScrollControls();
  }, [addons, updateScrollControls]);

  useEffect(() => {
    const container = parentRef.current;

    if (!container) {
      return undefined;
    }

    const animationFrame = requestAnimationFrame(updateScrollControls);

    container.addEventListener("scroll", updateScrollControls, { passive: true });
    window.addEventListener("resize", updateScrollControls);

    return () => {
      cancelAnimationFrame(animationFrame);
      container.removeEventListener("scroll", updateScrollControls);
      window.removeEventListener("resize", updateScrollControls);
    };
  }, [updateScrollControls]);

  return (
    <div className={styles.wrapper}>
      <button
        aria-label="Scroll signals up"
        className={styles.scrollButton}
        disabled={!scrollControls.canScrollUp}
        onClick={() => scrollList("up")}
        title="Scroll signals up"
        type="button"
      >
        <FaChevronUp aria-hidden="true" />
      </button>
      <div className={styles.container} ref={parentRef}>
        <List
          dense
          className={styles.list}
          component="nav"
          aria-labelledby="addons-list-subheader"
          subheader={
            <ListSubheader
              component="div"
              id="addons-list-subheader"
              className={styles.listHeader}
            >
              Available signals
            </ListSubheader>
          }
        >
          {addons.map((addon, idx) => {
            return <AddonItem key={`${addon.whoAmI}-${idx}`} addon={addon} parentRef={parentRef} />;
          })}
        </List>
      </div>
      <button
        aria-label="Scroll signals down"
        className={styles.scrollButton}
        disabled={!scrollControls.canScrollDown}
        onClick={() => scrollList("down")}
        title="Scroll signals down"
        type="button"
      >
        <FaChevronDown aria-hidden="true" />
      </button>
    </div>
  );
}
