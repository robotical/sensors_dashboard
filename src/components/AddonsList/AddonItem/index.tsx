import styles from "./styles.module.css";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import AddonSubItem from "./AddonSubItem";
import Addon from "../../../models/addons/Addon";

interface AddonItemProps {
  addon: Addon;
}

export default function AddonItem({ addon }: AddonItemProps) {
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>
          <InboxIcon />
        </ListItemIcon>
        <ListItemText primary={addon.name} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List
          sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
          dense
        >
          {addon.addonInputs.map((addonInput, idx) => {
            return <AddonSubItem addonSubItem={addonInput} key={idx}/>;
          })}
        </List>
      </Collapse>
    </>
  );
}
