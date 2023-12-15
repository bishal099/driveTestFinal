export const isAuthenticatedUser = (req, res, next) => {
    if (req.session.user_id && req.session.user_UserType === 'Driver') {
        return next();
    } else {
        res.redirect('/login');
    }
}

export const isAdminUser = (req, res, next) => {
    if (req.session.user_id && req.session.user_UserType === 'Admin') {
        return next();
    } else {
        res.redirect('/login');
    }
};

export const isExaminerUser = (req, res, next) => {
    if (req.session.user_id && req.session.user_UserType === 'Examiner') {
        return next();
    } else {
        res.redirect('/login');
    }
};