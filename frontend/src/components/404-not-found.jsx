import React from "react";

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
