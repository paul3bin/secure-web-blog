import React from "react";
//Page Not Found is displayed for unavailable routes. Link is provided to go back to the posts page
const PageNotFound = () => {
    return (
        <div className="row justify-content-center">
          <div className="col-8">
            <h1>404 - Page Not Found</h1>
                <div className="m-t-10">
                    <p>
                        <a href="/posts" className="text-underline">
                            Click here
                        </a> to view the posts
                    </p>
                </div>
          </div>
        </div>
      );
};

export default PageNotFound;
