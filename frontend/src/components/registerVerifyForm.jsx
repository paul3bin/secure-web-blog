import React from "react";
import { Redirect } from "react-router-dom";
import Joi from "joi-browser";
import Form from "./common/form";
import auth from "../services/authService";
import { toast } from "react-toastify";

class RegisterVerifyForm extends Form {
  state = {
    data: { otp: "" },
    errors: {},
  };

  schema = {
    otp: Joi.string().required().label("Otp"),
  };

  doSubmit = async () => {
    try {
      const { data } = this.state;
      const response = await auth.verifyRegistrationOtp(data.otp);
      if (response && response.data && response.data.status == "pass") {
        auth.removeCookie('verify-token');
        window.location = "/login";
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
          <h1>Verify your email address</h1>
          <form onSubmit={this.handleSubmit}>
            {this.renderInput("otp", "Please enter the OTP received on your registered email address for verification.", "text", "required")}
            {this.renderButton("verify OTP")}
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
