const app = require("../app");
const chai = require("chai");
const chaiHttp = require("chai-http");
const { response } = require("express");
const { describe } = require("mocha");
const { PreparedStatement: PS } = require("pg-promise");
const db = require("../services/db.service");
const auth = require("../utils/auth");
const { faker } = require("@faker-js/faker");

chai.should();
chai.use(chaiHttp);

describe("Blog APIs", () => {
  describe("Test get Blog Posts", () => {
    it("GET Blog", (done) => {
      chai
        .request(app)
        .get("/blog/v1/")
        .end((error, response) => {
          response.should.have.status(200);
          response.should.be.a("object");
          response.body.status.should.equal("pass");
          response.body.result.should.be.a("array");
          done();
        });
    });
  });
});

describe("Auth APIs", () => {
  const email = faker.internet.email();
  describe("Test Register API", () => {
    it("REGISTER", (done) => {
      chai
        .request(app)
        .post("/user/v1/signup")
        .send({
          email: email,
          password: "testpassword@123S",
          phone_number: "0000000000",
          name: "DareDevil",
        })
        .end((error, response) => {
          response.should.have.status(200);
          response.body.status.should.equal("pass");
          response.body.message.should.equal("User created succesfully");
          done();
        });
    }).timeout(5000);
  });

  describe("Test Register API", () => {
    it("LOGIN", (done) => {
      chai
        .request(app)
        .post("/user/v1/signin")
        .send({
          email: "testemail@example.com",
          password: "testpassword@123S",
        })
        .end((error, response) => {
          response.should.have.status(200);
          response.body.status.should.equal("pass");
          response.body.should.have.property("token");
          response.should.have.header("x-csrf-token");
          done();
        });
    }).timeout(5000);
  });
});
