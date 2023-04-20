import React, { Component } from "react";
import Joi from "joi-browser";
import Input from "./input";
import TextArea from "./textArea";
import Checkbox from "./checkbox";
//import Select from "./select";

class Form extends Component {
  state = {
    data: {},
    errors: {}
  };

  validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(this.state.data, this.schema, options);    
    if (!error) return null;
   
    const errors = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  validateProperty = ({ name, value }, data) => {    
    if (name === "confirmPassword" && data.password === data.confirmPassword) {
      return null;
    } else {
      const obj = { [name]: value };
      const schema = { [name]: this.schema[name] };
      const { error } = Joi.validate(obj, schema);
      return error ? error.details[0].message : null;
    }
  };

  handleSubmit = e => {
    e.preventDefault();

    const errors = this.validate();
    this.setState({ errors: errors || {} });
    if (errors) return;

    this.doSubmit();
  };

  handleChange = ({ currentTarget: input }) => {
    const previousState = {...this.state.data};
    const data = { ...this.state.data };
    //data[input.name] = input.value;
    if(input.type.toLowerCase() == 'checkbox'){
      data[input.name] = input.checked;
    }
    else
      data[input.name] = input.value;

    const errors = { ...this.state.errors };
    this.setState({ data : data, errors : errors});
    
    const errorMessage = this.validateProperty(input, data);
    if (errorMessage) {
      errors[input.name] = errorMessage;
      this.setState({ previousState, errors });
    }
    else delete errors[input.name];    
  };

  renderButton(label) {
    return (
      <button disabled={this.validate()} className="btn btn-primary">
        {label}
      </button>
    );
  }

  renderInput(name, label, type = "text", required) {
    const { data, errors } = this.state;

    return (
      <Input
        type={type}
        name={name}
        value={data[name]}
        label={label}
        onChange={this.handleChange}
        error={errors[name]}
        required={required}
      />
    );
  }

  renderTextArea(name, label, required) {
    const { data, errors } = this.state;

    return (
      <TextArea        
        name={name}
        value={data[name]}
        label={label}
        onChange={this.handleChange}
        error={errors[name]}
        required={required}
      />
    );
  }

  renderCheckbox(name, label, required) {
    const { data, errors } = this.state;

    return (
      <Checkbox        
        name={name}
        checked={data[name]}
        value={data[name]}
        label={label}
        onChange={this.handleChange}
        error={errors[name]}
        required={required}
      />
    );
  }
}

export default Form;
