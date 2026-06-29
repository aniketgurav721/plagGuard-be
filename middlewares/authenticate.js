const jwt = require("jsonwebtoken");
const log = require("../config/log");

/**
 * Express middleware that validates JWT Bearer tokens.
 * Attaches decoded user payload to req.user on success.
 * @param {import("express").Request} req - Express request.
 * @param {import("express").Response} res - Express response.
 * @param {import("express").NextFunction} next - Express next function.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    log.warn("Unauthorized request without Bearer token.", {
      path: req.originalUrl,
      method: req.method,
    });
    return res.status(401).json({ error: "Unauthorized." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    log.debug("JWT token verified successfully.", { userId: decoded.userId });
    next();
  } catch (error) {
    log.warn("Invalid JWT token.", { error: error.message });
    res.status(401).json({ error: "Invalid token." });
  }
};

module.exports = authenticate;
