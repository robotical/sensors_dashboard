import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useEffect, useId, useRef, useState } from "react";
import Addon from "../../../models/addons/Addon";
import AddonSubItem from "./AddonSubItem";
import styles from "./styles.module.css";

interface AddonItemProps {
  addon: Addon;
  parentRef: React.RefObject<HTMLDivElement>;
}

export default function AddonItem({ addon, parentRef }: AddonItemProps) {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLUListElement | null>(null);
  const reactId = useId();
  const signalsId = `addon-signals-${reactId.replace(/:/g, "")}`;
  const selectedCount = addon.addonInputs.filter((input) => input.selected).length;

  useEffect(() => {
    if (!open || !listRef.current || !parentRef.current) return;

    const timeoutId = window.setTimeout(() => {
      if (!listRef.current || !parentRef.current) return;

      const listItem = listRef.current.getBoundingClientRect();
      const parent = parentRef.current.getBoundingClientRect();
      const parentScrollTop = parentRef.current.scrollTop;

      if (listItem.bottom > parent.bottom) {
        const scrollToPosition =
          parentScrollTop + (listItem.bottom - parent.bottom);
        parentRef.current.scrollTo({
          top: scrollToPosition,
          behavior: "smooth",
        });
      }
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [open, parentRef]);

  return (
    <>
      <ListItemButton
        onClick={() => setOpen((value) => !value)}
        className={styles.addonButton}
        aria-expanded={open}
        aria-controls={signalsId}
      >
        <ListItemText
          primary={addon.whoAmI}
          secondary={
            selectedCount > 0 ? `${selectedCount} selected` : undefined
          }
          primaryTypographyProps={{
            fontSize: "1.4rem",
            fontFamily: "Lato Regular",
            fontWeight: 600,
          }}
          secondaryTypographyProps={{
            fontSize: "1.1rem",
            fontFamily: "Lato Regular",
          }}
        />
        {open ? (
          <ExpandLess aria-hidden="true" />
        ) : (
          <ExpandMore aria-hidden="true" />
        )}
      </ListItemButton>
      <Collapse
        in={open}
        timeout="auto"
        unmountOnExit
        id={signalsId}
        role="region"
        aria-label={`${addon.whoAmI} signals`}
      >
        <List dense ref={listRef} className={styles.subList}>
          {addon.addonInputs.map((addonInput, index) => (
            <AddonSubItem
              addonSubItem={addonInput}
              key={`${addonInput.name}-${index}`}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
}
