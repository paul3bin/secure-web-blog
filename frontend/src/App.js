import React, { Component } from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import NavBar from "./components/navbar";
import LoginForm from "./components/loginForm";
import LoginVerifyForm from "./components/loginVerifyForm";
import RegisterForm from "./components/registerForm";
import RegisterVerifyForm from "./components/registerVerifyForm";
import Posts from "./components/posts";
import PostForm from "./components/postForm";
import PageNotFound from "./components/404-not-found";
import ProtectedRoute from "./components/common/protectedRoute";
// import NotFound from "./components/notFound";
// import Logout from "./components/logout";
import auth from "./services/authService";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

class App extends Component {
  state = {};

  componentDidMount() {
    const user = auth.getCurrentUser();
    this.setState({ user });
  }

  render() {
    const { user } = this.state;

    return (
      <React.Fragment>
        <ToastContainer />
        <NavBar user={user} />
        <main className="container">
          <Switch>            
            <Route path="/login/verify" component={LoginVerifyForm} />
            <Route path="/login" component={LoginForm} />            
            <Route path="/register/verify" component={RegisterVerifyForm} />
            <Route path="/register" component={RegisterForm} />
            <ProtectedRoute path="/posts/new" component={PostForm} />
            <Route path="/posts/:id" component={PostForm} />
            <Route
              path="/posts"
              render={props => <Posts {...props} user={this.state.user} myPosts={false}/>}
            />  
            {/* <Route
              path="/my-posts"
              render={props => <Posts {...props} user={this.state.user} myPosts={true} />}
            />  */}
            <Route path="/not-found" component={PageNotFound} />
            {/* <Route
              path="/"
              render={props => <Posts {...props} user={this.state.user} />}
            />   */}            
            <Redirect from="/" exact to="/posts" />
            <Redirect to="/not-found" />
          </Switch>
        </main> 
      </React.Fragment>
    );
  }
}

export default App;
