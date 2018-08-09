import BaseStore from './baseStore'
import { observable, action, computed } from "mobx";

export default class AppState extends BaseStore {
    @observable authenticated;
    @observable authenticating;
    @observable currentUser;
    // @observable items;
    // @observable item;

    @observable appTitle = '';
    @observable leftMenuOpen = false;
    @observable infoBarMessage = '';
    @observable isFullScreen = false;

    @observable systemProgressOpen = false;
    @observable systemSettings = {};
    @observable systemStatus = {};
    @observable systemTaskDone = false;
    @observable systemTaskAborted = false;
    @observable systemTaskFailed = false;

    constructor() {
        super();
        this.refreshAuthenticatedState();
        this.service.setAuthenticationStore(this);
    }

    static get PollingTimeout() {
        return 8000;
    }

    calcTimePollingTimeFactor(error, busy) {
        let time = AppState.PollingTimeout;

        if (!this._to) {
            time = 0;
        }else if (busy) {
            time = AppState.PollingTimeout / 4;
        }

        return time;
    }

    startSystemStatusMonitor(error) {
        clearTimeout(this._to);

        let time = this.calcTimePollingTimeFactor(error, this.systemStatus.busy);

        if (!this._to) { time = 0 }

        this._to = setTimeout(() =>
            this.fetchSystemStatus()
                .then (() => this.startSystemStatusMonitor(false))
                .catch(() => this.startSystemStatusMonitor(true ))
        , time);
    }

    stopSystemStatusMonitor() {
        clearTimeout(this._to);
        delete this._to;
    }

    // async abortSystemTask() {
    //     await this.service.sendRequest({
    //         method: 'POST',
    //         url: 'system/abort'
    //     });
    //
    //     this.set({systemTaskAborted: true});
    // }

    // async login(credentials) {
    //     this.set({authenticating: true});
    //
    //     try {
    //         let {data} = await this.service.sendRequest({
    //             method: 'POST',
    //             url: 'beyond/login',
    //             data: credentials // {username: 'admin', password: 'admin1029'}
    //         });
    //         this.service.setAuthorizationToken(data.token);
    //         this.refreshAuthenticatedState();
    //         this.set({authenticating: false});
    //     }catch(ex){
    //         this.refreshAuthenticatedState();
    //         this.set({authenticating: false});
    //         throw ex;
    //     }
    // }

    async login() {
        this.set({authenticating: true});

        try {
            let {data} = await this.service.sendRequest({
                method: 'GET',
                url: 'beyond/oauth/authenticate'
            });

            this.service.setAuthorizationToken(data.payload.access_token + '|||' + data.payload.id);
            this.set({
                currentUser: data.userInfo.username,
                authenticated: true,
                authenticating: false
            });
        }catch(ex){
            this.set({
                currentUser: undefined,
                authenticated: false,
                authenticating: false
            });
            Beyond.App.TopMessage.show('Unauthorized');
            location.replace('/#/login');
            // throw ex;
        }
    }

    // logout() {
    //     this.service.removeAuthorizationToken();
    //     this.set({authenticated: false});
    // }

    async fetchSystemStatus() {
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
            }else if (!data.busy) {
                this.set({
                    systemTaskDone: !this.systemTaskAborted && !this.systemTaskFailed
                });
            }
            this.triggerEvent({onSystemStatusChange: [data, this]});
        }

        this.set({systemStatus: data});
    }

    async importRedshiftData() {
        await this.service.sendRequest({
            method: 'GET',
            url: 'beyond/source/data/get'
        });

        Beyond.App.TopMessage.show('Import Command Sent!');
    }

    async startCalculations() {
        await this.service.sendRequest({
            method: 'GET',
            url: 'beyond/calculations/scorecard/set'
        });

        this.fetchSystemStatus();

        Beyond.App.TopMessage.show('Calculations Command Sent!');
    }

    @action
    set(data, options) {
        super.set(data, options);
        if (!this.systemProgressOpen) {
            data.systemTaskDone = false;
            data.systemTaskAborted = false;
        }
    }

    @action
    setFullScreen(data) {
        this.isFullScreen = data;
    }

    @action
    refreshAuthenticatedState() {
        let currentUser = this.service.getUsernameFromToken();

        if (currentUser) {
            this.currentUser = currentUser;
            this.authenticated = true;
        }else{
            this.currentUser = undefined;
            this.authenticated = false;
        }
    }
}
