import styles from "./styles.module.css";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useState, useRef, useEffect } from "react";
import AddonSubItem from "./AddonSubItem";
import Addon from "../../../models/addons/Addon";

interface AddonItemProps {
  addon: Addon;
  parentRef: React.RefObject<HTMLDivElement>;
}

export default function AddonItem({ addon, parentRef }: AddonItemProps) {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (open && listRef.current && parentRef.current) {
      setTimeout(() => {
        if (listRef.current && parentRef.current) {
          const listItem = listRef.current.getBoundingClientRect();
          const parent = parentRef.current.getBoundingClientRect();
          const parentScrollTop = parentRef.current.scrollTop;

          if (listItem.bottom > parent.bottom) {
            const scrollToPosition = parentScrollTop + (listItem.bottom - parent.bottom);
            parentRef.current.scrollTo({ top: scrollToPosition, behavior: "smooth" });
          }
        }
      }, 500);
    }
  }, [open, listRef]);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItemButton onClick={handleClick}>
        {/* <ListItemIcon>
          <InboxIcon />
        </ListItemIcon> */}
        <ListItemText
          primary={addon.whoAmI}
          primaryTypographyProps={{ fontSize: "16px", fontFamily: "Lato Regular" }}
        />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List
          sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
          dense
          ref={listRef}
        >
          {addon.addonInputs.map((addonInput, idx) => {
            return <AddonSubItem addonSubItem={addonInput} key={idx} />;
          })}
        </List>
      </Collapse>
    </>
  );
}
