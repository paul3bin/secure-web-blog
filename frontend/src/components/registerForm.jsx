import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
//import auth from "../services/authService";
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from 'react-simple-captcha';
import auth from "../services/authService";
import { toast } from "react-toastify";

class RegisterForm extends Form {
  state = {
    data: { email: "bhaskerr@gmail.com", password: "Hello123@", name: "TEST",  confirmPassword: "Hello123@", phone_number: "1234567890", userCaptcha: "", message: "", success: false},
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
    phone_number: Joi.string().allow('').optional(),
    userCaptcha: Joi.string().required(),
    message: Joi.string().allow('').optional(),
    success: Joi.boolean()

  };

  componentDidMount(){
    auth.removeAllCookies();
    loadCaptchaEnginge(4,'black','white');
  }

  doSubmit = async () => {    
    this.setState({data: {...this.state.data, success: false, message: ""}});
    try {
      if (validateCaptcha(this.state.data.userCaptcha)===true) {          
          
          const { data } = this.state;
          var registerData = {
            name: data.name,
            email: data.email,
            password: data.password,
            phone_number: data.phone_number
          }
          const response = await auth.register(registerData);
          console.log(response);
          if (response && response.data && response.data.status.toLowerCase() === "pass") {            
            this.setState({data: {...this.state.data, success: true, message: ""}});
            window.location = "/register/verify";
          } 
          else if (response && response.data && response.data.status.toLowerCase() === "fail") {
            loadCaptchaEnginge(4,'black','white');
            this.setState({data: {...this.state.data, success: false, message: response.data.message}});
          }
          else {
            loadCaptchaEnginge(4,'black','white');
            toast.error(response.data.message);
          }        
      }
      else {
          toast.error('Captcha Does Not Match');
          this.setState({userCaptcha : ""});
      }
      
    } catch (err) {
      console.log(err.response.data);
      loadCaptchaEnginge(4,'black','white');
      if (err.response && err.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.username = err.response.data;
        this.setState({ errors });
      }
      else {
        this.setState({data: {...this.state.data, success: false, message: err.response.data.message}});
        console.log(this.state);
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
            <div className="col mt-3">
                < LoadCanvasTemplate reloadColor="red" />
            </div> 
            {/* <div className="col mt-3">
                <div><input placeholder="Enter Captcha Value" id="user_captcha_input" name="user_captcha_input" type="text"></input></div>
            </div> */}
            {this.renderInput("userCaptcha", "Enter Captcha Value", "text", "required")} 
            {this.renderButton("Register")}
            <span>
              <button className="btn btn-secondary" style={{marginLeft: "10px"}} onClick={()=>{window.location = "/posts";}}> Cancel </button>
            </span>
            {this.state.data.success &&
              <span>
                <label style={{marginLeft: "10px", color:"green"}}><i class="fa-solid fa-circle-check" style={{marginRight: "5px"}}></i>Registered Successfully!! <a href="/login" className="text-underline">Click here</a> to login</label>              
              </span>
            }
            {this.state.data.message &&
              <span>
                <label style={{marginLeft: "10px", color:"red"}}><i class="fa-solid fa-circle-xmark" style={{marginRight: "5px"}}></i>{this.state.data.message}</label>              
              </span>
            }
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
