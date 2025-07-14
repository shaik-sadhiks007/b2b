const adminMiddleware = (req, res, next) => {
    try {
        // Check if user exists and has admin role
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'User not authenticated' 
            });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Access denied. Admin privileges required.' 
            });
        }

        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
};

module.exports = adminMiddleware; 