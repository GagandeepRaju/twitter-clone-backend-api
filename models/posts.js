const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  text: { type: String, required: "Name is required" },
  photo: { type: String },
  comments: [
    {
      text: String,
      created: { type: Date, default: Date.now },
      postedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
      }
    }
  ],
  likes: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  postedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  },
  created: { type: Date, default: Date.now }
});

const Posts = mongoose.model("Posts", PostSchema);

exports.Posts = Posts;
