import BaseStore from './baseStore';
import { observable, action, computed } from 'mobx';

export default class SystemProgressStore extends BaseStore {
    @observable systemProgressOpen = false;
    @observable systemStatus = {};
    @observable systemTaskDone = false;
    @observable systemTaskAborted = false;
    @observable systemTaskFailed = false;

    // static get PollingTimeout() {
    //     return 8000;
    // }

    calcTimePollingTimeFactor(busy) {
        let time = 0;

        if (!this._to) {
            time = 0;
        }else if (busy) {
            time = 4000;
        }else{
            time = 20000;
        }

        return time;
    }

    startSystemStatusMonitor(options = {}) {
        clearTimeout(this._to);

        if (options.error) { console.error(error) }

        let time = this.calcTimePollingTimeFactor(this.systemStatus.busy);

        if (!this._to) { time = 0 }
        if (options.force) { time = 0 }

        this._to = setTimeout(() =>
            this.fetchSystemStatus()
                .then ((  ) => this.startSystemStatusMonitor())
                .catch((ex) => this.startSystemStatusMonitor({error: ex}))
        , time);
    }

    stopSystemStatusMonitor() {
        clearTimeout(this._to);
        delete this._to;
    }

    async fetchSystemStatus() {
        try {
            let {data} = await this.service.sendRequest({
                method: 'GET',
                url: 'beyond/calculations/status'
            });

            if (data.busy !== this.systemStatus.busy) {
                if (data.busy === true) {
                    this.set({
                        systemProgressOpen: true,
                        systemTaskDone: false,
                        systemTaskAborted: false,
                        systemTaskFailed: false,
                    });
                } else if (!data.busy) {
                    this.set({
                        systemTaskDone: !this.systemTaskAborted && !this.systemTaskFailed
                    });
                }
                this.triggerEvent({onSystemStatusChange: [data, this]});
            }

            this.set({systemStatus: data});
        }catch(ex){}
    }
}
