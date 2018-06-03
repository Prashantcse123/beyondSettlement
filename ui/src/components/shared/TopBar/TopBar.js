import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";

import SystemProgress from './SystemProgress/SystemProgress';
import Settings from './Settings/Settings';

import Dialog from 'material-ui/Dialog';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import Popover from 'material-ui/Popover';
import FlatButton from 'material-ui/FlatButton';
import SettingsIcon from 'material-ui/svg-icons/action/settings';

import './TopBar.scss'

@withRouter
@inject("store")
@observer
export default class TopBar extends Component {
	constructor(props) {
		super(props);
		this.state = {
            aborting: false,
            restarting: false,
            restartDialog: false,
            showSettings: false
		};
	}

    renderSystemProgressPopover() {
        const { appState } = this.props.store;
        const { systemProgressOpen } = appState;

		return (
			<Popover className="system-progress-popover" open={systemProgressOpen} useLayerForClickAway={false}>
				<SystemProgress
                    key={systemProgressOpen}
                    abortHidden={true}
					onClose={() => appState.set({systemProgressOpen: false})}
				/>
			</Popover>
        );
	}

    renderSettingsPopover() {
		return (
			<Popover className="settings-popover" open={this.state.showSettings} useLayerForClickAway={false}>
				<Settings
					onRestart	={() => this.setState({restartDialog: true})}
					onShutdown	={() => this.setState({shutdownDialog: true})}
					onClose		={() => this.setState({showSettings: undefined})}
				/>
			</Popover>
        );
	}

	renderUser() {
        const { store } = this.props;
        const { appState } = store;
        const { currentUser } = appState;

        if (currentUser && !location.href.includes('login')) {
            return (
                <span className="app-username">
                    | {currentUser} (<a href="/#/login?logout=true">logout</a>)
                </span>
            );
        }
    }

	render() {
        const { store } = this.props;
        const { appState } = store;
        const { currentUser } = appState;

        return (
			<div className="top-bar" hidden={this.props.hidden}>
                <AppBar
                    title={<span className="app-header">Beyond {this.renderUser()}</span>}
                    onLeftIconButtonTouchTap={() => this.props.onMenuHandleClick()}
                    iconElementLeft={location.hash.includes('login') ? <div/> : undefined}
					iconElementRight={
						<div>
                            <IconButton
                                data-tooltip="Settings"
                                onClick={() => this.setState({showSettings: true})}
                                hidden={currentUser !== 'admin'}
                            >
                                <SettingsIcon />
                            </IconButton>
						</div>
					}
				/>
                {this.renderSystemProgressPopover()}
                {this.renderSettingsPopover()}
			</div>
		);
	}
}
