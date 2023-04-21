import {
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  TextField,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { DropdownOptionsInterface } from "../../utils/start-end-rules/start-end-options";

const CustomFontTheme = createTheme({
  typography: {
    fontFamily: "Lato Regular"
  }
});

interface DropdownProps {
  label: string;
  options: DropdownOptionsInterface[];
  onChange: (
    selectedOption: DropdownOptionsInterface,
    rule: "start" | "end"
  ) => void;
  selectedOption: DropdownOptionsInterface | undefined;
  rule: "start" | "end";
}

export default function Dropdown({
  label,
  onChange,
  options,
  selectedOption,
  rule,
}: DropdownProps) {
  const optionsJSX = [];
  // reformat options array to a compatible type for the dropdown with categories
  const optionsObj: { [whoAmI: string]: DropdownOptionsInterface[] } = {};
  for (const option of options) {
    const whoAmI = option[0];
    if (optionsObj.hasOwnProperty(whoAmI)) {
      optionsObj[whoAmI].push(option);
    } else {
      optionsObj[whoAmI] = [option];
    }
  }
  for (const whoAmI in optionsObj) {
    const menuItemsWithinCategory = optionsObj[whoAmI].map((option) => {
      return (
        <MenuItem
          value={option as string[]}
          key={option[0] + option[1] + option[2]}
        >
          {option[2]}
        </MenuItem>
      );
    });
    optionsJSX.push([
      whoAmI !== "default" && <ListSubheader>{whoAmI}</ListSubheader>,
      menuItemsWithinCategory,
    ]);
  }

  return (
    <ThemeProvider theme={CustomFontTheme}>
      <FormControl fullWidth>
        {!selectedOption && (
          <InputLabel id="demo-simple-select-label"
          >{label}</InputLabel>
        )}
        <TextField
          id="standard-select-currency"
          select
          label={label}
          value={selectedOption}
          onChange={(e) =>
            onChange(
              (e.target.value as unknown) as DropdownOptionsInterface,
              rule
            )
          }
          size="small"
        >
          {optionsJSX}
        </TextField>
      </FormControl>
    </ThemeProvider>
  );
}
