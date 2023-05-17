import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
//library to handle captcha for registration
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from 'react-simple-captcha';
import auth from "../services/authService";
import { toast } from "react-toastify";
import DOMPurify from 'isomorphic-dompurify';

class RegisterForm extends Form {
  state = {
    data: { email: "", password: "", name: "",  confirmPassword: "", phone_number: "", userCaptcha: "", message: "", success: false},
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
        errors.forEach(err => {
          err.message = 'Passwords must match';          
        });
        return errors;
      }),
    //phone_number: Joi.string().allow('').optional(),
    phone_number: Joi.string().allow('')
      .optional()      
      .regex(/^[0-9]{10,11}$/)
      .label("phone_number")
      .error(errors => {        
        errors.forEach(err => {
          err.message = 'Phone number must be valid';          
        });
        return errors;
      }),  
    userCaptcha: Joi.string().required(),
    message: Joi.string().allow('').optional(),
    success: Joi.boolean()

  };

  componentDidMount(){
    auth.removeAllCookies();
    loadCaptchaEnginge(6,'black','white','upper');
  }

  doSubmit = async () => {    
    this.setState({data: {...this.state.data, success: false, message: ""}});
    try {
      if (validateCaptcha(this.state.data.userCaptcha)===true) {          
          
          const { data } = this.state;
          //sanitize the inputs  
          let email = DOMPurify.sanitize(data.email,{ALLOWED_TAGS: []});
          let password = DOMPurify.sanitize(data.password,{ALLOWED_TAGS: []});
          let phone_number = DOMPurify.sanitize(data.phone_number,{ALLOWED_TAGS: []});
          let name = DOMPurify.sanitize(data.name,{ALLOWED_TAGS: []});
          if(email !== data.email || password !== data.password || name !== data.name || phone_number !== data.phone_number){
            toast.error('Invalid input');
            return;
          }
          var registerData = {
            name: DOMPurify.sanitize(data.name,{ALLOWED_TAGS: []}),
            email: DOMPurify.sanitize(data.email,{ALLOWED_TAGS: []}),
            password: DOMPurify.sanitize(data.password,{ALLOWED_TAGS: []}),
            phone_number: DOMPurify.sanitize(data.phone_number,{ALLOWED_TAGS: []})
          }
          const response = await auth.register(registerData);
          
          if (response && response.data && response.data.status.toLowerCase() === "pass") {            
            this.setState({data: {...this.state.data, success: true, message: ""}});
            window.location = "/register/verify";
          } 
          else if (response && response.data && response.data.status.toLowerCase() === "fail") {
            loadCaptchaEnginge(6,'black','white','upper');
            this.setState({data: {...this.state.data, success: false, message: response.data.message}});
          }
          else {
            loadCaptchaEnginge(6,'black','white','upper');
            toast.error(response.data.message);
          }        
      }
      else {
          loadCaptchaEnginge(6,'black','white','upper');
          this.setState({userCaptcha : ""});
      }
      
    } catch (err) {
      loadCaptchaEnginge(6,'black','white','upper');
      if (err.response && err.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.username = err.response.data;
        this.setState({ errors });
      }
      else {
        this.setState({data: {...this.state.data, success: false, message: err.response.data.message}});        
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
            {this.renderInput("phone_number", "Phone Number", "text","", "01234567890")}
            {this.renderInput("email", "Email", "text", "required")}
            {this.renderInput("password", "Password", "password", "required")}
            <p>Password must contain</p>
            <ul>
              <li>atleast 8 characters</li>
              <li>atleast one uppercase letter</li>
              <li>atleast one lowercase letter</li>
              <li>atleast one number/digit</li>
              <li>atleast one special character</li>
            </ul>
            {this.renderInput("confirmPassword", "Confirm Password", "password", "required")}     
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
            {/* {this.state.data.success &&
              <span>
                <label style={{marginLeft: "10px", color:"green"}}><i class="fa-solid fa-circle-check" style={{marginRight: "5px"}}></i>Registered Successfully!! <a href="/login" className="text-underline">Click here</a> to login</label>              
              </span>
            } */}
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
