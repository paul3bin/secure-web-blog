// Code References :
// - https://www.digitalocean.com/community/tutorials/how-to-secure-node-js-applications-with-a-content-security-policy

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const userRouter = require("./routes/user.router");
const blogRouter = require("./routes/blog.router");
const redis = require("redis");
const PORT = process.env.DSS_PORT || 8085;

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use("/user", userRouter);
app.use("/blog", blogRouter);
app.set("trust proxy", true);

// //Use this to parse cookies.
// app.use((req, res, next) => {
//   const cookies = req.headers.cookie;
//   if (cookies) {
//     const parsedCookies = {};
//     cookies.split(";").forEach((cookie) => {
//       const parts = cookie.split("=");
//       const key = parts[0].trim();
//       const value = parts[1].trim();
//       parsedCookies[key] = value;
//     });
//     req.cookies = parsedCookies;
//   }
//   next();
// });

/* Error handler middleware */
app.use((err, req, res, next) => {
  //console.log("Internal server error");
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  return res.status(statusCode).json({ message: "internal server error" });
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; font-src 'self'; img-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'self';  style-src 'self'; frame-src 'self';"
  );
  next();
});

app.listen(8085, () => console.log("Server running  on port ", PORT));

module.exports = app;
