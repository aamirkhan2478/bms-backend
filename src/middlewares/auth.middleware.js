import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  // Get the token from the request headers
  const authorizationHeader = req.headers.authorization;
  const tokenInCookies = req.cookies.token;
  
  if (!authorizationHeader && !tokenInCookies) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Extract the token from the Authorization header
  const [bearer, token] = authorizationHeader.split(" ");

  if (bearer !== "Bearer" || !token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Attach the decoded user information to the request object
    req.user = decoded;

    // Call the next middleware or route handler
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default auth;
