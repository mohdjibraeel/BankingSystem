const mongoose = require("mongoose");
const bcrypt=require("bcryptjs");
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is reuired"],
      trim: true,
      lowercase: true,
      match: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "invalid email address"],
      unique: [true, "Email already exist"],
    },
    name: {
      type: String,
      required: [true, "Name is required to creating account"],
    },
    password: {
      type: String,
      required: [true, "Password required"],
      minlenght: [6, "Password should be 6 char long"],
      select: false,
    },
    systemUser:{
      type:Boolean,
      default:false,
      immutable:true,
      select:false,
    }
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return ;
  }

  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  return ;
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userModel=mongoose.model("user",userSchema);
module.exports=userModel;