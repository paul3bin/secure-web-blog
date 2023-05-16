import React from "react";
//custom input control
const Input = ({ name, label, error, required, ...rest }) => {
  return (
    <div className="form-group">
      <label htmlFor={name} className = {required}>{label}</label>
      <input {...rest} name={name} id={name} className="form-control" />
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
};

export default Input;
