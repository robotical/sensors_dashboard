import {
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  TextField,
} from "@mui/material";
import { DropdownOptionsInterface } from "../../utils/start-end-rules/start-end-options";

interface DropdownProps {
  label: string;
  options: DropdownOptionsInterface;
  onChange: (selectedOption: string) => void;
  selectedOption: string;
}

export default function Dropdown({
  label,
  onChange,
  options,
  selectedOption,
}: DropdownProps) {
  const optionsJSX = [];
  for (const addonInputKey in options) {
    const addonInputOptions = options[addonInputKey];
    console.log(addonInputKey, 'index.tsx', 'line: ', '24');
    const menuItemsWithinCategory = addonInputOptions.map(
      (addonInputOption) => {
        return (
          <MenuItem
            value={addonInputKey+"=>"+addonInputOption}
            key={addonInputKey+"=>"+addonInputOption}
          >
            {addonInputOption.split("=>")[1]}
          </MenuItem>
        );
      }
    );
    optionsJSX.push([
      <ListSubheader>{addonInputKey}</ListSubheader>,
      menuItemsWithinCategory,
    ]);
  }

  return (
    <FormControl fullWidth>
      {!selectedOption && <InputLabel id="demo-simple-select-label">{label}</InputLabel> }
      <TextField
        id="standard-select-currency"
        select
        label={label}
        value={selectedOption}
        onChange={(e) => onChange(e.target.value)}
        size="small"
      >
        {optionsJSX}
      </TextField>
    </FormControl>
  );
}
