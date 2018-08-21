import React, { Component } from 'react';
import {Route, Redirect, Link, withRouter} from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';

// import LazyRoute from 'lazy-route';
// import DevTools from 'mobx-react-devtools';

// import TooltipService from '../utils/tooltipService'
import NotFound from './pages/Errors/NotFound';
import TopBar from './shared/TopBar/TopBar';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import Snackbar from '@material-ui/core/Snackbar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import SettingsIcon from '@material-ui/icons/SettingsApplications';

import ScorecardPage from './pages/Scorecard/Scorecard';
import LoginPage from './pages/Login/Login';

import Theme from './Theme';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
const theme = createMuiTheme(Theme);

import Styles from './App.styles';

@withStyles(Styles)
@withRouter
@inject('store')
@observer
export default class App extends Component {
	constructor(props) {
        super(props);
        Beyond.App.TopMessage = {};
        Beyond.App.TopMessage.show = (msg, opt) => this.showTopMessage(msg, opt);
        Beyond.App.TopMessage.hide = (cbk) 		=> this.hideTopMessage(cbk);

        Beyond.App.enterFullScreen = (el) 		=> this.enterFullScreen(el);
        Beyond.App.exitFullScreen  = () 		=> this.exitFullScreen();
        Beyond.App.toggleFullScreen= (el) 		=> this.toggleFullScreen(el);

        this.state = {
            infoBarMessage: '',
            infoBarMessageAction: undefined,
            infoBarMessageDuration: undefined
		};
	}

    showTopMessage(infoBarMessage, options) {
		options = options || {};

		if (!infoBarMessage) return;

		if (!options.update) {
            Beyond.App.TopMessage.hide();
        }

		if (options.action) {
            this.setState({infoBarMessageAction: options.action});
		}

		if (options.duration) {
            this.setState({infoBarMessageDuration: options.duration});
		}

		if (!options.delay) {
			options.delay = 100
		}

		setTimeout(() =>
			this.setState({infoBarMessage}), options.delay);
	}

    hideTopMessage(callback) {
		this.setState({
			infoBarMessage: '',
			infoBarMessageAction: undefined,
			infoBarMessageDuration: undefined
		}, callback);
	}

    enterFullScreen(element) {
        element = element || document.body;

        if(element.requestFullscreen) {
            element.requestFullscreen();
        } else if(element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if(element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if(element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    exitFullScreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }

    toggleFullScreen(el) {
        const {appState} = this.props.store;

        if (appState.isFullScreen) {
            this.exitFullScreen();
        }else{
            this.enterFullScreen(el);
        }
    }

    attachFullScreenEvent() {
        const { appState } = this.props.store;

        if('fullScreen' in document) {
            document.addEventListener('fullscreenchange', () =>
                appState.setFullScreen(document.fullScreen));
        }else if('mozFullScreen' in document) {
            document.addEventListener('mozfullscreenchange', () =>
                appState.setFullScreen(document.mozFullScreen));
        }else if('webkitIsFullScreen' in document) {
            document.addEventListener('webkitfullscreenchange', () =>
                appState.setFullScreen(document.webkitIsFullScreen));
        }
	}

    componentDidMount() {
		Beyond.App.ServiceController.setExceptionEventHandler((ex) =>
            Beyond.App.TopMessage.show(ex.message));

		this.attachFullScreenEvent();
	}

	componentDidUpdate() {
        const { systemProgress } = this.props.store;

        if (location.hash.includes('login')) {
            systemProgress.stopSystemStatusMonitor();
        }else{
            systemProgress.startSystemStatusMonitor({force: true});
        }
    }

	componentWillUnmount() {
        const { systemProgress } = this.props.store;

        systemProgress.stopSystemStatusMonitor();
	}

    onScorecardClick() {
        const { appState } = this.props.store;

        appState.set({leftMenuOpen: false});
        this.props.history.push('/scorecard');
	}

	renderRoutes() {
        const { classes } = this.props;

        return (
            <div className={classes.appContent}>
                <Route exact path="/not_found" component={NotFound}/>
                <Route
                    exact
                    path="/login"
                    component={LoginPage}
                />
                <Route
                    exact
                    path="/scorecard"
                    component={ScorecardPage}
                />
            </div>
        );
    }

	render() {
        const { infoBarMessageAction, infoBarMessageDuration } = this.state;
        const { classes, store } = this.props;
        const { appState } = store;
		const { leftMenuOpen, isFullScreen } = appState;

		let infoBarMessage = this.state.infoBarMessage || appState.infoBarMessage;

		if (location.pathname === '/' && location.hash === '#/') {
            return <Redirect to="/scorecard" />;
		}

		return (
            <MuiThemeProvider theme={theme}>
				<div className={ClassNames(classes.app, classes.root)}>
					{/*<DevTools />*/}

                    <TopBar key={appState.authenticated} onMenuHandleClick={() => appState.set({leftMenuOpen: !leftMenuOpen})} hidden={isFullScreen === true} />

                    <div className={
                        ClassNames(
                            classes.appLayout,
                            {[classes.fullScreen]: isFullScreen === true},
                            {[classes.leftMenuOpen]: leftMenuOpen === true}
                        )}
                    >
                        <Paper
                            className={
                                ClassNames(
                                    classes.leftDrawerMenu,
                                    {[classes.leftDrawerMenuOpen]: !isFullScreen && leftMenuOpen}
                                )}
                        >
                            <MenuItem onClick={(e) => this.onScorecardClick(e)}>
                                <ListItemIcon>
                                    <SettingsIcon/>
                                </ListItemIcon>
                                <ListItemText primary="Scorecard" />
                            </MenuItem>
                        </Paper>

						{this.renderRoutes()}
					</div>
                    <Snackbar
                        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                        open={!!infoBarMessage}
                        message={infoBarMessage}
                        autoHideDuration={infoBarMessageDuration || 4000}
                        onClose={() => {
                            appState.set({infoBarMessage: ''});
                            this.setState({infoBarMessage: '', infoBarMessageAction: undefined, infoBarMessageDuration: undefined});
                        }}
                        action={infoBarMessageAction &&
                            <Button
                                color="secondary"
                                onClick={(e) => infoBarMessageAction.onClick(e)}
                            >
                                {infoBarMessageAction.text}
                            </Button>
                        }
                    />
				</div>
			</MuiThemeProvider>
		);
	}
}
