// Middleware to handle 404 Not Found errors for invalid API endpoints
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global Centralized Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";
  let errors = null;

  // Mongoose Invalid ObjectId Cast Error
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = `Resource not found with id of ${err.value}`;
  }

  // MongoDB Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const duplicatedField = err.keyValue ? Object.keys(err.keyValue)[0] : "field";
    const duplicatedValue = err.keyValue ? Object.values(err.keyValue)[0] : "";
    message = `Duplicate ${duplicatedField} '${duplicatedValue}' entered. Please use another value.`;
  }

  // Mongoose Schema Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    errors = Object.values(err.errors).map((val) => val.message);
    message = errors.join(", ");
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Not authorized, invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Not authorized, token expired";
  }

  // Log error details in development
  if (process.env.NODE_ENV !== "production") {
    console.error(`[Error Handler] ${statusCode} - ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
