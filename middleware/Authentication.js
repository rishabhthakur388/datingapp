const jwt = require("jsonwebtoken");
const { users} = require("../models/index");
const resp = require('../helper/response');

exports.users = async (req, res, next) => {
    const jwtSecretKey = process.env.key;
    try {
        if (!req.headers.authorization) {
            return resp.failedResponseWithMsg(res, "unauthorized");
        }
        let checkBearer = req.headers.authorization.split(" ")[0];
        if(checkBearer == 'Bearer') {
            return resp.failedResponseWithMsg(res, "unauthorized");
        }
        const token = req.headers.authorization.split(" ")[1];
        console.log(token);
        const verify = jwt.verify(token, jwtSecretKey);
        const verified = await users.findOne({ where: { id: verify.id } });
        if (!verified) {
            return resp.failedResponseWithMsg(res, "USER_NOT_FOUND");
        };
        req.currentUser = verified;
        next();
    } catch (error) {
        return resp.failedResponseWithMsg(res, error.message);
    };
};