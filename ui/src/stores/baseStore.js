import { observable, action, computed } from "mobx"

export default class BaseStore {
    constructor(options) {
        options = options || {};
        this._boundEvents = [];
        this.updateFromStorage();
        // this.collectDefaultValues();
    }

    get service() {
        return Beyond.App.ServiceController;
    }

    @action
    set(data, options) {
        options = options || {};

        Object.keys(data).forEach(key => {
            this[key] = data[key];
            if (this.getStorage(key) || options.storage === true) {
                this.setStorage({[key]: data[key]});
            }
        });
    }

    setStorage(data) {
        Object.keys(data).forEach(key =>
            localStorage.setItem('BEYOND-' + key, data[key]));
    }

    getStorage(key) {
        return localStorage.getItem('BEYOND-' + key);
    }

    updateFromStorage() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('BEYOND-')) {
                key = key.replace('BEYOND-', '');
                this.set({[key]: this.getStorage(key)});
            }
        })
    }


    /// Events
    bind(eventsData, source) {
        if (!source) { throw 'You have to provide an event source' }
        Object.keys(eventsData).forEach(event => {
            if (!eventsData[event]) return false;
            if (!this._boundEvents[event]) { this._boundEvents[event] = [] }
            this._boundEvents[event].push({source, handler: eventsData[event]});
        });
    }

    rebind(eventsData, source) {
        this.unbind(Object.keys(eventsData), source);
        this.bind(eventsData, source);
    }

    // Usage: model.unbind('onEvent', this) OR model.unbind(['onEvent1', 'onEvent2'], this)
    unbind(events, source) {
        if (!source) { throw 'You have to provide an event source' }
        events = (Array.isArray(events) ? events : [events]);
        events.forEach(event => {
            if (this._boundEvents[event]) {
                this._boundEvents[event].removeWhere(be => be.source === source);
                if (this._boundEvents[event].empty()) {
                    delete this._boundEvents[event];
                }
            }
        });
    }

    unbindAll(source) {
        Object.keys(this._boundEvents).forEach(event => this.unbind(event, source));
    }

    triggerEvent(triggerData) {
        if (!this._boundEvents) return;

        let event = (typeof triggerData === 'string' ? triggerData : Object.keys(triggerData).first());

        if (this._boundEvents[event]) {
            let args = triggerData[event];

            args = (Array.isArray(args) ? args : [args]);
            this._boundEvents[event].forEach(ev => ev.handler.apply(ev.source, args));
        }
    }

    // waitForObservableObjectAdministration() {
    //     this._ooaTimerCheck = this._ooaTimerCheck || 0;
    //
    //     setTimeout(() => {
    //         if (this._ooaTimerCheck === 100) return;
    //
    //         if (!!this.$mobx) {
    //             this.collectDefaultValues();
    //             return;
    //         }
    //
    //         this.waitForObservableObjectAdministration();
    //     })
    // }
    //
    // collectDefaultValues() {
    //     this._defaultValues = {};
    //
    //     if (!this.$mobx) {
    //         this.waitForObservableObjectAdministration();
    //         return;
    //     }
    //
    //     Object.keys(this.$mobx.values).forEach(key => {
    //         let field = this.$mobx.values[key];
    //
    //         if (field.constructor.name === 'ObservableValue') {
    //             this._defaultValues[key] = field.value;
    //         }
    //     });
    // }
    //
    // reset() {
    //     Object.keys(this.$mobx.values).forEach(key => {
    //         let field = this.$mobx.values[key];
    //
    //         if (field.constructor.name === 'ObservableValue') {
    //             this.set({[key]: this._defaultValues[key]});
    //         }
    //     });
    // }
}
