import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";

import DataTable from '../../shared/DataTables/DataTables';

import {GridList, GridTile} from 'material-ui/GridList';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';


import './Login.scss'

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

        appState.login(this.state)
            .then (() => location.replace('/#/scorecard'))
            .catch(() => this.setState({username: undefined, password: undefined}));
    }

    componentDidMount() {
        if (location.hash.includes('logout=true')) {

            const { store, history } = this.props;
            const { appState } = store;

            appState.logout();
            history.push('/login');
            Beyond.App.TopMessage.show('Logged out successfully!');
        }

        document.title = 'Beyond - Login';
    }

	render() {
        const { store } = this.props;
        const { appState } = store;
        const { authenticating } = appState;
        const { username, password } = this.state;

        return (
			<div className="login-page">
			    <div className="login-container" disabled={authenticating}>
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAiCAYAAAA6RwvCAAAAAXNSR0IArs4c6QAABBVpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICAgICAgICAgIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIj4KICAgICAgICAgPHhtcE1NOkRlcml2ZWRGcm9tIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgPHN0UmVmOmluc3RhbmNlSUQ+eG1wLmlpZDo1QUQ2M0JBMTMxQTkxMUU3QUU4NkEzRUM5MkIzRTc1NTwvc3RSZWY6aW5zdGFuY2VJRD4KICAgICAgICAgICAgPHN0UmVmOmRvY3VtZW50SUQ+eG1wLmRpZDo1QUQ2M0JBMjMxQTkxMUU3QUU4NkEzRUM5MkIzRTc1NTwvc3RSZWY6ZG9jdW1lbnRJRD4KICAgICAgICAgPC94bXBNTTpEZXJpdmVkRnJvbT4KICAgICAgICAgPHhtcE1NOkRvY3VtZW50SUQ+eG1wLmRpZDo1QUQ2M0JBNDMxQTkxMUU3QUU4NkEzRUM5MkIzRTc1NTwveG1wTU06RG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOkluc3RhbmNlSUQ+eG1wLmlpZDo1QUQ2M0JBMzMxQTkxMUU3QUU4NkEzRUM5MkIzRTc1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"/>
                    <h3>Enter Your Credentials</h3>
                    <TextField
                        className="login-field"
                        floatingLabelText="User Name"
                        value={username}
                        onChange={(e) => this.setState({username: e.target.value})}
                    />
                    <TextField
                        className="login-field"
                        floatingLabelText="Password"
                        value={password}
                        onChange={(e) => this.setState({password: e.target.value})}
                        type="password"
                    />
                    <br/><br/>
                    <RaisedButton
                        label={authenticating ? <CircularProgress color="white" size={25} style={{marginTop: 5}} /> : "Login"}
                        onClick={() => this.onLoginClick()}
                        primary
                    />
                </div>
            </div>
		);
	}
}
