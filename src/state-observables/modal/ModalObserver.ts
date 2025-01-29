import { ReactNode } from "react";

export type ModalContentType =  ReactNode;

export type ModalEventTopics = "SetModal" | "CloseModal" | "UpdateModalProps";
export type ModalStateData = {
  modalContent?: ModalContentType;
  modalTitle?: string;
  newWindowLink?: string;
  withCloseButton?: boolean;
  withLogo?: boolean;
};
export interface ModalObservable {
  // Subscribe
  subscribe(observer: ModalObserver, topics: Array<ModalEventTopics>): void;
  // Unsubscribe
  unsubscribe(observer: ModalObserver): void;
  // Publish
  publish(eventTopic: ModalEventTopics, eventData?: ModalStateData): void;
}

export interface ModalObserver {
  // Callback
  notify(eventTopic: ModalEventTopics, eventData?: ModalStateData): void;
}
