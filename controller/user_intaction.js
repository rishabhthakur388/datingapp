const resp = require("../helper/response");
const CONSTANT = require("../constants/constants");
const MSG = require("../messages/messages");
const db = require("../models/index");
const USERS = db.users;
const USER_PREFERENCES = db.users_preferences;
const USER_INTERACTIONS = db.user_interactions;
const MATCHED_USER = db.matched_user;
const Mind = require('../Mind');
const mind = new Mind('./test.json');
// const { body, validationResult } = require('express-validator');
const { Op } = require("sequelize");

//////////////////////////////////////// ELO ALGO AS A FUNCTION //////////////////////////////////////////
function calculateNewRatings(target_profile_score, user_profile_score, user_action, traget_user_action, k) {
    const expectedOutcomeA = 1 / (1 + Math.pow(10, target_profile_score - user_profile_score) / CONSTANT.ELOFORMULA);
    const expectedOutcomeB = 1 / (1 + Math.pow(10, user_profile_score - target_profile_score) / CONSTANT.ELOFORMULA);
    const outComeA = user_action;
    const outComeB = traget_user_action;
    const newRating_user = user_profile_score + k * (parseInt(outComeA) - expectedOutcomeA);
    const newRating_target_user = target_profile_score + k * (parseInt(outComeB) - expectedOutcomeB);
    // console.log("New Rating for Target User:", parseFloat(newRating_target_user));
    return {
        newRating_user,
        newRating_target_user,
    };
};

