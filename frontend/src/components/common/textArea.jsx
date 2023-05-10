import React from "react";

const TextArea = ({ name, label, error, required, ...rest }) => {
  return (    
    <div className="form-group">
        <label htmlFor={name} className = {required}>{label}</label>
        <textarea {...rest} name={name} id={name} className="form-control" style={{height:"150px"}}></textarea>
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
};

export default TextArea;
