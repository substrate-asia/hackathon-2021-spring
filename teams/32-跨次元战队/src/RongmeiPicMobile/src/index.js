import '@babel/polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import {HashRouter} from 'react-router-dom'
import {Provider} from 'mobx-react'

//打包时，用的HashRouter并加上了basename，因为放在服务器的二级目录下
ReactDOM.render(
    <HashRouter basename={'/picmobile'}>
        <Provider>
            <App/>
        </Provider>
    </HashRouter>,
    document.getElementById('root'));
registerServiceWorker();