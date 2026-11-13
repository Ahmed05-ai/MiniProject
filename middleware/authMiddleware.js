/**
 * Role-Based Access Control (RBAC) & JWT Authentication Middleware
 */

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'smart_campus_jwt_secret_key_2026';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
        }
        req.user = user;
        next();
    });
}

function requireRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        if (!allowedRoles.includes(req.user.role) && req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: `Access denied. Role '${req.user.role}' lacks permission for this resource.`
            });
        }
        next();
    };
}

module.exports = {
    authenticateToken,
    requireRoles
};
