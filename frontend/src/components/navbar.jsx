import React from "react";
import { Link, NavLink } from "react-router-dom";
import auth from "../services/authService";

const NavBar = ({ user }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="d-flex flex-grow-1">
            {/* <a className="navbar-brand d-lg-inline-block" href="#">
                Blog
            </a> */}
            <Link className="navbar-brand d-lg-inline-block" to="/posts">
                Blog
            </Link>
            <div className="w-100 text-right">
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#myNavbar" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
            </div>
        </div>
        <div className="collapse navbar-collapse flex-grow-1 text-right" id="myNavbar">
            <ul className="navbar-nav ml-auto flex-nowrap">
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
                        <NavLink className="nav-item nav-link" to="" onClick={async ()=>{
                            console.log('logout click');
                            await auth.logout();
                            window.location = "/login";

                        }}>
                            Logout
                        </NavLink>
                    </React.Fragment>
                )}
            </ul>
        </div>
    </nav>



    // <nav className="navbar navbar-expand-lg navbar-light bg-custom">
    //     <div className="container-fluid">
    //         <Link className="navbar-brand" to="/posts">
    //             Blog
    //         </Link>
           
    //         <div className="d-flex">       
    //             <button
    //                 className="navbar-toggler"
    //                 type="button"
    //                 data-toggle="collapse"
    //                 data-target="#navbarNavAltMarkup"
    //                 aria-controls="navbarNavAltMarkup"
    //                 aria-expanded="false"
    //                 aria-label="Toggle navigation"
    //             >
    //                 <span className="navbar-toggler-icon" />
    //             </button>    
    //             <div className= "collapse navbar-collapse" id="navbarNavAltMarkup">
    //                 <div className="navbar-nav">
    //                 {user && (<NavLink className="nav-item nav-link" to="/my-posts">
    //                     My Posts
    //                 </NavLink>
    //                 )}
    //                 <NavLink className="nav-item nav-link" to="/posts">
    //                     Posts
    //                 </NavLink>    
    //                 {!user && (
    //                     <React.Fragment>
    //                     <NavLink className="nav-item nav-link" to="/login">
    //                         Login
    //                     </NavLink>
    //                     <NavLink className="nav-item nav-link" to="/register">
    //                         Register
    //                     </NavLink>
    //                     </React.Fragment>
    //                 )}
    //                 {user && (
    //                     <React.Fragment>                            
    //                         <p className="nav-item nav-link">
    //                             {user.name}
    //                         </p>                            
    //                         <NavLink className="nav-item nav-link" to="" onClick={async ()=>{
    //                             console.log('logout click');
    //                             await auth.logout();
    //                             window.location = "/login";

    //                         }}>
    //                             Logout
    //                         </NavLink>
    //                     </React.Fragment>
    //                 )}
    //                 </div> 
    //             </div>
    //         </div>
    //     </div>
    // </nav>
  );
};

export default NavBar;
