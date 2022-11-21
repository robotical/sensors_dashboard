import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import styles from "./styles.module.css";
import AddonItem from "./AddonItem";
import Addon from "../../models/addons/Addon";

interface AddonsListProps {
    addons: Addon[];
}

export default function AddonsList({addons}: AddonsListProps) {
  return (
    <div className={styles.container}>
      <List
        dense
        sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            {addons.map((addon, idx) => {
                return <AddonItem key={idx} addon={addon} />
            })}
          </ListSubheader>
        }
      >
      </List>
    </div>
  );
}
