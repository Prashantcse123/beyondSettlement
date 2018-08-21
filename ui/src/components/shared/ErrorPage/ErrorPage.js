import { withStyles } from "@material-ui/core/styles";

import Button from '@material-ui/core/Button';

import ErrorIcon from '@material-ui/icons/Error';
import SettingsIcon from '@material-ui/icons/Settings';

import Styles from './ErrorPage.styles';

@withStyles(Styles)
export default class ErrorPage extends Component {
    renderIcon() {
        const { classes, icon } = this.props;

        if (icon) {
            return icon;
        }else{
            return <ErrorIcon className={classes.errorPageIcon} />
        }
    }

    renderTitle() {
        const { title } = this.props;

        if (title) {
            return <h1>{title}</h1>;
        }else{
            return <h1>Oops... :(</h1>
        }
    }

    renderText() {
        const { text } = this.props;

        if (text) {
            return text.split('\n').map((row, i) =>
                <h2 key={i}>{row}</h2>);
        }
    }

    renderButton() {
        const { classes, button } = this.props;

        if (button === false) return;

        if (button) {
            return button;
        }else{
            return (
                <Button onClick={() => this.props.history.push('/scorecard')}>
                    <SettingsIcon className={classes.leftIcon} />
                    Go to scorecard page
                </Button>
            );
        }
    }

	render() {
        const { classes } = this.props;

        return (
			<div className={classes.errorPage}>
                {this.renderIcon()}
                {this.renderTitle()}
                <br/>
                {this.renderText()}
                <br/><br/>
                {this.renderButton()}
            </div>
		);
	}
}
