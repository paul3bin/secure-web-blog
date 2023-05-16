import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import auth from "../services/authService";
import { toast } from "react-toastify";

class LoginVerifyForm extends Form {
  state = {
    data: { otp: "" },
    errors: {},
  };

  //otp is the only required field on this form
  schema = {
    otp: Joi.string().required().label("Otp"),
  };

  doSubmit = async () => {
    try {
      const { data } = this.state;
      //encode otp
      const response = await auth.verifyLoginOtp(encodeURIComponent(data.otp));
      if (response && response.data && response.data.status === "pass") {
        window.location = "/posts";
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
          <h1>Verify Login</h1>
          <form onSubmit={this.handleSubmit}>
            {this.renderInput("otp", "Enter Otp", "text", "required")}
            {this.renderButton("Verify OTP")}
            <div className="m-t-10">
              <p>
                Go to login page?{" "}
                <a href="/login" className="text-underline">
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

export default LoginVerifyForm;