// //////////////////////////////////////// USER INTRACTON ///////////////////////////////////////////// 
exports.intraction = async function (req, res) {
    try {
        console.log(req.currentUser.id, "-------------");
        const findUser = await USERS.findOne({
            where: {
                id: req.currentUser.id
            },
            include: {
                model: USER_PREFERENCES,
            }
        });
        const latitude = findUser.latitude;
        const longitude = findUser.longitude;
        const radius = findUser.users_preference.distance_preference

        if (findUser == null) { return resp.failedResponse(res, MSG.NOTFOUND); }

        ////////////////////////////////////// USERS PREFERENCES MATCHING ///////////////////////////////////////////////////////////
        if (req.query.stage == '1') {
            // interset match stage
            let userPreference = await USER_PREFERENCES.findOne({ where: { user_id: req.currentUser.id } });
            console.log(userPreference);
            const findMacthes = await USER_PREFERENCES.findAll({
                where: {
                    [Op.or]: [
                        { interests: { [Op.like]: `%${findUser.users_preference.interests}%` } },
                        { age_preference: findUser.users_preference.age_preference },
                        { education_preference: findUser.users_preference.education_preference },
                        { distance_preference: findUser.users_preference.distance_preference },
                    ],
                },
                // ////////////////////////////////////// GEO AREA RADIUS MATCHING ///////////////////////////////////////////////////////////
                include: {
                    model: USERS,
                    attributes: [
                        'id',
                        'username',
                        'gender',
                        'latitude',
                        'longitude',
                        [
                            db.sequelize.literal(
                                "6371 * acos(cos(radians(" +
                                latitude +
                                ")) * cos(radians(latitude)) * cos(radians(" +
                                longitude +
                                ") - radians(longitude)) + sin(radians(" +
                                latitude +
                                ")) * sin(radians(latitude)))"
                            ),
                            "distance",
                        ]
                    ],
                    where: {
                        [Op.and]: [
                            { [Op.not]: { id: req.currentUser.id } },
                            { gender: userPreference.preferred_gender },
                            db.sequelize.where(
                                db.sequelize.literal(
                                    "6371 * acos(cos(radians(" +
                                    latitude +
                                    ")) * cos(radians(latitude)) * cos(radians(" +
                                    longitude +
                                    ") - radians(longitude)) + sin(radians(" +
                                    latitude +
                                    ")) * sin(radians(latitude)))"
                                ),
                                "<=",
                                `${radius}`
                            )
                        ]
                    },
                    group: ["USERS.id"],
                    having: db.sequelize.literal(),
                },
                // attributes: []
                // raw: true
            });
            return resp.successResponse(res, MSG.USERS_FOUND, findMacthes);
        };
        ///////////////////////////////////////// UPDATING INTRACTION AFTER MATCH //////////////////////////////////////////////
        if (req.query.stage === "2") {
            const { user_id, target_user_id, user_action, traget_user_action } = req.query // user response and target user response
            //////////////////////////////////////////////////////////////////////////////////////////////////////
            // after matches user interactions
            const allready_matched = await MATCHED_USER.findOne({
                where:
                {
                    user_id: req.currentUser.id,
                    target_user_id: req.query.target_user_id,
                    is_matched: 1
                }
            });
            // condtion for unique matches
            if (allready_matched) {
                return resp.failedResponseWithMsg(res, MSG.ALREADY_MATCHED, allready_matched);
            };
            // const allready_intracted = await USER_INTERACTIONS.findOne({
            //     where:
            //     {
            //         user_id: req.currentUser.id,
            //         target_user_id: req.query.target_user_id,
            //     }
            // });
            // // condtion for unique interactions
            // if (allready_matched) {
            //     return resp.failedResponseWithMsg(res, MSG.ALREADY_MATCHED, allready_intracted);
            // };
            
            // same user as target user
            if(req.currentUser.id == req.query.target_user_id ){
                return resp.failedResponse(res, MSG.CANNOT_MATCH);
            }

            /////////////////////////////////////////////////////////////////////////////////////////////////////////////
            const payload = {
                user_id: req.currentUser.id,
                target_user_id,
                user_action,
                traget_user_action
            };
            const findTargetUser_rating = await USERS.findOne({ where: { id: target_user_id } });
            const target_profile_socre = findTargetUser_rating.profile_rating;
            const user_profile_score = findUser.profile_rating;
            const k = 32;
            const { newRating_user, newRating_target_user } = calculateNewRatings(
                target_profile_socre,
                user_profile_score,
                user_action,
                traget_user_action,
                k
            );
            //////////////////////////////////////////////////////////////////////////////////////////////
            if (req.query.user_action == '1' && req.query.traget_user_action == '1') {
                // Both liked each other and matched
                await USERS.update({
                    profile_rating: newRating_user // elo ++
                }, {
                    where: {
                        id: req.currentUser.id
                    }
                });
                await USERS.update({
                    profile_rating: newRating_target_user
                }, {
                    where: {
                        id: req.query.target_user_id // elo ++
                    }
                });
                const payload2 = {
                    user_id: req.currentUser.id,
                    target_user_id,
                    is_matched: true
                };
                //////////////////////////////////////////////AI SUGGESTIONS////////////////////////////////////////////////////
                const findUser_interests = await USERS.findOne({
                    where: {
                        id: req.query.target_user_id
                    },
                    include: {
                        model: USER_PREFERENCES,
                    }
                });
                const suggestion = findUser_interests.users_preference.interests

                let input = suggestion; ///extra
                const AI_suggestions = []
                AI_suggestions.push(`${mind.think(input)}`)
                /////////////////////////////////////////////////////////////////////////////////////////////////

                const data = await USER_INTERACTIONS.create(payload); // creating history
                const matched_data = await MATCHED_USER.create(payload2); // adding matched data
                return resp.successResponse(res, MSG.MATCHED, { data, matched_data, AI_suggestions });
            };
            //////////////////////////////////////////////////////////////////////////////////////
            if (req.query.user_action == '0' && req.query.traget_user_action == '1') {
                // user dislike but opponent liked
                await USERS.update({
                    profile_rating: newRating_user // elo ++
                }, {
                    where: {
                        id: req.currentUser.id
                    }
                });
                await USERS.update({
                    profile_rating: newRating_target_user  //elo--
                }, {
                    where: {
                        id: req.query.target_user_id
                    }
                });
            };
            ////////////////////////////////////////////////////////////////////////////////////////
            if (req.query.user_action == '1' && req.query.traget_user_action == '0') {
                // user liked but opponent disliked
                await USERS.update({
                    profile_rating: newRating_user  //elo--
                }, {
                    where: {
                        id: req.currentUser.id
                    }
                });
                await USERS.update({
                    profile_rating: newRating_target_user  //elo++
                }, {
                    where: {
                        id: req.query.target_user_id
                    }
                });
            }
            //////////////////////////////////////////////////////////////////////////////////
            if (req.query.user_action == '0' && req.query.traget_user_action == '0') {
                // BOTH dislike each other
                await USERS.update({
                    profile_rating: newRating_user  //elo--
                }, {
                    where: {
                        id: req.currentUser.id
                    }
                });
                await USERS.update({
                    profile_rating: newRating_target_user //elo--
                }, {
                    where: {
                        id: req.query.target_user_id
                    }
                });
            }
            // else { return resp.failedResponse(res, MSG.SOMTHING_WORNG) };
            ////////////////////////////////////////////////////////////////////////////////
            const data = await USER_INTERACTIONS.create(payload); // creating history
            return resp.successResponse(res, MSG.SUCCESS, { data });
        }
        else { return resp.errorResponse(res, MSG.SOMTHING_WORNG) };
    } catch (error) {
        return resp.failedResponse(res, error.message);
    };
};
////////////////////////////////////reported/////////////////////////////////////////////////////
exports.is_reported = async (req, res) => {
    try {
        const findUser = await USERS.findOne({
            where: {
                id: req.currentUser.id
            }
        });
        const target_user = await USERS.findOne({
            where: {
                id: req.query.target_user_id,
            }
        })
        if (!findUser) {
            return resp.failedResponse(res, MSG.USERS_FOUND);
        };
        if (!target_user) {
            return resp.failedResponse(res, MSG.TARGET_USER_NOT_FOUND);
        };
        const data = await USER_INTERACTIONS.update({ is_reported: true }, {
            where: {
                target_user_id: req.query.target_user_id
            }
        });
        const reportedProfileRating = Math.max(target_user.profile_rating + CONSTANT.NEGATIVE_VALE, 0);
        const data2 = await USERS.update({
            profile_rating: reportedProfileRating
        }, {
            where: {
                id: req.query.target_user_id
            }
        });
        return resp.successResponse(res, MSG.REPORTED, { data, data2 });
    } catch (error) {
        return resp.failedResponse(res, error.message)
    }
}

