const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      }
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('Password cannot contain "password"');
        }
      }
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be a postive number");
        }
      }
    },
    avatar: {
      type: Buffer
    },
    tokens: [
      {
        token: { type: String, require: true }
      }
    ]
  },
  {
    timestamps: true
  }
);

userSchema.methods.genAuthToken = async function() {
  let user = this;
  let token = await jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_SECURE_KEY
  );
  user.tokens = user.tokens.concat({ token });
  await user.save();
  // console.log("Gen Auth Token: ", token);
  return token;
};

userSchema.methods.toJSON = function() {
  let user = this;
  userObj = user.toObject();

  delete userObj.password;
  delete userObj.tokens;
  delete userObj.avatar;
  return userObj;
};

userSchema.statics.findByCredential = async (email, password) => {
  let user = await User.findOne({ email });
  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner"
});

userSchema.pre("save", async function(next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

userSchema.pre("remove", async function(next) {
  let user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
