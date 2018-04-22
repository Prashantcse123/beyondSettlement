import './Collapsible.scss'

export default class Collapsible extends Component {
    render() {
        return (
            <div className={ClassNames('collapsible', {open: this.props.open})}>
                <div className="collapsible-header">
                    {this.props.header}
                </div>
                <div className="collapsible-content" hidden={!this.props.open}>
                    {this.props.content}
                </div>
            </div>
        );
    }
}
