import connection from "../config/connectDB.js";
import jwt from "jsonwebtoken";
import md5 from "md5";
import request from "request";
import e from "express";
// require("dotenv").config();
import dotenv from "dotenv";
dotenv.config();

let timeNow = Date.now();

const randomString = (length) => {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
};

const randomNumber = (min, max) => {
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

const isNumber = (params) => {
    let pattern = /^[0-9]*\d$/;
    return pattern.test(params);
};

const ipAddress = (req) => {
    let ip = "";
    if (req.headers["x-forwarded-for"]) {
        ip = req.headers["x-forwarded-for"].split(",")[0];
    } else if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    } else {
        ip = req.ip;
    }
    return ip;
};

const timeCreate = () => {
    const d = new Date();
    const time = d.getTime();
    return time;
};

const loginPage = async (req, res) => {
    return res.render("account/login.ejs");
};

const registerPage = async (req, res) => {
    return res.render("account/register.ejs");
};

const forgotPage = async (req, res) => {
    return res.render("account/forgot.ejs");
};

const login = async (req, res) => {
    let { username, pwd } = req.body;

    if (!username || !pwd || !username) {
        //!isNumber(username)
        return res.status(200).json({
            message: "ERROR!!!",
        });
    }

    try {
        const [rows] = await connection.query(
            "SELECT * FROM users WHERE phone = ? AND password = ? ",
            [username, md5(pwd)]
        );
        if (rows.length == 1) {
            if (rows[0].status == 1) {
                const {
                    password,
                    money,
                    ip,
                    veri,
                    ip_address,
                    status,
                    time,
                    ...others
                } = rows[0];
                const accessToken = jwt.sign(
                    {
                        user: { ...others },
                        timeNow: timeNow,
                    },
                    process.env.JWT_ACCESS_TOKEN,
                    { expiresIn: "1d" }
                );
                await connection.execute(
                    "UPDATE `users` SET `token` = ? WHERE `phone` = ? ",
                    [md5(accessToken), username]
                );
                return res.status(200).json({
                    message: "Login Success",
                    status: true,
                    token: accessToken,
                    value: md5(accessToken),
                });
            } else {
                return res.status(200).json({
                    message: "Account has been locked",
                    status: false,
                });
            }
        } else {
            return res.status(200).json({
                message: "Incorrect Username or Password",
                status: false,
            });
        }
    } catch (error) {
        if (error) console.log(error);
    }
};

const updateVipLevel = async (inviter) => {
    const [invites] = await connection.query(
        "SELECT * FROM users WHERE invite = ? ",
        [inviter.code]
    );

    const totalInvites = invites.length;
    let vipLevel = 0;

    if (totalInvites >= 500) {
        vipLevel = 6;
    } else if (totalInvites >= 200) {
        vipLevel = 5;
    } else if (totalInvites >= 100) {
        vipLevel = 4;
    } else if (totalInvites >= 60) {
        vipLevel = 3;
    } else if (totalInvites >= 30) {
        vipLevel = 2;
    } else if (totalInvites >= 10) {
        vipLevel = 1;
    }

    if (vipLevel != 0) {
        await connection.query(
            "UPDATE users SET vip_level = ? WHERE phone = ?",
            [vipLevel, inviter.phone]
        );
    }
};

