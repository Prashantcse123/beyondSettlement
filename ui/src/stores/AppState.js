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

    constructor() {
        super();
        this.refreshAuthenticatedState();
        this.service.setAuthenticationStore(this);
    }

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

    // logout() {
    //     this.service.removeAuthorizationToken();
    //     this.set({authenticated: false});
    // }

    // async login() {
    //     this.set({authenticating: true});
    //
    //     try {
    //         let {data} = await this.service.sendRequest({
    //             method: 'GET',
    //             url: 'beyond/oauth/authenticate'
    //         });
    //
    //         this.service.setAuthorizationToken(data.payload.access_token + '|||' + data.payload.id);
    //         this.set({
    //             currentUser: data.userInfo.username,
    //             authenticated: true,
    //             authenticating: false
    //         });
    //     }catch(ex){
    //         this.set({
    //             currentUser: undefined,
    //             authenticated: false,
    //             authenticating: false
    //         });
    //         Beyond.App.TopMessage.show('Unauthorized');
    //         location.replace('/#/login');
    //         // throw ex;
    //     }
    // }

    async importRedshiftData() {
        await this.service.sendRequest({
            method: 'GET',
            url: 'beyond/source/data/get'
        });

        Beyond.App.TopMessage.show('Import started...');
    }

    async startCalculations() {
        await this.service.sendRequest({
            method: 'GET',
            url: 'beyond/calculations/scorecard/set'
        });

        // this.fetchSystemStatus();

        Beyond.App.TopMessage.show('Scorecard calculations started...');
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
