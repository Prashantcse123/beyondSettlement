import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { withStyles } from "@material-ui/core/styles";

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";

import CloseIcon from '@material-ui/icons/Close';
import SettingsIcon from '@material-ui/icons/Settings';

import Styles from './Settings.styles';

@withStyles(Styles)
@inject("store")
@observer
export default class Settings extends Component {
	constructor(props) {
		super(props);
		this.state = {open: false};
	}

	componentDidMount() {
        const { store } = this.props;
        const { systemProgress } = store;

        systemProgress.bind({
            onSystemStatusChange: (statusData) => {
                console.log(systemProgress.systemTaskDone);
                if (systemProgress.systemTaskDone) {
                    Beyond.App.Views.Scorecard.componentDidMount();
                }
            }}, this);
    }

	render() {
	    const { classes, store } = this.props;
        const { appState, systemProgress } = store;

		return (
            <Card className={classes.settings}>
                <CardHeader
                    subheader="Admin Tools"
                    action={<IconButton onClick={(e) => this.props.onClose(e)}><CloseIcon color="inherit" /></IconButton>}
                />
                <CardActions>
                    <Button
                        onClick={() =>
                            appState.importRedshiftData().then(() =>
                                systemProgress.startSystemStatusMonitor({force: true}))}
                    >
                        <SettingsIcon className={classes.leftIcon} color="inherit" />
                        Import Redshift Data
                    </Button>
                </CardActions>
                <CardActions>
                    <Button
                        onClick={() =>
                            appState.startCalculations().then(() =>
                                systemProgress.startSystemStatusMonitor({force: true}))}
                    >
                        <SettingsIcon className={classes.leftIcon} color="inherit" />
                        Start Calculations
                    </Button>
                </CardActions>
                <br/>
            </Card>
		);
	}
}
