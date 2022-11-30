import {
  ModalContentType,
  ModalEventTopics,
  ModalObservable,
  ModalObserver,
  ModalStateData,
} from "./ModalObserver";

class ModalState implements ModalObservable {
  public modalContent!: ModalContentType | null;
  public modalTitle!: string;
  private _observers: { [key: string]: Array<ModalObserver> } = {};

  constructor() {}

  setModal(modalContent: ModalContentType, modalTitle: string) {
    this.modalContent = modalContent;
    this.modalTitle = modalTitle;
    this.publish("SetModal", { modalContent, modalTitle });
  }

  closeModal() {
    this.modalContent = null;
    this.modalTitle = "";
    this.publish("CloseModal")
  }

  subscribe(observer: ModalObserver, topics: Array<ModalEventTopics>): void {
    for (const topic of topics) {
      if (!this._observers[topic]) {
        this._observers[topic] = [];
      }
      if (this._observers[topic].indexOf(observer) === -1) {
        this._observers[topic].push(observer);
      }
    }
  }

  unsubscribe(observer: ModalObserver): void {
    for (const topic in this._observers) {
      if (this._observers.hasOwnProperty(topic)) {
        const index = this._observers[topic].indexOf(observer);
        if (index !== -1) {
          this._observers[topic].splice(index, 1);
        }
      }
    }
  }

  publish(eventTopic: ModalEventTopics, eventData?: ModalStateData): void {
    if (this._observers.hasOwnProperty(eventTopic)) {
      for (const observer of this._observers[eventTopic]) {
        observer.notify(eventTopic, eventData);
      }
    }
  }
}

const modalState = new ModalState();
export default modalState;
