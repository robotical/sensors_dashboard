import { useId } from "react";
import {
  FormControl,
  ListSubheader,
  MenuItem,
  TextField,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { DropdownOptionsInterface } from "../../utils/start-end-rules/start-end-options";

const CustomFontTheme = createTheme({
  typography: {
    fontFamily: "Lato Regular",
  },
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
  disabled?: boolean;
}

export default function Dropdown({
  label,
  onChange,
  options,
  selectedOption,
  rule,
  disabled = false,
}: DropdownProps) {
  const reactId = useId();
  const fieldId = `${rule}-rule-${reactId.replace(/:/g, "")}`;
  const optionsByAddon: {
    [whoAmI: string]: DropdownOptionsInterface[];
  } = {};

  for (const option of options) {
    const whoAmI = option[0];
    if (optionsByAddon.hasOwnProperty(whoAmI)) {
      optionsByAddon[whoAmI].push(option);
    } else {
      optionsByAddon[whoAmI] = [option];
    }
  }
  const optionElements: JSX.Element[] = [];
  for (const [whoAmI, addonOptions] of Object.entries(optionsByAddon)) {
    if (whoAmI !== "default") {
      optionElements.push(
        <ListSubheader component="div" key={`${whoAmI}-header`}>
          {whoAmI}
        </ListSubheader>
      );
    }
    for (const option of addonOptions) {
      optionElements.push(
        <MenuItem
          value={option as string[]}
          key={`${option[0]}-${option[1]}-${option[2]}`}
        >
          {option[2]}
        </MenuItem>
      );
    }
  }

  return (
    <ThemeProvider theme={CustomFontTheme}>
      <FormControl fullWidth disabled={disabled}>
        <TextField
          id={fieldId}
          select
          label={label}
          value={selectedOption ?? ""}
          onChange={(event) =>
            onChange(
              (event.target.value as unknown) as DropdownOptionsInterface,
              rule
            )
          }
          size="small"
          disabled={disabled}
          sx={{
            "& .MuiInputBase-root": {
              minHeight: "4.4rem",
            },
          }}
          SelectProps={{
            inputProps: {
              "aria-label": label,
            },
          }}
        >
          {optionElements}
        </TextField>
      </FormControl>
    </ThemeProvider>
  );
}
