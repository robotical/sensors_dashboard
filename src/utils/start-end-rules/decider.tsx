import {
  ListenerOptionsType,
} from "../../app-bridge/EventDispatcher";
import { DropdownOptionsInterface } from "./start-end-options";

export function isRuleMet(evt: ListenerOptionsType, rule: DropdownOptionsInterface) {
  if (!isEvtRelevantToRule(evt, rule)) return false;
  return rule[3](evt.value!);
}

function isEvtRelevantToRule(evt: ListenerOptionsType, rule: DropdownOptionsInterface) {
  return (evt.whoAmI === rule[0] && evt.addonInput === rule[1]) || rule[0] === "default";
}