/////////////////////////////////is_notresponsive////////////////////////////////////////////
exports.is_notresponed = async (req, res) => {
    try {
        const findUser = await USERS.findOne({
            where: {
                id: req.currentUser.id
            }
        });
        const target_user = await USERS.findOne({
            where: {
                id: req.query.target_user_id,
            }
        })
        if (!findUser) {
            return resp.failedResponse(res, MSG.NOTFOUND);
        };
        if (!target_user) {
            return resp.failedResponse(res, "Target user not found");
        };
        const data = await USER_INTERACTIONS.update({ is_notresponed: true }, {
            where: {
                target_user_id: req.query.target_user_id
            }
        });
        const reportedProfileRating = Math.max(target_user.profile_rating - 10, 0);
        const data2 = await USERS.update({
            profile_rating: reportedProfileRating
        }, {
            where: {
                id: req.query.target_user_id
            }
        });
        return resp.successResponse(res, "NOT_RESPONDING", { data, data2 });
    } catch (error) {
        return resp.failedResponse(res, error.message)
    }
}

/////////////////////////////////is_inactive////////////////////////////////////////////
exports.is_inactive = async (req, res) => {
    try {
        const findUser = await USERS.findOne({
            where: {
                id: req.currentUser.id
            }
        });
        const target_user = await USERS.findOne({
            where: {
                id: req.query.target_user_id,
            }
        });
        if (!findUser) {
            return resp.failedResponse(res, "User not found");
        };
        if (!target_user) {
            return resp.failedResponse(res, "Target user not found");
        };
        const data = await USER_INTERACTIONS.update({ is_inactive: true }, {
            where: {
                target_user_id: req.query.target_user_id
            }
        });
        const reportedProfileRating = Math.max(target_user.profile_rating - 10, 0);
        const data2 = await USERS.update({
            profile_rating: reportedProfileRating
        }, {
            where: {
                id: req.query.target_user_id
            }
        });
        return resp.successResponse(res, "INACTIVE_USER", { data, data2 });
    } catch (error) {
        return resp.failedResponse(res, error.message);
    }
};


