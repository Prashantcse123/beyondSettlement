import { withStyles } from "@material-ui/core/styles";

import ErrorPage from '../../shared/ErrorPage/ErrorPage';

import BlockIcon from '@material-ui/icons/Block';

import Styles from '../../shared/ErrorPage/ErrorPage.styles';

@withStyles(Styles)
export default class NoAccess403 extends Component {
    get errorText() {
        return 'You do not have sufficient privileges to access this item\nPlease contact the owner of this item in order to fix this';
    }
	render() {
	    return (
	        <ErrorPage
                title="Oh no!"
                icon={<BlockIcon className={classes.errorPageIcon} />}
                text={this.errorText}
            />
        );
	}
}
