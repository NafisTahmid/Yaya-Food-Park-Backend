import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({});

const isAuthenticated = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token available", success: false });
    }

    const token = authHeader.split(" ")[1];

    const decodedToken = jsonwebtoken.verify(token, process.env.JWT_SECRET);

    if (!decodedToken) {
      return res.status(401).json({ message: "Invalid token", success: false });
    }

    req.id = decodedToken.id;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

export default isAuthenticated;
