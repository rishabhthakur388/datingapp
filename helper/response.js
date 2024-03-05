module.exports = {

    successResponse: (res, msg, data) => {
        return res.status(200).json({
            status: 200,
            msg: msg,
            data: data
        })
    },
    failedResponseResponseWithData: (res, msg, data) => {
        return res.status(200).json({
            status: 200,
            msg: msg,
            data: data
        })
    },
    successResponseWithoutData: (res, msg) => {
        return res.status(200).json({
            status: 200,
            msg: msg,
        })
    },
    failedResponse: (res, err) => {
        return res.status(400).json({
            status: 400,
            error: err
        })
    },
    failedResponseWithMsg: (res, msg) => {
        return res.status(400).json({
            status: 400,
            message: msg,
        })
    },
    successResponseWithToken: (res, msg, token) => {
        return res.status(200).json({
            status: 200,
            msg: msg,
            token: token,
        })
    },
    successResponseWithTokenAndData: (res, msg, token, data) => {
        return res.status(200).json({
            status: 200,
            msg: msg,
            token: token,
            data: data
        })
    },
    failedResponseWithCustomStatus: (res, code, msg) => {
        return res.status(400).json({
            status: code,
            message: msg
        })
    }
}
