import './utils/global';
import './fonts/roboto/index.css';

import { render } from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import { Provider } from 'mobx-react';
import { AppContainer } from 'react-hot-loader';

import App from './components/App';
import stores from './stores/stores';

// import { rehydrate, hotRehydrate } from 'rfx-core';
// import { isProduction } from './utils/constants';
// const store = rehydrate();

const renderApp = Component => {
    render(
        <AppContainer>
            <Router>
                <Provider store={stores}>
                    <App />
                </Provider>
            </Router>
        </AppContainer>,
        document.getElementById('root')
    );
};

renderApp(App);

if (module.hot) {
    module.hot.accept(() => renderApp(App));
}
