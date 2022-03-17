const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");

module.exports = (req,res,next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        // const token = req.cookies
        console.log(token);
        const decoded = jwt.verify(token, "healthchain");
        req.userData = decoded;
        let id = decoded._id;
        req.id = id;
        next();
    } catch(error) {
        res.status(401).json({
            message : "auth failed",
            error : error.message
        })
    }
}