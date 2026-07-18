import Checkbox from "@mui/material/Checkbox";
import ListItem from "@mui/material/ListItem";
import { useId } from "react";
import AddonSub from "../../../../models/addons/AddonSub";
import styles from "./styles.module.css";

interface AddonSubItemProps {
  addonSubItem: AddonSub;
}

export default function AddonSubItem({ addonSubItem }: AddonSubItemProps) {
  const reactId = useId();
  const inputId = `signal-${reactId.replace(/:/g, "")}`;

  return (
    <ListItem disablePadding className={styles.listItem}>
      <label className={styles.signalRow} htmlFor={inputId}>
        <Checkbox
          id={inputId}
          className={styles.checkbox}
          checked={addonSubItem.selected}
          onChange={() => addonSubItem.selectedListener?.()}
          disableRipple
        />
        <span className={styles.signalName}>{addonSubItem.name}</span>
      </label>
    </ListItem>
  );
}
