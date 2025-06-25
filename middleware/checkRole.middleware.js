const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role === requiredRole) {
      return next(); // important to return here
    }
    return res.status(403).json({
      message: "You are not authorised for this request. Only admin can do that.",
    });
  };
};

module.exports = checkRole