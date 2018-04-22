import ErrorPage from '../../shared/ErrorPage/ErrorPage';

import FingerprintIcon from 'material-ui/svg-icons/action/fingerprint';

export default class NoAccess401 extends Component {
    get errorText() {
        return 'The item you are trying to access is not public\nPlease sign in and try again';
    }
	render() {
	    return (
	        <ErrorPage
                title="Oh no!"
                icon={<FingerprintIcon className="error-page-icon" />}
                text={this.errorText}
            />
        );
	}
}
