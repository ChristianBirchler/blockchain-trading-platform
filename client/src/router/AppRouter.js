import React from 'react';
import Home from '../components/Home/Home'
import Admin from '../components/Admin/Admin'
import {Route, Switch, withRouter, Redirect } from 'react-router-dom';

class AppRouter extends React.Component {
    state = {
        isAuthenticated: false,
    }
      
    handleAuthentication(pKey){
        this.setState({ isAuthenticated: !this.state.isAuthenticated })
    }

    render(){
        return(
            <Switch>
            <div>
                <Route exact path="/">
                    <Redirect to="/home" />
                </Route>
                <Route
                    path="/home"
                    exact
                    render={() => {return(<Home auth={this.state.isAuthenticated} login={this.handleAuthentication.bind(this)}/>)}} />
                <Route
                    path="/admin"
                    exact 
                    render={() => { return this.state.isAuthenticated ? <Admin handleLogout={this.handleAuthentication.bind(this)}/> : <Redirect to="home"/>}}/>
            </div>
        </Switch>
        );
    }
}

export default withRouter(AppRouter);