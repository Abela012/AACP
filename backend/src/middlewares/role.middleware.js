const { error } = require('../utils/response');

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return error(
                res,
                `User role ${req.user.role} is not authorized to access this route`,
                403
            );
        }
        next();
    };
};

module.exports = { authorize };
