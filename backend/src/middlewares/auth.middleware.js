const jwt = require('../config/jwt');
const User = require('../database/models/User');
const { error } = require('../utils/response');

const protect = async (req, res, next) => {
    try {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return error(res, 'Not authorized, no token', 401);
        }

        const decoded = jwt.verifyToken(token);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return error(res, 'Not authorized, user not found', 401);
        }

        if (!user.isActive) {
            return error(res, 'User account is deactivated', 403);
        }

        req.user = user;
        next();
    } catch (err) {
        return error(res, 'Not authorized, token failed', 401);
    }
};

module.exports = { protect };
