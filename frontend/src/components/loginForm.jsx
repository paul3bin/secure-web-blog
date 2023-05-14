// Code Reference:
// 1. encodeURIComponent - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent

import React from "react";
import { Redirect } from "react-router-dom";
import Joi from "joi-browser";
import Form from "./common/form";
import auth from "../services/authService";
import { toast } from "react-toastify";

class LoginForm extends Form {
  state = {
    data: { email: "email2kiranmayee@gmail.com", password: "Hello123@" },
    errors: {},
  };

  schema = {
    email: Joi.string().required().label("Email"),
    password: Joi.string().required().label("Password"),
  };

  doSubmit = async () => {
    try {
      const { data } = this.state;
      const response = await auth.login(
        encodeURIComponent(data.email),
        encodeURIComponent(data.password)
      );
      if (response && response.data && response.data.status === "pass") {
        window.location = "/verify";
      } else {
        toast.error(response.data.message);
      }
    } catch (ex) {
      console.log("ex", ex);
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.email = ex.response.data;
        this.setState({ errors });
      }
    }
  };

  render() {
    //if (auth.getCurrentUser()) return <Redirect to="/" />;

    return (
      <div className="row justify-content-center">
        <div className="col-8">
          <h1>Login</h1>
          <form onSubmit={this.handleSubmit}>
            {this.renderInput("email", "Email", "text", "required")}
            {this.renderInput("password", "Password", "password", "required")}
            {this.renderButton("Login")}
            <button className="btn btn-secondary" style={{marginLeft: "10px"}} onClick={()=>{window.location = "/posts";}}> Cancel </button>
            <div className="m-t-10">
              <p>
                Not Registered?{" "}
                <a href="/register" className="text-underline">
                  Click here
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default LoginForm;
