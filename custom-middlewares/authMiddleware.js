const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id  || decodedToken._id;
        const authenticatedUser = await User.findById(userId);
        
        if (!authenticatedUser) {
            res.render(`./login/loginForm`, {title:" You are redirected as you are not Authenticated", user:undefined}); // the root view folder is views
        } else {
            req.user = authenticatedUser;
            next();
        }
    } catch {
        // however, we need to redirect to the login page in this case as we have a UI implemented in production
        res.render(`./login/loginForm`, {title:" You are redirected as you are not Authenticated", user:undefined}); // the root view folder is views

    }
};

const authorize = async (req, res, next) =>{
    const currentUser = req.user;
    const userRole = currentUser.role;
    if(userRole){
        next();
    } else {
        res.status(403).json({ message: 'Forbidden' });
    }
};
async function fetchUserById(userId) {
    try {
        const user = await User.findById(userId);
        if (user) {
            console.log('Found user:', user);
        } else {
            console.log('No user found with the provided ID.');
        }
    } catch (error) {
        console.error('Error fetching user:', error);
    }
}
module.exports = { authenticate, authorize };
