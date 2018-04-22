import FlatButton from 'material-ui/FlatButton';

import CloseIcon from 'material-ui/svg-icons/navigation/close';
import InfoIcon from 'material-ui/svg-icons/alert/error';
import ErrorIcon from 'material-ui/svg-icons/alert/warning';

import './MessageCenter.scss'

export default class MessageCenter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            message: {}
        };
    }

    hide() {
        this.setState({open: false});
        setTimeout(() =>
            this.setState({message: {}}), 300);
    }

    show(message) {
        this.setState({open: true, message});
    }

    setNewMessage(message) {
        this.hide();

        setTimeout(() =>
            this.show(this.props.message), 300);

        if (!!message.autoHide) {
            if (message.autoHide === true) {
                message.autoHide = 5000;
            }
            setTimeout(() =>
                this.hide(), message.autoHide);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        let prevMessage = prevProps.message  || {};
        let thisMessage = this.props.message || {};

        if (!prevMessage.isIdentical(thisMessage)) {
            this.setNewMessage(thisMessage);
        }
    }

    render() {
        const {open, message} = this.state;

        let type = message.type || 'general';
        let icon = message.icon;

        if (!icon && icon !== false) {
            if (type === 'info') {
                icon = <InfoIcon/>;
            }else if (type === 'error') {
                icon = <ErrorIcon/>;
            }
        }

        return (
            <div className={ClassNames('message-center', {open})}>
                <div className={ClassNames('message-center-content', 'type-' + type)} style={{width: (open ? message.width : 0)}}>
                    <div className="message-center-content-container" style={{width: message.width}}>
                        <div className="message-center-icon" hidden={!icon}>
                            {icon}
                        </div>
                        <div className="message-center-text" hidden={!message.text}>
                            {message.text}
                        </div>
                        <FlatButton
                            className="message-center-close"
                            icon={<CloseIcon/>}
                            onClick={() => this.hide()} style={{minWidth: 40}}
                            hidden={message.closeButton === false}
                        />
                        <div className="message-center-tools" hidden={!message.tools}>
                            {message.tools}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}