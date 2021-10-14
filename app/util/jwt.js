const jwt = require("jsonwebtoken");
const JWT_SIGNATURE = process.env.JWT_SIGNATURE; //process.env.JWT_SIGNATURE

/**
 * Sign the payload to a token
 * @param {string | Buffer | object} payload 
 */
function sign(payload){
    return jwt.sign(payload, JWT_SIGNATURE , {
        expiresIn: "24h",
    });
}

/**
 * Verify given token to get a decoded token
 * @param token - JWT string to verify
 */
function verify(token) {
    return jwt.verify(token, JWT_SIGNATURE);
}

module.exports = {
    sign,
    verify
}