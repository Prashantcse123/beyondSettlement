import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';

import Styles from "./Login.styles";

@withStyles(Styles)
@withRouter
@inject("store")
@observer
export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    get store() {
        return this.props.store.scorecard;
    }

    onLoginClick() {
        const { store } = this.props;
        const { appState } = store;
        //
        // appState.login(this.state)
        //     .then (() => location.replace('/#/scorecard'))
        //     .catch(() => this.setState({username: undefined, password: undefined}));


        const windowArea = {
            width:  600, //Math.floor(window.outerWidth * 0.5),
            height: 600  //Math.floor(window.outerHeight * 0.5),
        };

            windowArea.left = Math.floor(window.screenX + ((window.outerWidth - windowArea.width) / 2));
            windowArea.top = Math.floor(window.screenY + ((window.outerHeight - windowArea.height) / 8));

        const windowOpts = `toolbar=0,scrollbars=1,status=1,resizable=1,location=1,menuBar=0,width=${windowArea.width},height=${windowArea.height},left=${windowArea.left},top=${windowArea.top}`;

        let win;
        let checkConnect;
        let oAuthURL = '/api/beyond/oauth/authenticate';

        win = window.open(oAuthURL, 'Authentication', windowOpts);

        checkConnect = setInterval(() => {
            if (!win || !win.closed) return;
            clearInterval(checkConnect);
            appState.set({
                authenticating: false,
                authenticated: true
            });
            location.replace('/#/scorecard');
        }, 100);
    }

    // onKeyUp(e) {
    //     if (e.keyCode === 13) { this.onLoginClick() }
    // }

    componentDidMount() {
        // if (location.hash.includes('logout=true')) {
        //
        //     const { store, history } = this.props;
        //     const { appState } = store;
        //
        //     appState.logout();
        //     history.push('/login');
        //     Beyond.App.TopMessage.show('Logged out successfully!');
        // }

        const { store } = this.props;
        const { appState } = store;

        appState.set({
            authenticating: false,
            authenticated: false
        });

        document.title = 'Beyond - Login';
    }

	render() {
        const { classes, store } = this.props;
        const { appState } = store;
        const { authenticating } = appState;
        // const { username, password } = this.state;

        return (
			<div className={classes.loginPage}>
			    <div className={classes.loginContainer} disabled={authenticating}>
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAiCAYAAAA6RwvCAAAAAXNSR0IArs4c6QAABBVpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICAgICAgICAgIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIj4KICAgICAgICAgPHhtcE1NOkRlcml2ZWRGcm9tIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgPHN0UmVmOmluc3RhbmNlSUQ+eG1wLmlpZDo1QUQ2M0JBMTMxQTkxMUU3QUU4NkEzRUM5MkIzRTc1NTwvc3RSZWY6aW5zdGFuY2VJRD4KICAgICAgICAgICAgPHN0UmVmOmRvY3VtZW50SUQ+eG1wLmRpZDo1QUQ2M0JBMjMxQTkxMUU3QUU4NkEzRUM5MkIzRTc1NTwvc3RSZWY6ZG9jdW1lbnRJRD4KICAgICAgICAgPC94bXBNTTpEZXJpdmVkRnJvbT4KICAgICAgICAgPHhtcE1NOkRvY3VtZW50SUQ+eG1wLmRpZDo1QUQ2M0JBNDMxQTkxMUU3QUU4NkEzRUM5MkIzRTc1NTwveG1wTU06RG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOkluc3RhbmNlSUQ+eG1wLmlpZDo1QUQ2M0JBMzMxQTkxMUU3QUU4NkEzRUM5MkIzRTc1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"/>
                    <h3>Welcome to</h3>
                    <h2>Settlements Experience</h2>
                    {/*<TextField*/}
                        {/*className="login-field"*/}
                        {/*floatingLabelText="User Name"*/}
                        {/*value={username || ''}*/}
                        {/*onChange={(e) => this.setState({username: e.target.value})}*/}
                        {/*onKeyUp={(e) => this.onKeyUp(e)}*/}
                    {/*/>*/}
                    {/*<TextField*/}
                        {/*className="login-field"*/}
                        {/*floatingLabelText="Password"*/}
                        {/*value={password || ''}*/}
                        {/*onChange={(e) => this.setState({password: e.target.value})}*/}
                        {/*onKeyUp={(e) => this.onKeyUp(e)}*/}
                        {/*type="password"*/}
                    {/*/>*/}
                    <br/>
                    <Button
                        onClick={() => this.onLoginClick()}
                        color="primary"
                        variant="extendedFab"
                    >
                        <img className={classes.sfLogo} src="data:image/png;base64,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"/>
                        Login using SalesForce
                    </Button>
                    <br/><br/>
                </div>
            </div>
		);
	}
}
