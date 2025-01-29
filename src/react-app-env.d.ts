/// <reference types="react-scripts" />
import { ApplicationManager } from "@robotical/webapp-types/dist-types/types-package/application-manager";


// extend globalThis with a new property
declare global {
  interface Window {
    applicationManager: ApplicationManager;
  }
}