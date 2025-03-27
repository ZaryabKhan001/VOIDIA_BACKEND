import pkg from "jsonwebtoken";
const { sign } = pkg;

export const generateTokenAndSetCookie = (res, userId) => {
  const token = sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "None",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
};