const register = async (req, res) => {
    let now = new Date().getTime();
    // let { username, pwd, invitecode, otp } = req.body;
    let { username, pwd, invitecode } = req.body;
    let id_user = randomNumber(100000, 999999);
    let otp2 = randomNumber(100000, 999999);
    let name_user = "Member" + randomNumber(10000, 99999);
    let code = randomString(5) + randomNumber(10000, 99999);
    let ip = ipAddress(req);
    let time = timeCreate();

    while (true) {
        const [u] = await connection.query(
            "SELECT * FROM users WHERE id_user = ?",
            [id_user]
        );

        if (u.length == 0) {
            break;
        }

        id_user = randomNumber(100000, 999999);
    }

    function formateT(params) {
        let result = params < 10 ? "0" + params : params;
        return result;
    }

    function timerJoin(params = "") {
        let date = "";
        if (params) {
            date = new Date(Number(params));
        } else {
            date = new Date();
        }
        let years = formateT(date.getFullYear());
        let months = formateT(date.getMonth() + 1);
        let days = formateT(date.getDate());
        return years + "-" + months + "-" + days;
    }

    // if (!username || !pwd || !invitecode || !otp) {
    //     return res.status(200).json({
    //         message: "ERROR!!!",
    //         status: false,
    //     });
    // }

    if (!username || !pwd || !invitecode) {
        return res.status(200).json({
            message: "ERROR!!!",
            status: false,
        });
    }

    if (username.length < 9 || username.length > 10 || !isNumber(username)) {
        return res.status(200).json({
            message: "phone error",
            status: false,
        });
    }

    try {
        const [check_u] = await connection.query(
            "SELECT * FROM users WHERE phone = ?",
            [username]
        );
        const [check_i] = await connection.query(
            "SELECT * FROM users WHERE code = ? ",
            [invitecode]
        );
        const [check_ip] = await connection.query(
            "SELECT * FROM users WHERE ip_address = ? ",
            [ip]
        );
        // const [otpData] = await connection.query(
        //     "SELECT otp, time_otp FROM users WHERE phone = ?",
        //     [username]
        // );

        if (check_u.length == 1 && check_u[0].veri == 1) {
            return res.status(200).json({
                message: "Phone number already registred",
                status: false,
            });
        } else {
            if (check_i.length == 1) {
                // OTP validation
                // if (check_u.length == 1 && otpData.length == 1) {
                //     const providedOtp = otp;
                //     const storedOtp = otpData[0].otp;

                //     if (providedOtp != storedOtp) {
                //         return res.status(200).json({
                //             message: "Invalid OTP",
                //             status: false,
                //         });
                //     }

                //     if (!isOTPValid(otpData[0].time_otp)) {
                //         return res.status(200).json({
                //             message: "OTP expired",
                //             status: false,
                //         });
                //     }
                // } else {
                //     return res.status(200).json({
                //         message: "OTP not found. Please try sending OTP again",
                //         status: false,
                //     });
                // }

                if (check_ip.length <= 3) {
                    let ctv = "";
                    if (check_i[0].level == 2) {
                        ctv = check_i[0].phone;
                    } else {
                        ctv = check_i[0].ctv;
                    }
                    // const sql =
                    //     // "INSERT INTO users SET id_user = ?,phone = ?,name_user = ?,password = ?,money = ?,code = ?,invite = ?,ctv = ?,veri = ?,otp = ?,ip_address = ?,status = ?,time = ?";
                    //     "UPDATE users SET id_user = ?,phone = ?,name_user = ?,password = ?,money = ?,code = ?,invite = ?,ctv = ?,veri = ?,otp = ?,ip_address = ?,status = ?,time = ? WHERE phone = ?";
                    // await connection.execute(sql, [
                    //     id_user,
                    //     username,
                    //     name_user,
                    //     md5(pwd),
                    //     0,
                    //     code,
                    //     invitecode,
                    //     ctv,
                    //     1,
                    //     otp2,
                    //     ip,
                    //     1,
                    //     time,
                    //     username,
                    // ]);
                    const sql =
                        "INSERT INTO users SET id_user = ?,phone = ?,name_user = ?,password = ?,money = ?,code = ?,invite = ?,ctv = ?,veri = ?,otp = ?,ip_address = ?,status = ?,time = ?";
                    await connection.execute(sql, [
                        id_user,
                        username,
                        name_user,
                        md5(pwd),
                        0,
                        code,
                        invitecode,
                        ctv,
                        1,
                        otp2,
                        ip,
                        1,
                        time,
                    ]);
                    await connection.execute(
                        "INSERT INTO point_list (phone, today) VALUES (?, ?)",
                        [username, timerJoin(time)]
                    );
                    await updateVipLevel(check_i[0]);
                    return res.status(200).json({
                        message: "Register Success",
                        status: true,
                    });
                } else {
                    return res.status(200).json({
                        message: "Registered IP address",
                        status: false,
                    });
                }
            } else {
                return res.status(200).json({
                    message: "Referrer code does not exist",
                    status: false,
                });
            }
        }
    } catch (error) {
        if (error) console.log(error);
    }
};

