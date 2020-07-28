const winston = require("winston");
const mongoose = require("mongoose");
const config = require("config");

//for mongoose
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

module.exports = function() {
  const db = config.get("db");
  mongoose.connect(db).then(() => console.log(`Connected to ${db}`));
};
