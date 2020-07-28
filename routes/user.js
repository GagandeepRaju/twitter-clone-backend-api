const bcrypt = require("bcrypt");
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const { User, validation, genToken } = require("../models/user");
const validateObjId = require("../middleware/validateObjectId");
const formidable = require("formidable");
const fs = require("fs");

//creating new user account
router.post("/", async (req, res) => {
  const { error } = validation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already Registered!");
  try {
    user = new User(_.pick(req.body, ["name", "email"]));
    const salt = await bcrypt.genSalt(10);
    user.hashed_password = await bcrypt.hash(req.body.password, salt);
    user.about = "";
    await user.save();
    const token = genToken(_.pick(user, ["_id", "name", "email"]));
    res
      .header("x-auth-token", token)
      .header("acess-control-expose-headers", "x-auth-token")
      .send(_.pick(user, ["_id", "name", "email"]));
  } catch (ex) {
    res.status(400).send(ex);
  }
});

//Edit profile get request
router.get("/:userid", [validateObjId], async (req, res) => {
  //
  const userId = req.params.userid;
  const user = await User.findById(userId);

  res.status(200).send(user);
});

//get profile photo
router.get("/photo/:userid", [validateObjId],async (req, res) => {
//
  const userid = req.params.userid;
  try {
      const profile = await User.findById(userid);
    if(profile.photo){
      res.set("Content-Type", profile.photo.contentType);
      res.status(200).send(profile.photo.data);
    }
  } catch (e) {
      res.status(400).send("Unexpected error occured");
  }

})

//following users info
router.get("/profile/:userid", [validateObjId], async (req, res) => {
  //
  const userid = req.params.userid;

  let user = await User.findById({ _id: req.params.userid }).populate('following', '_id name email').populate('followers', '_id name email');

  if (!user) return res.status(400).send("Can't find user in the database.");

  res.status(200).send(user);


})


//edit profile update put request
router.put("/editprofile/:userid", async (req, res) => {
  //
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Photo could not be uploaded"
      });
    }
    let user = await User.findOne({_id: req.params.userid});
    user = _.extend(user, fields);
    user.updated = Date.now();
   if (files.photo) {
     user.photo.data = fs.readFileSync(files.photo.path);
     user.photo.contentType = files.photo.type;
   }
    user.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler.getErrorMessage(err)
        });
      }
      user.hashed_password = undefined;
      user.salt = undefined;
      res.json(user);
    });
  });
});

router.delete("/:userid", [validateObjId], async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.userid);

  if (!user) return res.status(404).send("Cannot find the User");

  res.status(200).send(user);
});

module.exports = router;