/**
 * Verifies that OTP is valid or not
 * @param {number} otpTime time in epoch
 * @returns {boolean} true if OTP is still vaild else false
 */
const isOTPValid = (otpTime) => {
    const now = new Date().getTime();

    return otpTime - now > 0 ? true : false;
};

// const verifyCode = async (req, res) => {
//     let phone = req.body.phone;
//     let now = new Date().getTime();
//     let timeEnd = +new Date() + 1000 * (60 * 2 + 0) + 500;
//     let otp = randomNumber(100000, 999999);

//     if (phone.length < 9 || phone.length > 10 || !isNumber(phone)) {
//         return res.status(200).json({
//             message: "phone error",
//             status: false,
//         });
//     }

//     const [rows] = await connection.query(
//         "SELECT * FROM users WHERE `phone` = ?",
//         [phone]
//     );

//     const URL = `https://api.authkey.io/request?authkey=${process.env.AUTHKY_AUTH}&mobile=${phone}&country_code=91&sender=AUTHKY&otp=${otp}&company=venasclub.live+account&sid=11236`;

//     // fast2sms api data
//     // const URL = "https://www.fast2sms.com/dev/bulkV2";
//     // const F2Sdata = {
//     //     variables_values: otp,
//     //     route: "otp",
//     //     numbers: phone,
//     // };
//     // const options = {
//     //     method: "POST",
//     //     body: JSON.stringify(F2Sdata),
//     //     headers: {
//     //         authorization: process.env.F2SMS_AUTH_KEY,
//     //         "content-type": "application/json",
//     //     },
//     // };

//     if (rows.length == 0) {
//         fetch(URL)
//             .then((resp) => resp.json())
//             .then(async (resp) => {
//                 if (resp.Message == "Submitted Successfully") {
//                     await connection.execute(
//                         "INSERT INTO users SET phone = ?, otp = ?, veri = 0, time_otp = ? ",
//                         [phone, otp, timeEnd]
//                     );

//                     return res.status(200).json({
//                         message: "OTP sent successfully. Expires in 2 minutes",
//                         status: true,
//                         timeStamp: timeNow,
//                         timeEnd: timeEnd,
//                     });
//                 } else {
//                     console.error("[OTP_ERROR]:", resp);
//                     return res.status(200).json({
//                         message: "Otp not sent. Please contact support",
//                         status: false,
//                     });
//                 }
//             });
//     } else {
//         let user = rows[0];
//         if (user.time_otp - now <= 0) {
//             fetch(URL)
//                 .then((resp) => resp.json())
//                 .then(async (resp) => {
//                     if (resp.Message == "Submitted Successfully") {
//                         await connection.execute(
//                             "UPDATE users SET otp = ?, time_otp = ? WHERE phone = ? ",
//                             [otp, timeEnd, phone]
//                         );

//                         return res.status(200).json({
//                             message: "OTP sent successfully",
//                             status: true,
//                             timeStamp: timeNow,
//                             timeEnd: timeEnd,
//                         });
//                     } else {
//                         console.error("[OTP_ERROR]:", resp);
//                         return res.status(200).json({
//                             message: "Otp not sent. Please contact support",
//                             status: false,
//                         });
//                     }
//                 });
//         } else {
//             return res.status(200).json({
//                 message: "Please wait before trying again",
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//     }
// };

// const verifyCodePass = async (req, res) => {
//     let phone = req.body.phone;
//     let now = new Date().getTime();
//     let timeEnd = +new Date() + 1000 * (60 * 2 + 0) + 500;
//     let otp = randomNumber(100000, 999999);

//     if (phone.length < 9 || phone.length > 10 || !isNumber(phone)) {
//         return res.status(200).json({
//             message: "phone error",
//             status: false,
//         });
//     }

