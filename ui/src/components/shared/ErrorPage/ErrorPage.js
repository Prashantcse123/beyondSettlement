import ErrorIcon from 'material-ui/svg-icons/alert/error';
import RaisedButton from 'material-ui/RaisedButton';
import ScannerIcon from 'material-ui/svg-icons/hardware/scanner';

import './ErrorPage.scss'

export default class ErrorPage extends Component {
    renderIcon() {
        const { icon } = this.props;

        if (icon) {
            return icon;
        }else{
            return <ErrorIcon className="error-page-icon" />
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
        const { button } = this.props;

        if (button === false) return;

        if (button) {
            return button;
        }else{
            return (
                <RaisedButton
                    label="Go to Scorecard page"
                    onClick={() => this.props.history.push('/scorecard')}
                />
            );
        }
    }

	render() {
        return (
			<div className="error-page">
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
