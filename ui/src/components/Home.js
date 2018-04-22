import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Card from 'material-ui/Card';
// import HomeImage from '../images/beyond_home.png';

@inject("store")
@observer
export default class Home extends Component {
	constructor(props) {
		super(props);
		this.store = this.props.store;
	}

	render() {
		const store = this.store;
		return (
			<Card className="page home" style={{textAlign: 'center'}}>
				{/*<img src={HomeImage}/>*/}
			</Card>
		);
	}
}
