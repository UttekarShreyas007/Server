const jwt = require('jsonwebtoken');
const User = require('../models/User');

const skipAuth = ['/api/auth/login', '/api/auth/signup', '/api/properties'];

const checkSkipAuth = (req, res, next) => {
  
  if (skipAuth.includes(req.originalUrl)) {
    return true;
  }
  return false;
};

const authMiddleware = async (req, res, next) => {
  if (checkSkipAuth(req, res, next)) {
    next();
  } else {
    try {
      // Check if token exists in the request header
      const token = req.header('Authorization').replace('Bearer ', '');
      console.log(token, 'token')
      if (!token) {
        throw new Error('Invalid token');
      }

      // Verify the token and extract the user ID
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET); 
      console.log(decodedToken, 'dtoken')
      const userId = decodedToken.userId;
      console.log(userId, 'userID')
      // Check if user exists in the database
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      console.log(user, 'user')
      // Set the user ID in the request object
      req.userId = userId;

     
      // Call the next middleware function
      next();
    } catch (error) {
      console.log(error, 'err')
      res
        .status(401)
        .json({ message: 'Authorization failed', error: error.message });
    }
  }
};

module.exports = authMiddleware;