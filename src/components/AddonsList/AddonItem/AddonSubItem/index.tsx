import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import ListItem from "@mui/material/ListItem";
import AddonSub from "../../../../models/addons/AddonSub";
import { useId } from "react";


interface AddonSubItemProps {
    addonSubItem: AddonSub
}

export default function AddonSubItem({addonSubItem}: AddonSubItemProps) {
    const labelId = useId();
    const onSelect = () => {
      addonSubItem.selectedListener?.();
    };

    return (
        <ListItem disablePadding>
        <ListItemButton
          role={undefined}
          onClick={onSelect}
          dense
          sx={{
            margin: 0,
            padding: "0.4rem 0.8rem",
            borderRadius: "1rem",
            transition: "background-color 0.15s ease",
            "&:hover": {
              backgroundColor: "var(--colour-PALE_WHITE)",
            },
          }}
        >
          <ListItemIcon>
            <Checkbox
                sx={{
                  marginLeft: "0.4rem",
                  color: "var(--colour-primary)",
                  "&.Mui-checked": {
                    color: "var(--colour-primary)",
                  },
                }}
                edge="start"
                checked={addonSubItem.selected}
                onClick={(event) => event.stopPropagation()}
                onChange={onSelect}
                tabIndex={-1}
                disableRipple
                inputProps={{ "aria-labelledby": labelId }}
              />
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{fontSize: '12px', fontFamily: 'Lato Regular'}}
              id={labelId}
              primary={addonSubItem.name}
            />
          </ListItemButton>
        </ListItem>
      );
}
