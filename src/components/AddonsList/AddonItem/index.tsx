import styles from "./styles.module.css";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import AddonSubItem from "./AddonSubItem";
import Addon from "../../../models/addons/Addon";
import { useRef } from "react";

interface AddonItemProps {
  addon: Addon;
}

export default function AddonItem({ addon }: AddonItemProps) {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const handleClick = () => {
    if (!open) {
      if (listRef.current) {
        setTimeout(() => {
            listRef.current?.scrollIntoView({ behavior: "smooth" });
        },500)
      }
    }
    setOpen(!open);
  };

  return (
    <>
      <ListItemButton onClick={handleClick} ref={listRef}>
        {/* <ListItemIcon>
          <InboxIcon />
        </ListItemIcon> */}
        <ListItemText
          primary={addon.whoAmI}
          primaryTypographyProps={{ fontSize: "16px" }}
        />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List
          sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
          dense
        >
          {addon.addonInputs.map((addonInput, idx) => {
            return <AddonSubItem addonSubItem={addonInput} key={idx} />;
          })}
        </List>
      </Collapse>
    </>
  );
}
