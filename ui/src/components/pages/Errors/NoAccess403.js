import ErrorPage from '../../shared/ErrorPage/ErrorPage';

import BlockIcon from 'material-ui/svg-icons/content/block';

export default class NoAccess403 extends Component {
    get errorText() {
        return 'You do not have sufficient privileges to access this item\nPlease contact the owner of this item in order to fix this';
    }
	render() {
	    return (
	        <ErrorPage
                title="Oh no!"
                icon={<BlockIcon className="error-page-icon" />}
                text={this.errorText}
            />
        );
	}
}
