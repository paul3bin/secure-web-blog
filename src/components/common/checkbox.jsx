import React from "react";

const Checkbox = ({ name, label, error, required, ...rest }) => {
  return (    
    <div className="form-check form-group">
        <input {...rest} className="form-check-input" type="checkbox" name={name} id={name} style={{height: "17px", width:"17px"}}/>
        <label className="form-check-label" htmlFor={name}> {label}</label>
        {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
};

export default Checkbox;
