// Code Reference:
// 1. encodeURIComponent - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent

import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import auth from "../services/authService";
import { toast } from "react-toastify";
import DOMPurify from 'isomorphic-dompurify';

class LoginForm extends Form {
  state = {
    data: { email: "", password: "" },
    errors: {},
  };

  // validate the inputs using Joi
  schema = {
    email: Joi.string().required().label("Email"),
    password: Joi.string().required().label("Password"),
  };

  componentDidMount = async() =>{
    auth.removeAllCookies(); //remove any cookies in the browser to ensure a new session
  }

  doSubmit = async () => {
    try {
      const { data } = this.state;  
      //sanitize the inputs  
      let email = DOMPurify.sanitize(data.email,{ALLOWED_TAGS: []});
      let password = DOMPurify.sanitize(data.password,{ALLOWED_TAGS: []});
      if(email !== data.email || password!== data.password){
        toast.error('Invalid input');
        return;
      }
      //encode the input 
      const response = await auth.login(
        encodeURIComponent(email),
        encodeURIComponent(password)
      );
      if (response && response.data && response.data.status === "pass") {
        window.location = "/login/verify";
      } else {
        toast.error(response.data.message);
      }
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.email = ex.response.data;
        this.setState({ errors });
      }
    }
  };

  render() {
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
