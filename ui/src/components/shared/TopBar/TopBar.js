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
            abortScanDialog: false,
            restarting: false,
            restartDialog: false,
            showSettings: false
		};
	}

	onAbortClick() {
        const { appState } = this.props.store;

        this.setState({aborting: true});

        appState.abortSystemTask()
			.then(() =>
				this.setState({
					aborting: false,
					abortScanDialog: false
				}))
			.catch((ex) => {
                this.setState({aborting: false});
                Beyond.App.TopMessage.show('Abort Error');
			});
    }

	renderAbortScanDialog() {
        return (
			<Dialog
				title="Are you sure?"
				actions={[
					<FlatButton
						label="Cancel"
						onClick={() => this.setState({abortScanDialog: false})}
						keyboardFocused
					/>,
					<FlatButton
						label={this.state.aborting ? 'Aborting...' : 'Abort'}
						secondary
						onClick={(e) => this.onAbortClick(e)}
                        disabled={this.state.aborting}
					/>
                ]}
				modal={true}
				open={this.state.abortScanDialog === true}
				onRequestClose={() => this.setState({abortScanDialog: false})}
			>
				You are about to abort this scan.
			</Dialog>
        );
    }

    renderSystemProgressPopover() {
        const { appState } = this.props.store;
        const { systemProgressOpen } = appState;

        let viewButtonTarget = appState.lastProcessedScanId;

        if (appState.lastProcessedAnalysisType) {
        	viewButtonTarget += '/analyses/' + appState.lastProcessedAnalysisType;
        }

		return (
			<Popover className="system-progress-popover" open={systemProgressOpen} useLayerForClickAway={false}>
				<SystemProgress
                    key={systemProgressOpen + appState.lastProcessedScanId}
                    abortHidden={true}
					onView ={() => this.props.history.push('/view_scan/' + viewButtonTarget)}
					onAbort={() => this.setState({abortScanDialog: true})}
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
                    onAutoScale ={() => this.onAutoScaleClick()}
				/>
			</Popover>
        );
	}

	render() {
        return (
			<div className="top-bar" hidden={this.props.hidden}>
                <AppBar
                    title={<span className="app-header">Beyond</span>}
                    onLeftIconButtonTouchTap={() => this.props.onMenuHandleClick()}
					iconElementRight={
						<div>
                            <IconButton
                                data-tooltip="Settings"
                                onClick={() => this.setState({showSettings: true})}
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
