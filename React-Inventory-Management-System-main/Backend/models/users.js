const mongoose = require('mongoose');
const { ROLES } = require("../constants/workflow");

const UserSchema = new mongoose.Schema({
    firstName: 'String',
    lastName : 'String',
    email: 'String',
    password: 'String',
    phoneNumber: 'Number',
    imageUrl: 'String',
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.DIRECTOR,
    },
    designerGroup: {
      type: String,
      default: "",
    },
});

const User = mongoose.model("users", UserSchema);
module.exports = User;