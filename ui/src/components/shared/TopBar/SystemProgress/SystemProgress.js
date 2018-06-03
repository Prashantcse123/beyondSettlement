import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import FlatButton from 'material-ui/FlatButton';
import LinearProgress from 'material-ui/LinearProgress';
import {Card, CardActions, CardHeader, CardTitle} from "material-ui/Card/index";

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import SettingsIcon from 'material-ui/svg-icons/action/settings';

import './SystemProgress.scss'

@inject("store")
@observer
export default class SystemProgress extends Component {
	constructor(props) {
		super(props);
		this._preparingTimeFactor = 60; // sec
		this.state = {preparingPercentage: 0};
	}

	get task() {
        const { systemStatus } = this.props.store.appState;
        return systemStatus.task || '';
    }

    get target() {
        return this.task.split('_').first();
    }

    get busy() {
        const { systemStatus } = this.props.store.appState;
        return systemStatus.busy;
    }

    get abortable() {
        const { systemStatus } = this.props.store.appState;
        return systemStatus.abortable;
    }

	get preparing() {
	    return this.busy && this.progress === 0;
    }

	get done() {
        const { systemTaskDone } = this.props.store.appState;
	    return systemTaskDone === true;
    }

	get aborted() {
        const { systemTaskAborted } = this.props.store.appState;
	    return systemTaskAborted;
    }

	get failed() {
        const { systemTaskFailed } = this.props.store.appState;
	    return systemTaskFailed;
    }

    get progress() {
        const { systemStatus } = this.props.store.appState;
        return systemStatus.progress || 0;
    }

    componentDidMount() {
        this._iv = setInterval(() => {
            if (!this.preparing) return;
            this._elapsedTime = (this._elapsedTime || 0) + 1;
            this.setState({preparingPercentage: this._elapsedTime / this._preparingTimeFactor * 100});
            if (this._preparingTimeFactor === this._elapsedTime) {
                clearInterval(this._iv);
                this.setState({preparingPercentage: 0});
            }
        }, 2000);
	}

    componentWillUnmount() {
	    clearInterval(this._iv);
    }

    renderTitle() {
        const { systemStatus } = this.props.store.appState;

        let titleText = '';
        let target = (this.task === 'analysis' ? systemStatus.analysis_type + ' Analysis' : this._target);

        if (this.aborted && this.busy) {
            titleText = 'Aborting ' + target;
        }else if (this.failed) {
            titleText = target.capitalize() + ' Failed!';
        }else if (this.aborted) {
            titleText = target.capitalize() + ' Aborted!';
        }else if (this.done) {
            titleText = target.capitalize() + ' Done!';
        }else if (this.busy) {
            titleText = target + ' in progress...';
        }

        return <span className="target-title">{titleText}</span>;
	}

	renderIcon() {
	    return <SettingsIcon className={ClassNames('target-icon', {blink: this.busy})} />;
    }

	render() {
		const { preparingPercentage } = this.state;
        this._target = this.target || this._target || '';

        return (
			<MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
				<Card className="system-progress">
					<CardHeader
						className="system-progress-header"
						style={{fontWeight: 100}}
						subtitle={
							<div>
                                {this.renderIcon()}
                                {this.renderTitle()}
							</div>
						}
					/>
                    <div className="system-progress-bar-container" hidden={!this.progress || this.preparing || this.done || this.aborted}>
                        <CardTitle
                            className="system-progress-bar"
                            title={this.progress === 0.0111222333 ? '.' : Numeral(this.progress).format('0.00%')}
                            subtitle={
                                <LinearProgress
                                    hidden={this.progress === 0}
                                    value={this.progress * 100}
                                    mode={this.progress === 0.0111222333 ? 'indeterminate' : 'determinate'}
                                    color="white"
                                />
                            }
                        />
                    </div>
                    <div className="system-progress-bar-container" hidden={!this.preparing}>
                        <CardTitle
                            className="system-progress-bar"
                            subtitle={
                                <div>
                                    <LinearProgress
                                        hidden={preparingPercentage === 0}
                                        value={preparingPercentage}
                                        mode="determinate"
                                        color="white"
                                    />
                                    <LinearProgress
                                        hidden={preparingPercentage !== 0}
                                        mode="indeterminate"
                                        color="white"
                                    />
                                </div>
                            }
                        />
                    </div>
					<CardActions className="system-progress-actions">
						{/*<FlatButton label="Abort" onClick={(e) => this.props.onAbort(e)} hidden={!this.abortable || this.props.abortHidden || this.done} />*/}
						<FlatButton label="Hide"  onClick={(e) => this.props.onClose(e)} />
					</CardActions>
				</Card>
			</MuiThemeProvider>
		);
	}
}
