class ApiError {
  constructor(statusCode, message = "Something Went Wrong", success = false) {
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
  }
}
export { ApiError };
