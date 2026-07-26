const { rateLimit } = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  limit: 100, 
  standardHeaders: true,
  legacyHeaders: true, 
  message: {
    message: "Too many requests from this IP, please try again after 15 minutes."
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  limit: 15,
  standardHeaders: true, 
  legacyHeaders: true, 
  message: {
    message: "Too many authentication attempts, please try again after 15 minutes."
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};
