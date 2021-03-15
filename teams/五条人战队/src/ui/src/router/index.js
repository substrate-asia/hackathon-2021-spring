import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Header from '../components/Header';

import Create from '../pages/Create';
import Issue from '../pages/Issue';
import Vote from '../pages/Vote';


const WidthHeader =  Component => (props) => (<div className={props.className}>
    <Header {...props} />
    <div className="page-main">
        <Component {...props} />
    </div>
</div>);


const router = () => {
    return (
        <Switch>
            <Route path="/" exact={true} component={WidthHeader(Create)} />
            <Route path="/issue" component={WidthHeader(Issue)} />
            <Route path="/vote/:id" component={WidthHeader(Vote)} />
            <Redirect to="/404" />
        </Switch>)
}

export default router;