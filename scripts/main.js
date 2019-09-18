const React = require("react");
const ReactDOM = require("react-dom");

import Graph from './components/graph';
import { Provider } from 'react-redux';
import store from './store';

ReactDOM.render(
    <Provider store={store}><Graph/></Provider>,
    document.getElementById("graph-app")
);