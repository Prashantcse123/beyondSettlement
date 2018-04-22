import React, { Component } from "react";
import {Route, Redirect, Link, withRouter} from "react-router-dom";
import { inject, observer } from "mobx-react";
import LazyRoute from "lazy-route";

import TooltipService from '../utils/tooltipService'

import Home from "./Home";
import NotFound from "./pages/Errors/NotFound";

import DevTools from "mobx-react-devtools";

import TopBar from "./shared/TopBar/TopBar";

import '../fonts/roboto/index.css'
import '../styles/main.scss'
import './App.scss'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Paper from 'material-ui/Paper';
import MenuItem from 'material-ui/MenuItem';
import Snackbar from 'material-ui/Snackbar';

import SettingsIcon from 'material-ui/svg-icons/action/settings-applications';

import ScorecardPage from './pages/Scorecard/Scorecard';

@withRouter
@inject("store")
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

    authenticate(e) {
        const { appState } = this.props.store;

        if (e) e.preventDefault();
        appState.authenticate();
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

        const { appState } = this.props.store;

        appState.startSystemStatusMonitor();

		this.attachFullScreenEvent();

        new TooltipService().startService();
		// this.authenticate();
	}

	componentWillUnmount() {
        const { appState } = this.props.store;

        appState.stopSystemStatusMonitor();
	}

    onScorecardClick() {
        const { appState } = this.props.store;

        appState.set({leftMenuOpen: false});
        this.props.history.push('/scorecard');
	}

	renderRoutes() {
        return (
            <div className="app-content">
                <Route exact path="/" component={Home}/>
                <Route exact path="/not_found" component={NotFound}/>
                <Route
                    exact
                    path="/scorecard"
                    component={ScorecardPage}
                />
            </div>
        );
    }

	render() {
        const { appState } = this.props.store;
		const {
			authenticated,
			authenticating,
			timeToRefresh,
			refreshToken,
			leftMenuOpen,
            isFullScreen
		} = appState;

		let infoBarMessage = this.state.infoBarMessage || appState.infoBarMessage;

		if (location.pathname === '/' && location.hash === '#/') {
            return <Redirect to="/scorecard" />;
		}

		return (
			<MuiThemeProvider>
				<div className="app">
					{/*<DevTools />*/}

					<TopBar onMenuHandleClick={() => appState.set({leftMenuOpen: !leftMenuOpen})} hidden={isFullScreen === true} />

					<div className={ClassNames('app-layout', {'full-screen': isFullScreen === true}, {'left-menu-open': leftMenuOpen === true})}>
						<Paper
							className={
								ClassNames(
									'left-drawer-menu',
									{open: !isFullScreen && leftMenuOpen}
								)}
						>
							<MenuItem
								primaryText="Scorecard"
								leftIcon={<SettingsIcon/>}
                                onClick={(e) => this.onScorecardClick(e)}
								className={ClassNames('left-drawer-menu-item', {selected: location.hash.includes('/scorecard')})}
							/>
						</Paper>
						{this.renderRoutes()}
					</div>
					<Snackbar
						className={ClassNames('main-info-bar', {open: !!infoBarMessage})}
						open={!!infoBarMessage}
						message={infoBarMessage}
						autoHideDuration={this.state.infoBarMessageDuration || 4000}
                        action={(this.state.infoBarMessageAction || {}).text}
						onActionTouchTap={(e) => this.state.infoBarMessageAction.onClick(e)}
						onRequestClose={() => {
							appState.set({infoBarMessage: ''});
							this.setState({infoBarMessage: '', infoBarMessageAction: undefined, infoBarMessageDuration: undefined});
						}}
					/>
				</div>
			</MuiThemeProvider>
		);
	}
}
