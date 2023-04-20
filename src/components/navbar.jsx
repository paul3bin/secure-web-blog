import React from "react";
import { Link, NavLink } from "react-router-dom";
import auth from "../services/authService";

const NavBar = ({ user }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-custom">
        <div className="container-fluid">
            <Link className="navbar-brand" to="/posts">
                Blog
            </Link>
            <button
                className="navbar-toggler"
                type="button"
                data-toggle="collapse"
                data-target="#navbarNavAltMarkup"
                aria-controls="navbarNavAltMarkup"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span className="navbar-toggler-icon" />
            </button>
            <div className="d-flex">           
                <div className= "collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav">
                    <NavLink className="nav-item nav-link" to="/posts">
                        Posts
                    </NavLink>    
                    {!user && (
                        <React.Fragment>
                        <NavLink className="nav-item nav-link" to="/login">
                            Login
                        </NavLink>
                        <NavLink className="nav-item nav-link" to="/register">
                            Register
                        </NavLink>
                        </React.Fragment>
                    )}
                    {user && (
                        <React.Fragment>                            
                            <p className="nav-item nav-link">
                                {user.name}
                            </p>                            
                            <NavLink className="nav-item nav-link" to="" onClick={()=>{
                                console.log('logout click');
                                auth.logout();
                                window.location = "/login";

                            }}>
                                Logout
                            </NavLink>
                        </React.Fragment>
                    )}
                    </div> 
                </div>
            </div>
        </div>
    </nav>
  );
};

export default NavBar;
