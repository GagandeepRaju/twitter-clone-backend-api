const express = require("express");
const homepage = require("../routes/homepage");
const user = require("../routes/user");
const auth = require("../routes/auth");

module.exports = function(app) {
  app.use(express.json());
  app.use("/uploads", express.static("uploads"));
  app.use("/api/homepage", homepage);
  app.use("/api/user", user);
  app.use("/api/auth", auth);
};
