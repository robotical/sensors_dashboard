import { EventType } from "../../app-bridge/EventDispatcher";

export function isStartRuleMet (evt: {
    type: EventType;
    [key: string]: any;
    subtype: string;
  }, rule: string) {
    // is the incoming event relevant to the rule?
    const ruleArray = rule.split("=>");
    const ruleAddon = ruleArray[0];
    const ruleIsolated = ruleArray[1];
    console.log("rule", rule);
    console.log("evt", evt);
    return false;
}

export function isEndRuleMet(evt: {
    type: EventType;
    [key: string]: any;
    subtype: string;
  }, rule: string) {
    return false
  }