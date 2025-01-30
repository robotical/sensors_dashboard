import RAFT from "@robotical/webapp-types/dist-types/src/application/RAFTs/RAFT";

export const raftPubSubscriptionHelper = (raft: RAFT) => {
    let observer: any | null = null;
    return {
        subscribe: (callback: (eventData: any) => void) => {
            observer = raftPubSubscriptionObserver_(callback);
            raft.subscribe(observer, ["raftinfo"])
        },
        unsubscribe: () => {
            if (observer) {
                raft.unsubscribe(observer);
            }
        }
    };
}

const raftPubSubscriptionObserver_ = (callback: any) => {
    return {
        notify(
            eventType: string,
            eventEnum: any,
            eventName: string,
            eventData: any
        ) {
            switch (eventType) {
                case "raftinfo":
                    switch (eventEnum) {
                        case "STATE_INFO":
                            callback(eventData);
                            break;
                        default:
                            break;
                    }
                    break;
            }
        },
    };
};
