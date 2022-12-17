import Addon from "../../models/addons/Addon";
import {
  get_OPTIONS_BY_WHOAMI_AND_NAME,
  END_OPTIONS_BY_WHOAMI_AND_NAME,
} from "../constants/start-end-rules";
import { spacebarIsPressedRule, spacebarRuleCleanup } from "./key-press-rules/spacebar-start-rule";
import { qIsPressedRule, qRuleCleanup } from "./key-press-rules/q-end-rule";

/**
 * @elems whoAmI, addonInputName, ruleStr, ruleFunc
 */
export type DropdownOptionsInterface = [
  string,
  string,
  string,
  (val: number) => boolean, // rule function
] | [
  string,
  string,
  string,
  (val: number) => boolean, // rule function
  () => void // cleanup function
];

export const getRuleOptions = (addons: Addon[], rule: "start" | "end") => {
  const options: DropdownOptionsInterface[] = [
    [
      "default",
      "default",
      rule === "start" ? "Start is pressed" : "Pause is pressed",
      (val: number) => rule === "start",
    ],
    rule === "start"
      ? [
          "default",
          "spacebar",
          "Spacebar is pressed",
          (val: number) => spacebarIsPressedRule(val),
          () => spacebarRuleCleanup()
        ]
      : [
          "default",
          "q",
          "Q is pressed",
          (val: number) => qIsPressedRule(val),
          () => qRuleCleanup()
        ],
  ];

  for (const addon of addons) {
    for (const addonInput of addon.addonInputs) {
      if (addonInput.selected) {
        const specificOptionsForThatAddonInput = get_OPTIONS_BY_WHOAMI_AND_NAME(
          rule,
          addon.whoAmI,
          addonInput.name
        );
        specificOptionsForThatAddonInput.forEach((opt) => {
          options.push([
            addon.whoAmI,
            addonInput.name,
            opt.ruleStr,
            opt.ruleFunc,
          ]);
        });
      }
    }
  }
  return options;
};
