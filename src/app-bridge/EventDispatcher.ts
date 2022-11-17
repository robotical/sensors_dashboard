type ListenerType = (options: {[key: string]: any, type: string}) => void;
type EventType = "onBattRemainCapacityPercentChange" | "onRSSIChange" | "onIsConnectedChange" | "onMartyNameChange";

class EventDispatcher { 
    _listeners: ({type: EventType, listener: ListenerType, options: {once: boolean}})[];
    constructor() {
        this._listeners = [];
    }


    hasEventListener (type: EventType, listener: ListenerType) {
        return this._listeners.some(item => item.type === type && item.listener === listener);
    }

    addEventListener (type: EventType, listener: ListenerType) {
        if (!this.hasEventListener(type, listener)) {
            this._listeners.push({type, listener, options: {once: false}});
        }
        return this;
    }

    removeEventListener (type: EventType, listener: ListenerType) {
        const index = this._listeners.findIndex(item => item.type === type && item.listener === listener);
        if (index >= 0) this._listeners.splice(index, 1);
        return this;
    }

    removeEventListeners () {
        this._listeners = [];
        return this;
    }

    dispatchEvent (evt: {type: EventType, [key: string]: any}) {
        this._listeners
            .filter(item => item.type === evt.type)
            .forEach(item => {
                const {type, listener, options: {once}} = item;
                listener.call(this, evt);
                if (once === true) this.removeEventListener(type, listener)
            });
        return this;
    }
}

export default EventDispatcher;