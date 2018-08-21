import React, {Component} from 'react';
import { inject, observer } from "mobx-react";
import { withStyles } from "@material-ui/core/styles";

import ClassNames from 'classnames';

import { Popper } from 'react-popper';

import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import LinearProgress from "@material-ui/core/LinearProgress";

import SettingsIcon from '@material-ui/icons/Settings';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
const dark = createMuiTheme({palette: {type: 'dark'}});

import Styles from "./SystemProgress.styles";

@withStyles(Styles)
@inject("store")
@observer
export default class SystemProgress extends Component {
	constructor(props) {
		super(props);
		this._preparingTimeFactor = 60; // sec
		this.state = {preparingPercentage: 0};
	}

	get task() {
        const { systemStatus } = this.props.store.systemProgress;
        return systemStatus.task || '';
    }

    get target() {
        return this.task.split('_').first();
    }

    get busy() {
        const { systemStatus } = this.props.store.systemProgress;
        return systemStatus.busy;
    }

    get abortable() {
        const { systemStatus } = this.props.store.systemProgress;
        return systemStatus.abortable;
    }

	get preparing() {
        return this.busy && this.progress === 0;
    }

	get done() {
        const { systemTaskDone } = this.props.store.systemProgress;
	    return systemTaskDone === true;
    }

	get aborted() {
        const { systemTaskAborted } = this.props.store.systemProgress;
	    return systemTaskAborted;
    }

	get failed() {
        const { systemTaskFailed } = this.props.store.systemProgress;
	    return systemTaskFailed;
    }

    get progress() {
        const { systemStatus } = this.props.store.systemProgress;
        return systemStatus.progress || 0;
    }

    componentDidMount() {
	    this.props.store.systemProgress.startSystemStatusMonitor();

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
        const { classes, store } = this.props;
        const { systemProgress } = store;
        const { systemStatus } = systemProgress;

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
            titleText = target.capitalize() + ' in progress...';
        }

        return <Typography component="span" className={classes.targetTitle}>{titleText}</Typography>;
	}

	renderIcon() {
        const { classes } = this.props;

        return <SettingsIcon className={ClassNames(classes.whiteColor, {[classes.blink]: this.busy})} />;
    }

    renderContent() {
        const { classes } = this.props;
        const { preparingPercentage } = this.state;

        this._target = this.target || this._target || '';

        return (
            <div className={ClassNames(classes.systemProgress, classes.root)}>
                <div className={classes.systemProgressHeader}>
                    {this.renderIcon()}
                    {this.renderTitle()}
                </div>
                <div
                    className={classes.systemProgressBarContainer}
                    hidden={!this.progress || this.preparing || this.done || this.aborted}
                >
                    <Typography variant="title">
                        {this.progress === -1 ? '.' : Numeral(this.progress).format('0.00%')}
                    </Typography>
                    <LinearProgress
                        value={this.progress}
                        variant={this.progress === -1 ? 'indeterminate' : 'determinate'}
                        classes={{barColorPrimary: classes['value' + parseInt(this.progress * 100)]}}
                    />
                </div>
                <div
                    className={ClassNames(classes.systemProgressBarContainer)}
                    hidden={!this.preparing}
                >
                    <Typography variant="title">
                        {this.progress + '%'}
                    </Typography>
                    <LinearProgress
                        hidden={preparingPercentage === 0}
                        value={preparingPercentage}
                        variant="determinate"
                        classes={{barColorPrimary: classes['value' + parseInt(this.progress * 100)]}}
                    />
                    <LinearProgress
                        hidden={preparingPercentage !== 0}
                        variant="indeterminate"
                        // classes={{
                        //     colorPrimary: classes.whiteBackground,
                        //     barColorPrimary: classes.redBackground,
                        // }}
                    />
                </div>
                <div className={classes.systemProgressActions}>
                    <Button onClick={(e) => this.props.onClose(e)}>
                        Hide
                    </Button>
                </div>
            </div>
        );
    }

	render() {
        const { store } = this.props;
        const { systemProgress } = store;
        const { systemProgressOpen } = systemProgress;

        return (
            <MuiThemeProvider theme={dark}>
                <i
                    ref={(el) => this._anchor = el}
                    style={{ position: 'fixed', bottom: 0, left: '50%', width: 1 }}
                />
                {(systemProgressOpen && !!this._anchor) &&
                    <Popper placement="bottom" target={this._anchor}>
                        <Paper>
                            {this.renderContent()}
                        </Paper>
                    </Popper>
                }
            </MuiThemeProvider>
		);
	}
}
