/**
 * @file 首页
 * @author jiangchunhui
 */
import React, {StrictMode} from 'react';
import {BrowserRouter} from 'react-router-dom';
import ReactDOM from 'react-dom';

import Router from '../router';
import './index.less';

ReactDOM.render(
    <StrictMode>
        <BrowserRouter>
            <Router />
        </BrowserRouter>
    </StrictMode>,
    document.getElementById('root')
);
