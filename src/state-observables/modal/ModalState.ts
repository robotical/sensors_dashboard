import {
  ModalContentType,
  ModalEventTopics,
  ModalObservable,
  ModalObserver,
  ModalStateData,
} from "./ModalObserver";

type ModalReturnValue = any;

class ModalState implements ModalObservable {
  public modalContent!: ModalContentType | null;
  public modalTitle!: string;
  private _observers: { [key: string]: Array<ModalObserver> } = {};
  private _modalPromise: Promise<ModalReturnValue> | null = null;
  private _modalResolve: (value: ModalReturnValue) => void = () => { };
  private _modalReject: (reason?: any) => void = () => { };

  constructor() { }

  setModal(modalContent: ModalContentType, modalTitle: string, withLogo = true): Promise<ModalReturnValue> {
    this._modalPromise = new Promise((resolve, reject) => {
      this._modalResolve = resolve;
      this._modalReject = reject;
      this.modalContent = modalContent;
      this.modalTitle = modalTitle;
      this.publish("SetModal", { modalContent, modalTitle, withLogo });
    });
    return this._modalPromise;
  }

  closeModal(modalReturnValue?: ModalReturnValue, onCloseCb?: () => void) {
    this.modalContent = null;
    this.modalTitle = "";
    this.publish("CloseModal");
    this._modalResolve(modalReturnValue);
    this.clearPromise();
    onCloseCb && onCloseCb();
  }

  updateModalProps(updatedProps: { modalTitle?: string, withCloseButton?: boolean }) {
    this.modalTitle = updatedProps.modalTitle || this.modalTitle;
    this.publish("UpdateModalProps", updatedProps);
  }

  clearPromise() {
    this._modalPromise = null;
    this._modalResolve = () => { };
    this._modalReject = () => { };
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
