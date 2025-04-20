const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "username"],
    minlength: 3,
    maxlength: 20,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email"],
    trim: true,
    lowercase: true,
    unique: true,
    minlength: 6,
    maxlength: 100,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: [true, "password"],
    minlength: 6,
    required: function () {
      return !this.googleId;
    },
  },
  role: {
    type: String,
    enum: ["customer", "store"],
    required: false,
  },
  introduction: {
    type: String,
    default: "", // 設置默認值為空字串
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// instance method
userSchema.methods.isCustomer = function () {
  return this.role == "customer";
};

userSchema.methods.isStore = function () {
  return this.role == "store";
};
userSchema.methods.comparePassword = async function (password, cb) {
  let result;
  try {
    result = await bcrypt.compare(password, this.password);
    return cb(null, result);
  } catch (e) {
    return cb(e, result);
  }
};

// if new user or password is modified, hash the password
userSchema.pre("save", async function (next) {
  if (this.password && (this.isNew || this.isModified("password"))) {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
  }
  next();
});
module.exports = mongoose.model("User", userSchema);
