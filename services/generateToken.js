import pkg from "jsonwebtoken";
const { sign } = pkg;

export const generateToken = (userId) => {
  const token = sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  return token;
};
