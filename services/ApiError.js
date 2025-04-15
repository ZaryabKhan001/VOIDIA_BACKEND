class ApiError {
  constructor(statusCode, errors = "Something Went Wrong", success = false) {
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
  }
}
export { ApiError };
