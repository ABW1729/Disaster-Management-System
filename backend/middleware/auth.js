function authenticate(req, res, next) {
  const sessionId = req.cookies.sessionId;
  if (!sessionId || !sessions[sessionId]) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  req.user = sessions[sessionId];
  next();
}

function authorize(requiredRole) {
  return (req, res, next) => {
    if (!req.user) return res.status(403).json({ error: 'Unauthorized' });
    if (req.user.role !== requiredRole)
      return res.status(403).json({ error: 'Forbidden: Insufficient role' });
    next();
  };
}
