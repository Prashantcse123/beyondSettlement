import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import LogoImage from './LogoSmall.jpg';

import SystemProgress from '../SystemProgress/SystemProgress';

import Settings from './Settings/Settings';

import Tooltip from '@material-ui/core/Tooltip';
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import Popover from "@material-ui/core/Popover";

import MenuIcon from '@material-ui/icons/Menu';
import SettingsIcon from '@material-ui/icons/Settings';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
const theme = createMuiTheme({palette: {type: 'dark'}});

import Styles from "./TopBar.styles";

@withStyles(Styles)
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

	// authenticate(e) {
	// 	if (e) e.preventDefault();
	// 	console.log("CLICKED BUTTON");
	// 	this.store.authenticate();
	// }

    renderSystemProgressPopover() {
        const { store } = this.props;
        const { systemProgress } = store;
        const { systemProgressOpen } = systemProgress;

        return (
            <SystemProgress
                key={systemProgressOpen}
                onClose={() => systemProgress.set({systemProgressOpen: false})}
            />
        );
	}

    renderSettingsPopover() {
        const { showSettings } = this.state;

		return (
            <MuiThemeProvider theme={theme}>
                <Popover
                    open={Boolean(showSettings)}
                    anchorEl={this.settingsAnchorEl}
                    anchorOrigin={{vertical: 'top', horizontal: 'right',}}
                    transformOrigin={{vertical: 'top', horizontal: 'right',}}
                    onClose={() => this.setState({showSettings: undefined})}
                >
                    <Settings onClose={() => this.setState({showSettings: undefined})}/>
                </Popover>
            </MuiThemeProvider>
        );
	}

    renderTitle() {
        const { classes, store } = this.props;
        const { appState } = store;
        const { appTitle } = appState;

        return (
            <Typography className={classes.appTitle} variant="title" color="inherit">
                {appTitle}
            </Typography>
        );
	}

	renderLeftArea() {
        const { classes, onMenuHandleClick, store } = this.props;
        const { appState } = store;
        const { authenticated } = appState;

	    return (
	        <div className={classes.leftArea}>
                <IconButton onClick={() => onMenuHandleClick()} color="inherit" hidden={!authenticated}>
                    <MenuIcon color="inherit" />
                </IconButton>
                <img src={LogoImage} />
            </div>
        );
    }

	render() {
	    const { classes, hidden } = this.props;
        const { authenticated } = this.props.store.appState;
        const { systemStatus } = this.props.store.systemProgress;

        return (
			<div className={classes.topBar} hidden={hidden}>
                <AppBar position="static">
                    <Toolbar className={classes.innerToolbar}>
                        {this.renderLeftArea()}
                        {this.renderTitle()}
                        <div className={classes.rightControls} hidden={!authenticated}>
                            <Tooltip title="Admin Tools">
                                <IconButton
                                    className={ClassNames({[classes.blink]: systemStatus.busy})}
                                    buttonRef={node => this.settingsAnchorEl = node}
                                    onClick={() => this.setState({showSettings: true})}
                                    color="inherit"
                                >
                                    <SettingsIcon/>
                                </IconButton>
                            </Tooltip>
                        </div>
                    </Toolbar>
                </AppBar>
                {this.renderSystemProgressPopover()}
                {this.renderSettingsPopover()}
			</div>
		);
	}
}
