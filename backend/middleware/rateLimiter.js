const { rateLimit } = require("express-rate-limit");

const windowMs = 15 * 60 * 1000;

const apiLimiter = rateLimit({
  windowMs,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: true,
  message: { message: "Too many requests from this IP, please try again after 15 minutes." }
});

const authLimiter = rateLimit({
  windowMs,
  limit: 17,
  standardHeaders: true,
  legacyHeaders: true,
  message: { message: "Too many authentication attempts, please try again after 15 minutes." }
});

module.exports = {
  apiLimiter,
  authLimiter
};