//     const URL = `https://api.authkey.io/request?authkey=${process.env.AUTHKY_AUTH}&mobile=${phone}&country_code=91&sender=AUTHKY&otp=${otp}&company=venasclub.live+account&sid=11236`;

//     // fast2sms api data
//     // const URL = "https://www.fast2sms.com/dev/bulkV2";
//     // const F2Sdata = {
//     //     variables_values: otp,
//     //     route: "otp",
//     //     numbers: phone,
//     // };
//     // const options = {
//     //     method: "POST",
//     //     body: JSON.stringify(F2Sdata),
//     //     headers: {
//     //         authorization: process.env.F2SMS_AUTH_KEY,
//     //         "content-type": "application/json",
//     //     },
//     // };

//     const [rows] = await connection.query(
//         "SELECT * FROM users WHERE `phone` = ? AND veri = 1",
//         [phone]
//     );
//     if (rows.length == 0) {
//         return res.status(200).json({
//             message: "Account does not exist",
//             status: false,
//             timeStamp: timeNow,
//         });
//     } else {
//         let user = rows[0];
//         if (user.time_otp - now <= 0) {
//             fetch(URL)
//                 .then((resp) => resp.json())
//                 .then(async (resp) => {
//                     if (resp.Message == "Submitted Successfully") {
//                         await connection.execute(
//                             "UPDATE users SET otp = ?, time_otp = ? WHERE phone = ? ",
//                             [otp, timeEnd, phone]
//                         );

//                         return res.status(200).json({
//                             message: "OTP sent successfully",
//                             status: true,
//                             timeStamp: timeNow,
//                             timeEnd: timeEnd,
//                         });
//                     } else {
//                         console.error("[OTP_ERROR]:", resp);
//                         return res.status(200).json({
//                             message: "Otp not sent. Please contact support",
//                             status: false,
//                         });
//                     }
//                 });
//         } else {
//             return res.status(200).json({
//                 message: "Please wait before trying again",
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//     }
// };

const forGotPassword = async (req, res) => {
    let username = req.body.username;
    // let otp = req.body.otp;
    let pwd = req.body.pwd;
    let now = new Date().getTime();
    let timeEnd = +new Date() + 1000 * (60 * 2 + 0) + 500;
    let otp2 = randomNumber(100000, 999999);

    if (username.length < 9 || username.length > 10 || !isNumber(username)) {
        return res.status(200).json({
            message: "phone error",
            status: false,
        });
    }

    const [rows] = await connection.query(
        "SELECT * FROM users WHERE `phone` = ? AND veri = 1",
        [username]
    );
    if (rows.length == 0) {
        return res.status(200).json({
            message: "Tài khoản không tồn tại",
            status: false,
            timeStamp: timeNow,
        });
    } else {
        await connection.execute(
            "UPDATE users SET password = ?, otp = ?, time_otp = ? WHERE phone = ? ",
            [md5(pwd), otp2, timeEnd, username]
        );
        return res.status(200).json({
            message: "Changed password successfully",
            status: true,
            timeStamp: timeNow,
            timeEnd: timeEnd,
        });
        // let user = rows[0];
        // if (user.time_otp - now > 0) {
        //     if (user.otp == otp) {
        //         await connection.execute(
        //             "UPDATE users SET password = ?, otp = ?, time_otp = ? WHERE phone = ? ",
        //             [md5(pwd), otp2, timeEnd, username]
        //         );
        //         return res.status(200).json({
        //             message: "Changed password successfully",
        //             status: true,
        //             timeStamp: timeNow,
        //             timeEnd: timeEnd,
        //         });
        //     } else {
        //         return res.status(200).json({
        //             message: "Invalid OTP",
        //             status: false,
        //             timeStamp: timeNow,
        //         });
        //     }
        // } else {
        //     return res.status(200).json({
        //         message: "OTP expired",
        //         status: false,
        //         timeStamp: timeNow,
        //     });
        // }
    }
};

const exp = {
    login,
    register,
    loginPage,
    registerPage,
    forgotPage,
    // verifyCode,
    // verifyCodePass,
    forGotPassword,
};

export default exp;
