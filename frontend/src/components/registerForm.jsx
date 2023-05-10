import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
//import auth from "../services/authService";

class RegisterForm extends Form {
  state = {
    data: { email: "", password: "", name: "",  confirmPassword: "", phone_number: ""},
    errors: {}
  };

  schema = {
    email: Joi.string()
      .required()
      .email()
      .label("Email"),
    password: Joi.string()
      .required()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*~])[A-Za-z\d!@#$%^&*~]{8,}$/)
      .label("Password")
      .error(errors => {        
        errors.forEach(err => {
          err.message = '"Password" must contain atleast 8 characters, one uppercase, one lowercase, one digit and a special character @$!%*?&';          
        });
        return errors;
      }),      
    name: Joi.string()
      .required()
      .min(3)
      .label("Name"),    
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref('password'))
      .error(errors => {
        console.log(errors);
        errors.forEach(err => {
          err.message = 'Passwords must match';          
        });
        return errors;
      }),
    phone_number: Joi.string() 
  };

  doSubmit = async () => {
    try {
      //const response = await userService.register(this.state.data);
      //auth.loginWithJwt(response.headers["x-auth-token"]);
      window.location = "/";
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.username = ex.response.data;
        this.setState({ errors });
      }
    }
  };

  render() {
    return (
      <div className="row justify-content-center">
        <div className="col-8">
          <h1>Register</h1>
          <form onSubmit={this.handleSubmit}>
            {this.renderInput("name", "Name", "text", "required")}
            {this.renderInput("phone_number", "Phone Number", "text")}
            {this.renderInput("email", "Email", "text", "required")}
            {this.renderInput("password", "Password", "text", "required")}
            <p>Password must contain</p>
            <ul>
              <li>atleast 8 characters</li>
              <li>atleast one uppercase letter</li>
              <li>atleast one lowercase letter</li>
              <li>atleast one number/digit</li>
              <li>atleast one special character</li>
            </ul>
            {this.renderInput("confirmPassword", "Confirm Password", "text", "required")}            
            {this.renderButton("Register")}
            <div className="m-t-10">
              <p>Already Registered? <a href="/login" className="text-underline">Click here</a></p> 
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default RegisterForm;
