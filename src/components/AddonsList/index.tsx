import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import styles from "./styles.module.css";
import AddonItem from "./AddonItem";
import Addon from "../../models/addons/Addon";
import { useRef } from "react";

interface AddonsListProps {
  addons: Addon[];
}

export default function AddonsList({ addons }: AddonsListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  return (
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
  );
}
