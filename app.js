const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const userRouter = require("./routes/user.router");
const blogRouter = require("./routes/blog.router");

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use("/user", userRouter);
app.use("/blog", blogRouter);

app.set("trust proxy", true);

/* Error handler middleware */
app.use((err, req, res, next) => {
  console.log("inside internal server error");
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
  next();
});

app.listen(process.env.DSS_PORT, () =>
  console.log("Server running  on port ", process.env.DSS_PORT)
);
