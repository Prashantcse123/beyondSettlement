import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import FlatButton from 'material-ui/FlatButton';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import CloseIcon from 'material-ui/svg-icons/navigation/close';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {Card, CardActions, CardHeader} from "material-ui/Card/index";

import './Settings.scss'

@inject("store")
@observer
export default class Settings extends Component {
	constructor(props) {
		super(props);
		this.state = {open: false};
	}

	render() {
        const { appState } = this.props.store;

		return (
			<MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
				<Card className="settings">
					<CardHeader
						style={{fontWeight: 100}}
						subtitle="Settings"
						title={<FlatButton icon={<CloseIcon />} onClick={(e) => this.props.onClose(e)} style={{position: 'absolute', right: 6, top: 6, minWidth: 50}} />}
					/>
					<CardActions>
						<FlatButton label="Import Redshift Data" icon={<SettingsIcon/>} onClick={() => appState.importRedshiftData()} />
                        <br/>
						<FlatButton label="Start Calculations" icon={<SettingsIcon/>} onClick={() => appState.startCalculations()} />
					</CardActions>
				</Card>
			</MuiThemeProvider>
		);
	}
}
