class AppError extends Error {
  constructor(message, statuscode) {
    super(message);
    this.statusCode = statuscode;
    this.status = `${statuscode}`.startsWith(4) ? "Fail" : "Error";
    this.isoperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
