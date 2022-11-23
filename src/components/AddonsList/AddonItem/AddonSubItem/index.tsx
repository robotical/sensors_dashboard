import styles from "./styles.module.css";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import ListItem from "@mui/material/ListItem";
import AddonSub from "../../../../models/addons/AddonSub";


interface AddonSubItemProps {
    addonSubItem: AddonSub
}

export default function AddonSubItem({addonSubItem}: AddonSubItemProps) {
    const labelId = `checkbox-list-label-${addonSubItem.name}`;
    return (
        <ListItem disablePadding>
          <ListItemButton
            role={undefined}
            onClick={addonSubItem.selectedListener ? addonSubItem.selectedListener : () => {}}
            dense
            sx={{ margin: 0, padding: 0, paddingLeft: "1rem" }}
          >
            <ListItemIcon>
              <Checkbox
                sx={{ marginLeft: "1rem" }}
                edge="start"
                checked={addonSubItem.selected}
                tabIndex={-1}
                disableRipple
                inputProps={{ "aria-labelledby": addonSubItem.name }}
              />
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{fontSize: '12px'}}
              id={labelId}
              primary={addonSubItem.name}
            />
          </ListItemButton>
        </ListItem>
      );
}