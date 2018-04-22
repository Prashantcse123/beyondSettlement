import './utils'

import ServiceController from './serviceController'
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import ClassNames from 'classnames'
import Moment from 'moment'
import Numeral from 'numeral'

window.React = React;
window.ReactDOM = ReactDOM;
window.Component = Component;
window.ClassNames = ClassNames;
window.Moment = Moment;
window.Numeral = Numeral;
window.Beyond = {
    App: {
        Views: {},
        ServiceController: new ServiceController()
    }
};
