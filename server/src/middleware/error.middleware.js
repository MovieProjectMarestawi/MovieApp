/*
    error middleware for Handling all errors
*/

export const errorHandler = (err, req, res, next) => {
    console.error('Error: ', err)

    if (err.code === '23505') {
        // Resouce exists
        return res.status(409).json({
            success: false,
            message: 'Resource already exists',
            error: err.detail || err.message,
        })
    }

    if (err.code === '23503') {
        // Foreign key constraint violation
        return res.status(400).json({
            success: false,
            message: 'Invalid reference. Related resource does not exist.',
            error: err.detail || err.message,
        })
    }

    // Validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            error: err.message,
        })
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
        })
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired',
        })
    }

    // Default error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    })
}

// 404 Not Found 
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    })
}
