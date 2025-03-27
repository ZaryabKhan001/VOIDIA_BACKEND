import pkg from "jsonwebtoken";
const { sign } = pkg;

export const generateTokenAndSetCookie = (res, userId) => {
  const token = sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: isProduction ? "None" : "Lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};
