/**
 * Centralized Error Handling & 404 Handler Middleware
 */

function notFoundHandler(req, res, next) {
    res.status(404).json({
        success: false,
        message: `Endpoint not found: ${req.method} ${req.originalUrl}`
    });
}

function errorHandler(err, req, res, next) {
    console.error('Unhandled Application Error:', err);

    const status = err.status || 500;
    const message = err.message || 'Internal server error occurred.';

    res.status(status).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
}

module.exports = {
    notFoundHandler,
    errorHandler
};
