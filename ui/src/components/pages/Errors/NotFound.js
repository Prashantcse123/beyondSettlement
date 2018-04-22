import ErrorPage from '../../shared/ErrorPage/ErrorPage';

export default class NotFound extends Component {
    get errorText() {
        return 'The item you have requested could not be found\nEither you typed a wrong URL, or you followed a bad link';
    }
	render() {
	    return <ErrorPage text={this.errorText} />;
	}
}
