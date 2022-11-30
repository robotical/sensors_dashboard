
export type ModalContentType = () => JSX.Element;
export type ModalEventTopics = "SetModal" | "CloseModal";
export type ModalStateData = {
  modalContent: ModalContentType;
  modalTitle: string;
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
