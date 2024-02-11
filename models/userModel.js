
const mongoose = require('mongoose');
// import bcryptjs
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true
  },
  photo: String,
  role: {
    type: String,
    enum: ['client', 'staff', 'student', 'admin'],
    default: 'client'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  // validate password
  passwordConfirmation: {
    type: String,
    required: [true, 'Please confirm your password'],
    // validate will only work on save or creating the user
    validate:{
        validator: function(pwd){
          return pwd === this.password;
        },
        message: " the password confirmation did not match"
    }
  },
  passwordChangedAt: Date,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  roles:{
    type: String,
    default:'client'// authorization
  }
});

// add encrypting the password middleware
userSchema.pre('save', async function(next){
  if(!this.isModified('password')){
    return next;
  }
  // if new and modified
  // npm install bcryptjs
  this.password = await bcrypt.hash(this.password, 12); // how intensive the CPU will be
  this.passwordConfirmation = undefined; // we dop not want to store in database
  next();
});
//model instance method will be available to all the instance of the user.
userSchema.methods.isPasswordMatch = async (userSuppliedPassword, currentHashedPasswordInDB)=>{
  return await bcrypt.compare(userSuppliedPassword, currentHashedPasswordInDB)
}
const User = mongoose.model('User', userSchema);

module.exports = User;
