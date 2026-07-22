/**
 * In-memory API Rate Limiter Middleware
 * Protects endpoints against brute-force and excessive requests without external dependencies.
 */
const createRateLimiter = ({
  windowMs = 15 * 60 * 1000, // 15 minutes
  max = 100,                  // limit each IP to 100 requests per windowMs
  message = "Too many requests from this IP, please try again later."
} = {}) => {
  const requests = new Map();

  // Periodic cleanup every 5 minutes to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of requests.entries()) {
      if (now > data.resetTime) {
        requests.delete(ip);
      }
    }
  }, 5 * 60 * 1000);

  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    const ip =
      req.ip ||
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress ||
      "127.0.0.1";
    const now = Date.now();

    if (!requests.has(ip)) {
      requests.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
    } else {
      const data = requests.get(ip);

      if (now > data.resetTime) {
        data.count = 1;
        data.resetTime = now + windowMs;
      } else {
        data.count += 1;
      }
    }

    const currentData = requests.get(ip);
    const remaining = Math.max(0, max - currentData.count);
    const resetSeconds = Math.ceil((currentData.resetTime - now) / 1000);

    // Set standard HTTP rate limiting headers
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", resetSeconds);

    if (currentData.count > max) {
      res.setHeader("Retry-After", resetSeconds);
      return res.status(429).json({
        message,
        retryAfterSeconds: resetSeconds
      });
    }

    next();
  };
};

// General rate limiter for standard API routes (100 requests / 15 minutes)
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes."
});

// Strict rate limiter for sensitive authentication endpoints (15 requests / 15 minutes)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: "Too many authentication attempts, please try again after 15 minutes."
});

module.exports = {
  createRateLimiter,
  apiLimiter,
  authLimiter
};
