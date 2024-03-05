const resp = require("../helper/response");
const CONSTANT = require("../constants/constants");
const MSG = require("../messages/messages");
const db = require("../models/index");
const USERS = db.users;
const USERS_PREFERENCES = db.users_preferences;;
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { body, validationResult } = require('express-validator');
const ejs = require('ejs');
const nodemailer = require('nodemailer');

//////////////////////////////////////////sign Up///////////////////////////////////////////////
exports.signUp = async (req, res) => {
    try {
        console.log(req.body)
        let { email, username, phone_number, age, address, gender, birthday, profile_picture, latitude, longitude } = req.body;
        const reqBody = req.body;
        const findUser = await USERS.findOne({
            where: {
                email,
            }
        });
        if (findUser) { return resp.failedResponseWithMsg(res, MSG.ALREADY_EXISTS) };
        const hassedpassword = await bcrypt.hash(reqBody.password, 10);
        const createUser = await USERS.create({
            email,
            password: hassedpassword,
            username,
            phone_number,
            age,
            address,
            gender,
            birthday,
            profile_picture,
            latitude,
            longitude
        });

        await USERS.update({ account_setup_stage: 1 }, { where: { email } })
        return resp.successResponse(res, MSG.CREATED, createUser);
    } catch (error) {
        return resp.failedResponse(res, error.message);
    };
};

exports.login = [
    body('email').isEmail().notEmpty().withMessage(MSG.INCORRECT_EMAIL),
    body('password').notEmpty().withMessage(MSG.ENTER_PASS),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return resp.failedResponseResponseWithData(res, errors.array()[0].msg, errors.array()[0])
            };
            const reqBody = req.body
            const findUser = await USERS.findOne({
                where: {
                    email: reqBody.email
                }
            });
            if (!findUser) {
                return resp.failedResponseWithMsg(res, MSG.NOTFOUND)
            };
            const verifyPassword = await USERS.findOne({
                where: {
                    email: reqBody.email
                }
            });
            const hassedPassword = await bcrypt.compare(reqBody.password, verifyPassword.password);
            if (!hassedPassword) {
                return resp.failedResponseWithMsg(res, MSG.WRONGPASS)
            };
            const token = jwt.sign({ id: findUser.id, userType: reqBody.userType }, process.env.key);
            return resp.successResponseWithTokenAndData(res, MSG.LOGIN, token, findUser);
        } catch (error) {
            return resp.failedResponse(res, error.message);
        }
    }];

////////////////////////////////////// VERIFICATION ///////////////////////////////////////////
async (req, res) => {
    try {
        let { email } = req.body;
        const findUser = await USERS.findOne({
            where: { email }
        });
        if (!findUser) { return resp.failedResponseWithMsg(res, MSG.NOTFOUND); };
        console.log(findUser);
        const token = jwt.sign({ email: findUser.email }, process.env.key, { expiresIn: 10 });
        let html = await ejs.renderFile("views/verification.ejs", { ip: CONSTANT.IP, token: token });
        console.log(html);
        await sendEmail(findUser.email, html);
        await USERS.update(
            { account_setup_stage: 2 },
            { where: { email: req.body.email } })
        return resp.successResponse(res, MSG.EMIAL_SENT);
    } catch (error) {
        return resp.failedResponse(res, error.message);
    };
};

//////////////////////////////////////////ACCOUNT SETUP//////////////////////////////////////////

exports.users_preferences = async (req, res) => {
    console.log(req.currentUser.id)
    try {
        let {
            age_preference,
            income_preference,
            education_preference,
            preferred_gender,
            distance_preference,
            interests,
            additional_preferences,
            profile_score,
        } = req.body;

        const findUser = await USERS.findOne({
            where: {
                id: req.currentUser.id,
            }
        })
        const findUser_preference = await USERS_PREFERENCES.findOne({
            where: {
                user_id: req.currentUser.id,
            }
        })
        console.log(findUser);
        if (!findUser) {
            return resp.failedResponseWithMsg(res, MSG.NOTFOUND);
        }
        if (findUser_preference) {
            return resp.failedResponseWithMsg(res, "PREFERENCES_NOTFOUND");
        }
        if (findUser.is_verify == false) {
            return resp.failedResponseWithMsg(res, MSG.NOTVERIFEID);
        }
        if (findUser.id != req.currentUser.id) {
            return resp.failedResponseWithMsg(res, MSG.WONGUSER);
        }
        const data = await USERS_PREFERENCES.create({
            user_id: req.currentUser.id,
            age_preference,
            income_preference,
            education_preference,
            preferred_gender,
            distance_preference,
            interests,
            additional_preferences,
            profile_score,
        })
        await USERS.update({ Profile_Completeness: 3 }, { where: { id: findUser.id } })
        return resp.successResponse(res, MSG.UPDATED, data);

    } catch (error) {
        return resp.failedResponse(res, error.message);
    }
};

exports.token = async (req, res) => {
    try {
        return resp.successResponse(res, MSG.SUCCESS, req.currentUser);
    } catch (err) {
        return resp.failedResponse(res, err.message);
    }
};

exports.user_profile = async (req, res) => {
    try {
        const findUser_profile = await USERS.findOne({
            where: {
                id: req.currentUser.id
            },
            include:
                { model: USERS_PREFERENCES }
        });
        // console.log(req.currentUser.id);
        if (!findUser_profile) {
            return resp.failedResponse(res, "User not found");
        };
        return resp.successResponse(res, MSG.SUCCESS, findUser_profile);
    } catch (error) {
        return resp.failedResponse(res, error.message);
    }
}