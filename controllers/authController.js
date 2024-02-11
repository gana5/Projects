const crypto = require('crypto');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');

// since the values are same as the properties names
// this style is called object destructuring and it is preferred
exports.signup = async (req, res, next) => {
  const { name, email, password, passwordConfirmation } = req.body;
  try {
    const newUser = await User.create({
      name,
      email,
      password,
      passwordConfirmation
    });
    //and then send the token
    createSendToken(newUser, 201, res);// this is called Authorization
  } catch (error) {
    res.status(400).render('./login/registerForm', {
      errorCode: 400,
      errorMessage: error.message
    });
  }
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined; // very important
  res.render( './login/authorizationSuccess', { user: user, token: token});
};
// sign token
const signToken = id => {
  // document reference https://www.npmjs.com/package/jsonwebtoken
  try {
    const jwtToken = jwt.sign({ id }, process.env.JWT_SECRET, {
      //noTimestamp:true,
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    console.log;
    return jwtToken;
  } catch (error) {
     res.render('./users/login', { title: 'Login', user: undefined, token: undefined });
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and password exist
  if (!email || !password) {

    // the get verb does not send the body. so there is no body object
    res.status(401).render('./login/loginForm', { 
      errorCode: 401,
      errorMessage: 'Please provide email and password!'
    });
    return
   
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.isPasswordMatch(password, user.password))) {
    res.status(401).render('appError', {
      errorCode: 401,
      errorMessage: 'Incorrect email and password!'
    });
  }

  // 3) If everything ok, send token to client
  try {
    createSendToken(user, 200, res);
  }catch(error){
    res.status(401).render('./login/loginForm', {
      errorCode: 401,
      errorMessage: 'Incorrect email and password!'
    });
  }
  
};

exports.protect = async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).render('appError', {
      errorCode: 401,
      errorMessage: 'You are not logged in! Please log in to get access'
    });
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {

    res.status(401).render('appError', {
      errorCode: 401,
      errorMessage: 'The user belonging to this token does no longer exist'
    });
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  // the current user information is passed to the next middleware
  req.user = currentUser;
  next();
};



