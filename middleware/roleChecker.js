module.exports = function (allowedRoles) {
  return (req, res, next) => {
    try {
      // Ensure req.user exists and contains a valid userType
      if (!req.user || !req.user.userType) {
        return res.status(401).json({ error: 'User not authenticated or userType missing' });
      }

      // Check if the user's userType is in the allowed roles
      if (!allowedRoles.includes(req.user.userType)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      next(); // User has a valid role, proceed
    } catch (error) {
      next(error);
    }
  };
};
