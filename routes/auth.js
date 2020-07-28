const Joi = require("@hapi/joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, genToken } = require("../models/user");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  const validPassword = await bcrypt.compare(
    req.body.password,
    user.hashed_password
  );

  if (!validPassword) return res.status(400).send("Invalid email or password.");

  const token = genToken(_.pick(user, ["_id", "name", "email"]));
  res.send(token);
});

function validateUser(user) {
  const schema = Joi.object({
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required()
  });
  const result = schema.validate(user);
  return result;
}

module.exports = router;
