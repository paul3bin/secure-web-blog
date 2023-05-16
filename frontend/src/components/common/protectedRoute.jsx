import React from "react";
import { Route, Redirect } from "react-router-dom";
import auth from "../../services/authService";

const ProtectedRoute = ({ path, component: Component, render, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        if(path.endsWith('login/verify')){
          if(!auth.getLoggedInUser())
            return (
              <Redirect
                to={{
                  pathname: "/login",
                  state: { from: props.location }
                }}
              />
            );
        }
        else if(path.endsWith('register/verify')){
          if(!auth.getRegisteredUser())
            return (
              <Redirect
                to={{
                  pathname: "/register",
                  state: { from: props.location }
                }}
              />
            );
        }
        else {
          if (!auth.getCurrentUser())
            return (
              <Redirect
                to={{
                  pathname: "/login",
                  state: { from: props.location }
                }}
              />
            );
        }
        return Component ? <Component {...props} /> : render(props);
      }}
    />
  );
};

export default ProtectedRoute;
