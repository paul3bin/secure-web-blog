import React from "react";
import { Redirect } from "react-router-dom";
import Joi from "joi-browser";
import Form from "./common/form";
import auth from "../services/authService";
import { toast } from "react-toastify";

class RegisterVerifyForm extends Form {
  state = {
    data: { otp: "", message: "", success: false },
    errors: {},
  };

  schema = {
    otp: Joi.string().required().label("Otp"),    
    message: Joi.string().allow('').optional(),
    success: Joi.boolean()
  };

  doSubmit = async () => {
    try {
      this.setState({data: {...this.state.data, success: false, message: ""}});
      const { data } = this.state;
      const response = await auth.verifyRegistrationOtp(data.otp);
      if (response && response.data && response.data.status == "pass") {
        auth.removeCookie('verify-token');
        this.setState({data: {...this.state.data, success: true, message: ""}});
        //window.location = "/login";
      } else {
        toast.error(response.data.message);
        this.setState({data: {...this.state.data, success: false, message: response.data.message}});
      }
    } catch (ex) {
      console.log("ex", ex);
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.email = ex.response.data;
        this.setState({ errors });
      }
      else{
        this.setState({data: {...this.state.data, success: false, message: ex.response.data.message}});
      }
    }
  };

  render() {
    //if (auth.getCurrentUser()) return <Redirect to="/" />;

    return (
      <div className="row justify-content-center">
        <div className="col-8">
          <h1>Verify your email address</h1>
          <form onSubmit={this.handleSubmit}>
            {this.renderInput("otp", "Please enter the OTP received on your registered email address for verification.", "text", "required")}
            {this.renderButton("verify OTP")}
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
              <p>
                Go to register page?{" "}
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

export default RegisterVerifyForm;
