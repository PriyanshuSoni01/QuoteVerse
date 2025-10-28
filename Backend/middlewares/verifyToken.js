import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  // 1. Get token from headers
  const token = req.headers.authorization?.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authorization token is required",
    });
  }

  // 2. Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // 3. Attach the decoded user ID to the request
    req.user = { userId: decoded.userId }; // Critical: Ensure `userId` exists in the token
    next(); // Proceed to the controller
  });
};

export default verifyToken;