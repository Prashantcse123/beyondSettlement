import { withStyles } from "@material-ui/core/styles";

import ErrorPage from '../../shared/ErrorPage/ErrorPage';

import FingerprintIcon from '@material-ui/icons/Fingerprint';

import Styles from '../../shared/ErrorPage/ErrorPage.styles';

@withStyles(Styles)
export default class NoAccess401 extends Component {
    get errorText() {
        return 'The item you are trying to access is not public\nPlease sign in and try again';
    }
	render() {
        const { classes } = this.props;
	    return (
	        <ErrorPage
                title="Oh no!"
                icon={<FingerprintIcon className={classes.errorPageIcon} />}
                text={this.errorText}
            />
        );
	}
}
