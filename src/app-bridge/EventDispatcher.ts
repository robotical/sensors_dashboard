type ListenerType = (options: {[key: string]: any, type: EventType, subtype: string}) => void;
export type EventType = `on${string}Change`;

class EventDispatcher { 
    _listeners: ({type: EventType, subtype: string, listener: ListenerType, options: {once: boolean}})[];
    constructor() {
        this._listeners = [];
    }


    hasEventListener (type: EventType, subtype: string, listener: ListenerType) {
        return this._listeners.some(item => item.type === type && item.subtype === subtype && item.listener === listener);
    }

    addEventListener (type: EventType, subtype: string, listener: ListenerType) {
        if (!this.hasEventListener(type, subtype, listener)) {
            this._listeners.push({type, subtype, listener, options: {once: false}});
        }
        return this;
    }

    removeEventListener (type: EventType, subtype: string, listener: ListenerType) {
        const index = this._listeners.findIndex(item => item.type === type && item.subtype === subtype && item.listener === listener);
        if (index >= 0) this._listeners.splice(index, 1);
        return this;
    }

    removeEventListenerBasedOnType (type: EventType, listener: ListenerType) {
        const index = this._listeners.findIndex(item => item.type === type && item.listener === listener);
        if (index >= 0) this._listeners.splice(index, 1);
        return this;
    }

    removeEventListeners () {
        this._listeners = [];
        return this;
    }

    dispatchEvent (evt: {type: EventType, [key: string]: any}) {
        const event = {...evt, subtype: ""};
        this._listeners
            .filter(item => item.type === evt.type)
            .forEach(item => {
                const {type, listener, options: {once}} = item;
                listener.call(this, event);
                if (once === true) this.removeEventListenerBasedOnType(type, listener);
            });
        return this;
    }
}

export default EventDispatcher;