import EventDispatcher from "./EventDispatcher";

export default class RaftInterface extends EventDispatcher {


    // setIsModal(isModal: boolean) {
    //     if (isModal !== this.isModal) {
    //       this.isModal = isModal;
    //       this.dispatchEvent({
    //         type: "onIsModalChange",
    //         isModal: this.isModal,
    //       });
    //     }
    //   }

    unsubscribeFromPublishedData() {
        // will be implemented in the child class
    }
}