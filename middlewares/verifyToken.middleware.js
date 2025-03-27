import jwt from "jsonwebtoken";
import { ApiError } from "../services/ApiError.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token)
    return res
      .status(401)
      .json(new ApiError(401, "UnAuthorized - No Token Provided."));

  try {
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodeToken) {
      return res
        .status(401)
        .json(new ApiError(401, "UnAuthorized - Invalid Token."));
    }

    req.userId = decodeToken.userId;
    next();
  } catch (error) {
    console.log("Error in Validating Token", error);
    return res.status(500).json(new ApiError(500, "Error in Validating Token"));
  }
};
