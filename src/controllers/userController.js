import connection from "../config/connectDB.js";
// import jwt from "jsonwebtoken";
import md5 from "md5";
import request from "request";

import Tron from "../gateway/tron.js";
// import Didapay from "../gateway/didapay.js";
// import Wepay from "../gateway/wepay.js";
// import Allpay from "../gateway/allpay.js";
// import xdpay from "../gateway/xdpay.js";
import Okpay from "../gateway/okpay.js";

import Jili from "../thirdparty/jili.js";

// require("dotenv").config();
import dotenv from "dotenv";
import Kingmaker from "../thirdparty/kingmaker.js";
dotenv.config();

let timeNow = Date.now();

const randomNumber = (min, max) => {
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
};
const verifyCode = async (req, res) => {
    let auth = req.cookies.auth;
    let now = new Date().getTime();
    let timeEnd = +new Date() + 1000 * (60 * 2 + 0) + 500;
    let otp = randomNumber(100000, 999999);

    const [rows] = await connection.query(
        "SELECT * FROM users WHERE `token` = ? ",
        [auth]
    );
    if (!rows) {
        return res.status(200).json({
            message: "Account does not exist",
            status: false,
            timeStamp: timeNow,
        });
    }
    let user = rows[0];
    if (user.time_otp - now <= 0) {
        request(
            `http://47.243.168.18:9090/sms/batch/v2?appkey=NFJKdK&appsecret=brwkTw&phone=84${user.phone}&msg=Your verification code is ${otp}&extend=${now}`,
            async (error, response, body) => {
                let data = JSON.parse(body);
                if (data.code == "00000") {
                    await connection.execute(
                        "UPDATE users SET otp = ?, time_otp = ? WHERE phone = ? ",
                        [otp, timeEnd, user.phone]
                    );
                    return res.status(200).json({
                        message: "Submitted successfully",
                        status: true,
                        timeStamp: timeNow,
                        timeEnd: timeEnd,
                    });
                }
            }
        );
    } else {
        return res.status(200).json({
            message: "Send SMS regularly.",
            status: false,
            timeStamp: timeNow,
        });
    }
};

const userInfo = async (req, res) => {
    let auth = req.cookies.auth;

    if (!auth) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    const [rows] = await connection.query(
        "SELECT * FROM users WHERE `token` = ? ",
        [auth]
    );

    if (!rows) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    const [recharge] = await connection.query(
        "SELECT * FROM recharge WHERE `phone` = ? AND status = 1",
        [rows[0].phone]
    );
    let totalRecharge = 0;
    recharge.forEach((data) => {
        totalRecharge += data.money;
    });
    const [withdraw] = await connection.query(
        "SELECT * FROM withdraw WHERE `phone` = ? AND status = 1",
        [rows[0].phone]
    );
    let totalWithdraw = 0;
    withdraw.forEach((data) => {
        totalWithdraw += data.money;
    });

    const {
        id,
        password,
        ip,
        veri,
        ip_address,
        status,
        time,
        token,
        ...others
    } = rows[0];
    return res.status(200).json({
        message: "Success",
        status: true,
        data: {
            code: others.code,
            id_user: others.id_user,
            name_user: others.name_user,
            phone_user: others.phone,
            money_user: others.money,
        },
        totalRecharge: totalRecharge,
        totalWithdraw: totalWithdraw,
        timeStamp: timeNow,
    });
};

const changeUser = async (req, res) => {
    let auth = req.cookies.auth;
    let name = req.body.name;
    let type = req.body.type;

    const [rows] = await connection.query(
        "SELECT * FROM users WHERE `token` = ? ",
        [auth]
    );
    if (!rows || !type || !name)
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    switch (type) {
        case "editname":
            try {
                await connection.query(
                    "UPDATE users SET name_user = ? WHERE `token` = ? ",
                    [name, auth]
                );
            } catch (error) {
                return res.status(200).json({
                    message: "emojies are not supported!",
                    status: false,
                    timeStamp: timeNow,
                });
            }
            return res.status(200).json({
                message: "Username modification successful",
                status: true,
                timeStamp: timeNow,
            });
            break;

        default:
            return res.status(200).json({
                message: "Failed",
                status: false,
                timeStamp: timeNow,
            });
            break;
    }
};

const changePassword = async (req, res) => {
    let auth = req.cookies.auth;
    let password = req.body.password;
    let newPassWord = req.body.newPassWord;
    // let otp = req.body.otp;

    if (!password || !newPassWord)
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    const [rows] = await connection.query(
        "SELECT * FROM users WHERE `token` = ? AND `password` = ? ",
        [auth, md5(password)]
    );
    if (rows.length == 0)
        return res.status(200).json({
            message: "Incorrect password",
            status: false,
            timeStamp: timeNow,
        });

    await connection.query(
        "UPDATE users SET otp = ?, password = ? WHERE `token` = ? ",
        [randomNumber(100000, 999999), md5(newPassWord), auth]
    );
    return res.status(200).json({
        message: "Password modification successful",
        status: true,
        timeStamp: timeNow,
    });
};

const checkInHandling = async (req, res) => {
    let auth = req.cookies.auth;
    let data = req.body.data;

    if (!auth)
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    const [rows] = await connection.query(
        "SELECT * FROM users WHERE `token` = ? ",
        [auth]
    );
    if (!rows)
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    if (!data) {
        const [point_list] = await connection.query(
            "SELECT * FROM point_list WHERE `phone` = ? ",
            [rows[0].phone]
        );
        return res.status(200).json({
            message: "No More Data",
            datas: point_list,
            status: true,
            timeStamp: timeNow,
        });
    }
    const [total_recharge] = await connection.query(
        "SELECT SUM(money) as totalRecharge FROM recharge WHERE `phone` = ? AND status = 1",
        [rows[0].phone]
    );
    const totalRecharge = Number(total_recharge[0].totalRecharge);

    if (totalRecharge < 1000) {
        return res.status(200).json({
            message: `total recharge must be more than 1000. <br> your total recharge: ${
                totalRecharge ? totalRecharge : 0
            }`,
            status: false,
            timeStamp: timeNow,
        });
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
    let dates = new Date().getTime();
    let checkTime = timerJoin(dates);

    if (data) {
        let reward = null;

        const [point_lists] = await connection.query(
            "SELECT * FROM point_list WHERE `phone` = ? ",
            [rows[0].phone]
        );

        let point_list = point_lists[0];

        if (data == 1) {
            reward = point_list.total1;
        } else if (data == 2) {
            reward = point_list.total2;
        } else if (data == 3) {
            reward = point_list.total3;
        } else if (data == 4) {
            reward = point_list.total4;
        } else if (data == 5) {
            reward = point_list.total5;
        } else if (data == 6) {
            reward = point_list.total6;
        } else if (data == 7) {
            reward = point_list.total7;
        }

        if (reward != 0) {
            let isPreviousRecieved = true;
            if (data != 1) {
                const previous = data - 1;

                if (previous == 1) {
                    isPreviousRecieved = point_list.total1 == 0 ? true : false;
                } else if (previous == 2) {
                    isPreviousRecieved = point_list.total2 == 0 ? true : false;
                } else if (previous == 3) {
                    isPreviousRecieved = point_list.total3 == 0 ? true : false;
                } else if (previous == 4) {
                    isPreviousRecieved = point_list.total4 == 0 ? true : false;
                } else if (previous == 5) {
                    isPreviousRecieved = point_list.total5 == 0 ? true : false;
                } else if (previous == 6) {
                    isPreviousRecieved = point_list.total6 == 0 ? true : false;
                }
            }

            if (!isPreviousRecieved) {
                return res.status(200).json({
                    message: "You are not eligible to receive the gift.",
                    status: false,
                    timeStamp: timeNow,
                });
            }

            const [today_data] = await connection.query(
                `SELECT today FROM point_list WHERE phone = ? `,
                [rows[0].phone]
            );

            const previousRecieved = today_data[0].today;

            if (previousRecieved == checkTime) {
                return res.status(200).json({
                    message: "comeback tomorrow for more rewards",
                    status: false,
                    timeStamp: timeNow,
                });
            }

            await connection.query(
                "UPDATE users SET money = money + ? WHERE phone = ? ",
                [reward, rows[0].phone]
            );

            await connection.query(
                `UPDATE point_list SET today = ? WHERE phone = ? `,
                [checkTime, rows[0].phone]
            );

            await connection.query(
                `UPDATE point_list SET total${data} = ? WHERE phone = ? `,
                [0, rows[0].phone]
            );

            return res.status(200).json({
                message: `You just received ₹ ${reward}.00`,
                status: true,
                timeStamp: timeNow,
            });
        } else {
            return res.status(200).json({
                message: "You have already received this gift",
                status: false,
                timeStamp: timeNow,
            });
        }
    }
};

function formateT(params) {
    let result = params < 10 ? "0" + params : params;
    return result;
}

function timerJoin(params = "") {
    let date = "";
    if (params) {
        date = new Date(Number(params));
    } else {
        date = Date.now();
        date = new Date(Number(date));
    }
    let years = formateT(date.getFullYear());
    let months = formateT(date.getMonth() + 1);
    let days = formateT(date.getDate());
    let weeks = formateT(date.getDay());

    let hours = formateT(date.getHours());
    let minutes = formateT(date.getMinutes());
    let seconds = formateT(date.getSeconds());
    // return years + '-' + months + '-' + days + ' ' + hours + '-' + minutes + '-' + seconds;
    return years + " - " + months + " - " + days;
}

const promotion = async (req, res) => {
    let auth = req.cookies.auth;
    if (!auth) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    const [user] = await connection.query(
        "SELECT `phone`, `code`,`invite`, `roses_f`, `roses_f1`, `roses_today`, `vip_level` FROM users WHERE `token` = ? ",
        [auth]
    );
    const [level] = await connection.query("SELECT * FROM level");
    if (!user) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    let userInfo = user[0];

    const getTotalBet = async (phone) => {
        const [minutes_1] = await connection.query(
            "SELECT * FROM minutes_1 WHERE phone = ?",
            [phone]
        );

        const [result_5d] = await connection.query(
            "SELECT * FROM result_5d WHERE phone = ?",
            [phone]
        );

        const [result_k3] = await connection.query(
            "SELECT * FROM result_k3 WHERE phone = ?",
            [phone]
        );

        let totalBet = 0;

        minutes_1.forEach((data) => {
            totalBet += parseFloat(data.money);
        });

        result_5d.forEach((data) => {
            totalBet += parseFloat(data.money);
        });

        result_k3.forEach((data) => {
            totalBet += parseFloat(data.money);
        });

        return totalBet;
    };

    const isActive = async (phone) => {
        const [minutes_1] = await connection.query(
            // "SELECT * FROM minutes_1 WHERE phone = ? AND today = ?",
            "SELECT * FROM minutes_1 WHERE phone = ?",
            [phone]
        );

        const [result_5d] = await connection.query(
            "SELECT * FROM result_5d WHERE phone = ?",
            [phone]
        );

        const [result_k3] = await connection.query(
            "SELECT * FROM result_k3 WHERE phone = ?",
            [phone]
        );

        let totalBet = 0;

        minutes_1.forEach((data) => {
            if (timerJoin(data.time) == timerJoin()) {
                totalBet += parseFloat(data.money);
            }
        });

        result_5d.forEach((data) => {
            if (timerJoin(data.time) == timerJoin()) {
                totalBet += parseFloat(data.money);
            }
        });

        result_k3.forEach((data) => {
            if (timerJoin(data.time) == timerJoin()) {
                totalBet += parseFloat(data.money);
            }
        });

        if (totalBet >= 500) {
            return true;
        } else {
            return false;
        }
    };

    // cấp dưới trực tiếp all
    const [f1s] = await connection.query(
        "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
        [userInfo.code]
    );

    // cấp dưới trực tiếp hôm nay
    let f1_today = 0;
    let f1_active_today = 0;
    let f1_total_recharge = 0;
    let f1_total_bet = 0;

    for (let i = 0; i < f1s.length; i++) {
        const f1_time = f1s[i].time; // Mã giới thiệu f1
        const phone = f1s[i].phone;
        let check = timerJoin(f1_time) == timerJoin() ? true : false;
        if (check) {
            f1_today += 1;
        }
        const [rechargeData] = await connection.query(
            "SELECT SUM(money) as totalRecharge FROM recharge WHERE `phone` = ? AND status = 1",
            [phone]
        );
        f1_total_recharge += Number(rechargeData[0].totalRecharge);
        f1_total_bet += await getTotalBet(phone);

        if (await isActive(phone)) {
            f1_active_today += 1;
        }
    }

    // tất cả cấp dưới hôm nay
    let f_all_today = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Mã giới thiệu f1
        const f1_time = f1s[i].time; // time f1
        let check_f1 = timerJoin(f1_time) == timerJoin() ? true : false;
        if (check_f1) f_all_today += 1;
        // tổng f1 mời đc hôm nay
        const [f2s] = await connection.query(
            "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
            [f1_code]
        );
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code; // Mã giới thiệu f2
            const f2_time = f2s[i].time; // time f2
            let check_f2 = timerJoin(f2_time) == timerJoin() ? true : false;
            if (check_f2) f_all_today += 1;
            // tổng f2 mời đc hôm nay
            const [f3s] = await connection.query(
                "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
                [f2_code]
            );
            for (let i = 0; i < f3s.length; i++) {
                const f3_code = f3s[i].code; // Mã giới thiệu f3
                const f3_time = f3s[i].time; // time f3
                let check_f3 = timerJoin(f3_time) == timerJoin() ? true : false;
                if (check_f3) f_all_today += 1;
                const [f4s] = await connection.query(
                    "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
                    [f3_code]
                );
                // tổng f3 mời đc hôm nay
                for (let i = 0; i < f4s.length; i++) {
                    const f4_code = f4s[i].code; // Mã giới thiệu f4
                    const f4_time = f4s[i].time; // time f4
                    let check_f4 =
                        timerJoin(f4_time) == timerJoin() ? true : false;
                    if (check_f4) f_all_today += 1;
                    // tổng f3 mời đc hôm nay
                }
            }
        }
    }

    // Tổng số f2
    let f2 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Mã giới thiệu f1
        const [f2s] = await connection.query(
            "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
            [f1_code]
        );
        f2 += f2s.length;
    }

    // Tổng số f3
    let f3 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Mã giới thiệu f1
        const [f2s] = await connection.query(
            "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
            [f1_code]
        );
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code;
            const [f3s] = await connection.query(
                "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
                [f2_code]
            );
            if (f3s.length > 0) f3 += f3s.length;
        }
    }

    // Tổng số f4
    let f4 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Mã giới thiệu f1
        const [f2s] = await connection.query(
            "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
            [f1_code]
        );
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code;
            const [f3s] = await connection.query(
                "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
                [f2_code]
            );
            for (let i = 0; i < f3s.length; i++) {
                const f3_code = f3s[i].code;
                const [f4s] = await connection.query(
                    "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
                    [f3_code]
                );
                if (f4s.length > 0) f4 += f4s.length;
            }
        }
    }

    return res.status(200).json({
        message: "Receive success",
        level: level,
        info: user,
        status: true,
        invite: {
            f1: f1s.length,
            total_f: f1s.length + f2 + f3 + f4,
            f1_today: f1_today,
            f1_active_today,
            f1_total_bet,
            f1_total_recharge,
            f_all_today: f_all_today,
            roses_f1: userInfo.roses_f1,
            roses_f: userInfo.roses_f,
            // roses_all: userInfo.roses_f + userInfo.roses_f1,
            roses_today: userInfo.roses_today,
        },
        timeStamp: timeNow,
    });
};

const myTeam = async (req, res) => {
    let auth = req.cookies.auth;
    if (!auth) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    const [user] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
        [auth]
    );
    const [level] = await connection.query("SELECT * FROM level");
    if (!user) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    return res.status(200).json({
        message: "Receive success",
        level: level,
        info: user,
        status: true,
        timeStamp: timeNow,
    });
};

const listMyTeam = async (req, res) => {
    let auth = req.cookies.auth;
    if (!auth) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    const [user] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
        [auth]
    );
    if (!user) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    let userInfo = user[0];

    const getTotalBet = async (phone) => {
        const [minutes_1] = await connection.query(
            "SELECT * FROM minutes_1 WHERE phone = ?",
            [phone]
        );

        const [result_5d] = await connection.query(
            "SELECT * FROM result_5d WHERE phone = ?",
            [phone]
        );

        const [result_k3] = await connection.query(
            "SELECT * FROM result_k3 WHERE phone = ?",
            [phone]
        );

        let totalBet = 0;

        minutes_1.forEach((data) => {
            totalBet += parseFloat(data.money);
        });

        result_5d.forEach((data) => {
            totalBet += parseFloat(data.money);
        });

        result_k3.forEach((data) => {
            totalBet += parseFloat(data.money);
        });

        return totalBet;
    };

    let f1 = [];
    const [f1s] = await connection.query(
        "SELECT `phone`, `code`,`invite`, `id_user`, `name_user`,`status`, `time` FROM users WHERE `invite` = ? ORDER BY id DESC",
        [userInfo.code]
    );
    f1.push(...f1s);

    for (let i = 0; i < f1.length; i++) {
        const phone = f1[i].phone; // Mã giới thiệu f1
        const [rechargeData] = await connection.query(
            "SELECT SUM(money) as totalRecharge FROM recharge WHERE `phone` = ? AND status = 1",
            [phone]
        );
        f1[i].totalRecharge = rechargeData[0].totalRecharge
            ? rechargeData[0].totalRecharge
            : 0;

        f1[i].totalBet = await getTotalBet(phone);
    }

    const [mem] = await connection.query(
        "SELECT `id_user`, `phone`, `time` FROM users WHERE `invite` = ? ORDER BY id DESC LIMIT 100",
        [userInfo.code]
    );
    const [total_roses] = await connection.query(
        "SELECT `f1`, `time` FROM roses WHERE `invite` = ? ORDER BY id DESC LIMIT 100",
        [userInfo.code]
    );

    let f2 = [];
    for (let i = 0; i < f1.length; i++) {
        const f1_code = f1[i].code; // Mã giới thiệu f1
        const [f2s] = await connection.query(
            "SELECT `phone`, `code`,`invite`, `id_user`, `name_user`,`status`, `time` FROM users WHERE `invite` = ? ",
            [f1_code]
        );
        f2.push(...f2s);
    }

    for (let i = 0; i < f2.length; i++) {
        const phone = f2[i].phone; // Mã giới thiệu f1
        const [rechargeData] = await connection.query(
            "SELECT SUM(money) as totalRecharge FROM `recharge` WHERE phone = ? AND status = 1",
            [phone]
        );
        f2[i].totalRecharge = rechargeData[0].totalRecharge
            ? rechargeData[0].totalRecharge
            : 0;

        f2[i].totalBet = await getTotalBet(phone);
    }

    let f3 = [];
    for (let i = 0; i < f1.length; i++) {
        const f1_code = f1[i].code; // Mã giới thiệu f1
        const [f2s] = await connection.query(
            "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
            [f1_code]
        );
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code;
            const [f3s] = await connection.query(
                "SELECT `phone`, `code`,`invite`, `id_user`, `name_user`,`status`, `time` FROM users WHERE `invite` = ? ",
                [f2_code]
            );
            if (f3s.length > 0) f3.push(...f3s);
        }
    }

    for (let i = 0; i < f3.length; i++) {
        const phone = f3[i].phone; // Mã giới thiệu f1
        const [rechargeData] = await connection.query(
            "SELECT SUM(money) as totalRecharge FROM `recharge` WHERE phone = ? AND status = 1",
            [phone]
        );
        f3[i].totalRecharge = rechargeData[0].totalRecharge
            ? rechargeData[0].totalRecharge
            : 0;

        f3[i].totalBet = await getTotalBet(phone);
    }

    let f4 = [];
    for (let i = 0; i < f1.length; i++) {
        const f1_code = f1[i].code; // Mã giới thiệu f1
        const [f2s] = await connection.query(
            "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
            [f1_code]
        );
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code;
            const [f3s] = await connection.query(
                "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
                [f2_code]
            );
            for (let i = 0; i < f3s.length; i++) {
                const f3_code = f3s[i].code;
                const [f4s] = await connection.query(
                    "SELECT `phone`, `code`,`invite`, `id_user`, `name_user`,`status`, `time` FROM users WHERE `invite` = ? ",
                    [f3_code]
                );
                if (f4s.length > 0) f4.push(...f4s);
            }
        }
    }

    for (let i = 0; i < f4.length; i++) {
        const phone = f4[i].phone; // Mã giới thiệu f1
        const [rechargeData] = await connection.query(
            "SELECT SUM(money) as totalRecharge FROM `recharge` WHERE phone = ? AND status = 1",
            [phone]
        );
        f4[i].totalRecharge = rechargeData[0].totalRecharge
            ? rechargeData[0].totalRecharge
            : 0;

        f4[i].totalBet = await getTotalBet(phone);
    }

    let newMem = [];
    mem.map((data) => {
        let objectMem = {
            id_user: data.id_user,
            phone:
                "91" +
                data.phone.slice(0, 1) +
                "****" +
                String(data.phone.slice(-4)),
            time: data.time,
        };

        return newMem.push(objectMem);
    });
    return res.status(200).json({
        message: "Receive success",
        f1,
        f2,
        f3,
        f4,
        mem: newMem,
        total_roses: total_roses,
        status: true,
        timeStamp: timeNow,
    });
};

// const currentTRXPrice = async (req, res) => {
//     return res.status(200).json({
//         message: "success",
//         value: await Tron.getTRXtoINR(),
//     });
// };

const currentUSDTPrice = async (req, res) => {
    return res.status(200).json({
        message: "success",
        value: await Tron.getUSDTtoINR(),
    });
};

const confirmUSDTTransaction = async (req, res) => {
    const auth = req.cookies.auth;
    const { txHash } = req.body;

    if (!txHash) {
        return res.status(200).json({
            message: "insufficient arguments. txhash missing",
            status: false,
            timeStamp: timeNow,
        });
    }

    const tron = new Tron();

    const [user] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
        [auth]
    );
    let userInfo = user[0];
    // checking for user authentication
    if (!userInfo) {
        return res.status(200).json({
            message: "Failed. Authentication Failed",
            status: false,
            timeStamp: timeNow,
        });
    }

    const [recharge] = await connection.query(
        "SELECT * FROM recharge WHERE phone = ? AND status = ? ",
        [userInfo.phone, 0]
    );

    // checking if order is open
    if (recharge.length != 0) {
        if (!Tron.validateTxhash(txHash)) {
            return res.status(200).json({
                message: "Failed. Transaction hash not valid",
                status: false,
                timeStamp: timeNow,
            });
        }

        const [usersWithSameTx] = await connection.query(
            "SELECT phone FROM recharge WHERE transaction_id = ? ",
            [txHash]
        );

        if (usersWithSameTx.length != 0) {
            return res.status(200).json({
                message: "Failed. Transaction hash already recorded",
                status: false,
                timeStamp: timeNow,
            });
        }

        await connection.execute(
            "UPDATE recharge SET transaction_id = ? WHERE phone = ? AND id_order = ? AND STATUS = 0 ",
            [txHash, userInfo.phone, recharge[0].id_order]
        );

        const data = await tron.confirmUSDTTransfer(txHash);

        if (!data.success) {
            return res.status(200).json({
                message: `Failed. ${data.message}`,
                status: false,
                timeStamp: timeNow,
            });
        }

        const amountRecieved = parseFloat(parseFloat(data.value).toFixed(2));
        const ammountTobeRecieved = parseFloat(
            parseFloat(recharge[0].money / (await Tron.getUSDTtoINR())).toFixed(
                2
            )
        );

        if (amountRecieved >= ammountTobeRecieved) {
            await giveBonusToUplink(recharge[0].money, userInfo.phone);

            // const [rechargeCount] = await connection.execute(
            //     "SELECT COUNT(*) as count FROM recharge WHERE type = 'tron' AND status = 1 AND phone = ?",
            //     [userInfo.phone]
            // );

            await connection.execute(
                "UPDATE recharge SET status = 1 WHERE phone = ? and id_order = ?",
                [userInfo.phone, recharge[0].id_order]
            );

            await connection.execute(
                "UPDATE users SET money = money + ? WHERE phone = ?",
                [recharge[0].money, userInfo.phone]
            );

            // if (rechargeCount[0].count == 0) {
            const bonus = recharge[0].money * 0.05;

            await connection.execute(
                "UPDATE users SET money = money + ? WHERE phone = ?",
                [bonus, userInfo.phone]
            );
            // }

            return res.status(200).json({
                message: "Success",
                status: true,
                timeStamp: timeNow,
            });
        } else {
            return res.status(200).json({
                message: `Failed. We didn't recieved full amount`,
                status: false,
                timeStamp: timeNow,
            });
        }
    } else {
        return res.status(200).json({
            message: "Failed. No order is open",
            status: false,
            timeStamp: timeNow,
        });
    }
};

// const initiateDidapayPayment = async (req, res) => {
//     const auth = req.cookies.auth;
//     const { name, email } = req.body;

//     if (!name || !email) {
//         return res.status(200).json({
//             message: "Failed. Missing name or email",
//             status: false,
//             timeStamp: timeNow,
//         });
//     }

//     // if (process.env.DIDAPAY_DISABLED) {
//     //     return res.status(200).json({
//     //         message: "Failed",
//     //         status: false,
//     //         serverMessage:
//     //             "Didapay payment is disables. Please cancel the order and try another payment gateway",
//     //         timeStamp: timeNow,
//     //     });
//     // }

//     const [user] = await connection.query(
//         "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
//         [auth]
//     );
//     let userInfo = user[0];
//     // checking for user authentication
//     if (!userInfo) {
//         return res.status(200).json({
//             message: "Failed. Authentication Failed",
//             status: false,
//             timeStamp: timeNow,
//         });
//     }

//     const [recharge] = await connection.query(
//         "SELECT * FROM recharge WHERE phone = ? AND status = ? ",
//         [userInfo.phone, 0]
//     );

//     // checking if order is open
//     if (recharge.length != 0) {
//         const rechargeData = recharge[0];

//         const resp = await Didapay.initiatePayment(
//             rechargeData.money,
//             rechargeData.phone,
//             name,
//             email,
//             rechargeData.id_order
//         );

//         const didapayResponse = resp.server;

//         if (
//             didapayResponse.status != "200" &&
//             didapayResponse.message != "success"
//         ) {
//             // console.log(didapayResponse);
//             return res.status(200).json({
//                 message: "Failed. Please try another payment method",
//                 status: false,
//                 serverMessage: didapayResponse.message,
//                 timeStamp: timeNow,
//             });
//         }

//         // statuses in our app
//         // 0 -> orderGenerated (client (our side))
//         // 1 -> success (money to be added to user balance)
//         // 2 -> failed
//         // we will create following status for didapay and other fiat gateways as they take time to process payment
//         // 3 -> orderGenerated (gateways side)

//         let status;

//         switch (didapayResponse.data.orderStatus) {
//             case "CREATED":
//                 status = 3;
//                 break;
//             case "FAILED":
//                 status = 2;
//                 break;
//             default:
//                 status = 2;
//                 break;
//         }

//         await connection.execute(
//             "UPDATE recharge SET status = ? WHERE phone = ? AND id_order = ? AND status = ? ",
//             [status, userInfo.phone, rechargeData.id_order, 0]
//         );

//         return res.status(200).json({
//             message: "success",
//             status: true,
//             paymentUrl: didapayResponse.data.paymentInfo,
//             timeStamp: timeNow,
//         });
//     } else {
//         return res.status(200).json({
//             message: "Failed. No order is open",
//             status: false,
//             timeStamp: timeNow,
//         });
//     }
// };

// const confirmDidapayWithdrawl = async (req, res) => {
//     console.log("didapay withdrawl notification:", req.body);
//     if (!Didapay.verify(req.body, "WITHDRAW")) {
//         return res.send("no-success");
//     }

//     const didapayData = req.body;

//     let status;

//     if (
//         didapayData.orderStatus == "CREATED" ||
//         didapayData.orderStatus == "PENDING"
//     ) {
//         status = 3;
//     } else if (didapayData.orderStatus == "SUCCESS") {
//         status = 1;
//     } else {
//         status = 2;
//     }

//     console.log("didapay withdrawl notification status:", status);

//     if (status == 1) {
//         await connection.query(
//             `UPDATE withdraw SET status = 1 WHERE id_order = ?`,
//             [didapayData.merchantOrderNo]
//         );

//         return res.send("success");
//     }

//     if (status == 2) {
//         const [userData] = await connection.query(
//             "SELECT phone FROM withdraw WHERE id_order = ? ",
//             [didapayData.merchantOrderNo]
//         );
//         const userInfo = userData[0];

//         await connection.query(
//             "UPDATE users SET money = money + ? WHERE phone = ? ",
//             [didapayData.payAmount, userInfo.phone]
//         );
//     }

//     await connection.query(
//         `UPDATE withdraw SET status = ? WHERE id_order = ?`,
//         [status, didapayData.merchantOrderNo]
//     );

//     return res.send("success");
// };

// const confirmDidapayPayment = async (req, res) => {
//     console.log("didapay payment notification:", req.body);

//     if (!Didapay.verify(req.body, "PAYMENT")) {
//         return res.send("no-success");
//     }

//     const didapayData = req.body;

//     const [recharge] = await connection.query(
//         "SELECT * FROM recharge WHERE id_order = ? AND status = ? ",
//         [didapayData.merchantOrderNo, 3]
//     );

//     // checking if order is open
//     if (recharge.length == 0) {
//         return res.send("no-success");
//     }

//     const rechargeData = recharge[0];

//     let status;

//     if (didapayData.orderStatus == "CREATED") {
//         status = 3;
//     } else if (
//         didapayData.orderStatus == "ARRIVED" ||
//         didapayData.orderStatus == "SUCCESS" ||
//         didapayData.orderStatus == "CLEARED"
//     ) {
//         status = 1;
//     } else {
//         status = 2;
//     }

//     console.log("didapay payment notification status:", status);

//     if (status == 1) {
//         await giveBonusToUplink(didapayData.factAmount, rechargeData.phone);

//         await connection.execute(
//             "UPDATE recharge SET status = 1 WHERE phone = ? and id_order = ?",
//             [rechargeData.phone, rechargeData.id_order]
//         );

//         await connection.execute(
//             "UPDATE users SET money = money + ? WHERE phone = ?",
//             [didapayData.factAmount, rechargeData.phone]
//         );

//         await giveBonus(didapayData.factAmount, rechargeData.phone);

//         return res.send("success");
//     }

//     await connection.execute(
//         "UPDATE recharge SET status = ? WHERE phone = ? and id_order = ?",
//         [status, rechargeData.phone, rechargeData.id_order]
//     );

//     return res.send("success");
// };

// const initiateWepayPayment = async (req, res) => {
//     const auth = req.cookies.auth;

//     const [user] = await connection.query(
//         "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
//         [auth]
//     );
//     let userInfo = user[0];
//     // checking for user authentication
//     if (!userInfo) {
//         return res.status(200).json({
//             message: "Failed. Authentication Failed",
//             status: false,
//             timeStamp: timeNow,
//         });
//     }

//     const [recharge] = await connection.query(
//         "SELECT * FROM recharge WHERE phone = ? AND status = ? ",
//         [userInfo.phone, 0]
//     );

//     // checking if order is open
//     if (recharge.length != 0) {
//         const rechargeData = recharge[0];

//         const data = await Wepay.initiatePayment(
//             rechargeData.money,
//             rechargeData.id_order
//         );

//         const wepayResponse = data.server;

//         if (
//             wepayResponse.code != "200" &&
//             wepayResponse.msg != "success" &&
//             !wepayResponse.success
//         ) {
//             return res.status(200).json({
//                 message: "Failed. Please try another payment method",
//                 status: false,
//                 serverMessage: wepayResponse.msg,
//                 serverDesc: wepayResponse.desc,
//                 timeStamp: timeNow,
//             });
//         }

//         if (
//             wepayResponse.data.orderNo != data.client.orderNo ||
//             rechargeData.id_order != wepayResponse.data.orderNo
//         ) {
//             return res.status(200).json({
//                 message:
//                     "Failed. order number doesnot match. Please try another payment method",
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }

//         // same as didiapay
//         // statuses in our app
//         // 0 -> orderGenerated (client (our side))
//         // 1 -> success (money to be added to user balance)
//         // 2 -> failed
//         // we will create following status for wepay and other fiat gateways as they take time to process payment
//         // 3 -> orderGenerated (gateways side)

//         await connection.execute(
//             "UPDATE recharge SET status = ? WHERE phone = ? AND id_order = ? AND status = ? ",
//             [3, userInfo.phone, rechargeData.id_order, 0]
//         );

//         return res.status(200).json({
//             message: "success",
//             status: true,
//             paymentUrl: wepayResponse.data.payUrl,
//             timeStamp: timeNow,
//         });
//     } else {
//         return res.status(200).json({
//             message: "Failed. No order is open",
//             status: false,
//             timeStamp: timeNow,
//         });
//     }
// };

// const confirmWepayWithdrawl = async (req, res) => {
//     console.log("wepay withdrawl notification:", req.body);

//     if (!Wepay.verify(req.body)) {
//         return res.send("non-success");
//     }

//     const wepayData = req.body;

//     let status;

//     switch (wepayData.payStatus) {
//         case 0:
//             status = 3;
//             break;
//         case 1:
//             status = 1;
//             break;
//         default:
//             status = 2;
//             break;
//     }

//     console.log("wepay withdrawl notification status:", status);

//     if (status == 1) {
//         await connection.query(
//             `UPDATE withdraw SET status = 1 WHERE id_order = ?`,
//             [wepayData.orderNo]
//         );

//         return res.send("success");
//     }

//     if (status == 2) {
//         const [userData] = await connection.query(
//             "SELECT phone FROM withdraw WHERE id_order = ? ",
//             [wepayData.orderNo]
//         );
//         const userInfo = userData[0];

//         await connection.query(
//             "UPDATE users SET money = money + ? WHERE phone = ? ",
//             [wepayData.amount, userInfo.phone]
//         );
//     }

//     await connection.query(
//         `UPDATE withdraw SET status = ? WHERE id_order = ?`,
//         [status, wepayData.orderNo]
//     );

//     return res.send("success");
// };

// const confirmWepayPayment = async (req, res) => {
//     console.log("wepay payment notification:", req.body);

//     if (!Wepay.verify(req.body)) {
//         return res.send("non-success");
//     }

//     const wepayData = req.body;

//     const [recharge] = await connection.query(
//         "SELECT * FROM recharge WHERE id_order = ? AND status = ? ",
//         [wepayData.orderNo, 3]
//     );

//     // checking if order is open
//     if (recharge.length == 0) {
//         return res.send("non-success");
//     }

//     const rechargeData = recharge[0];

//     let status;

//     // Payment status: 0-order generated, 1-payment successful, 2-payment failed

//     switch (wepayData.payStatus) {
//         case 0:
//             status = 3;
//             break;
//         case 1:
//             status = 1;
//             break;
//         default:
//             status = 2;
//             break;
//     }

//     console.log("wepay payment notification status:", status);

//     if (status == 1) {
//         await giveBonusToUplink(wepayData.amount, rechargeData.phone);

//         await connection.execute(
//             "UPDATE recharge SET status = 1 WHERE phone = ? and id_order = ?",
//             [rechargeData.phone, rechargeData.id_order]
//         );

//         await connection.execute(
//             "UPDATE users SET money = money + ? WHERE phone = ?",
//             [wepayData.amount, rechargeData.phone]
//         );

//         await giveBonus(wepayData.amount, rechargeData.phone);

//         return res.send("success");
//     }

//     await connection.execute(
//         "UPDATE recharge SET status = ? WHERE phone = ? and id_order = ?",
//         [status, rechargeData.phone, rechargeData.id_order]
//     );

//     return res.send("success");
// };

// const initiateAllpayPayment = async (req, res) => {
//     const auth = req.cookies.auth;

//     const [user] = await connection.query(
//         "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
//         [auth]
//     );
//     let userInfo = user[0];
//     // checking for user authentication
//     if (!userInfo) {
//         return res.status(200).json({
//             message: "Failed. Authentication Failed",
//             status: false,
//             timeStamp: timeNow,
//         });
//     }

//     const [recharge] = await connection.query(
//         "SELECT * FROM recharge WHERE phone = ? AND status = ? ",
//         [userInfo.phone, 0]
//     );

//     // checking if order is open
//     if (recharge.length != 0) {
//         const rechargeData = recharge[0];

//         const allpayResp = await Allpay.InitiatePayment(
//             rechargeData.money,
//             rechargeData.id_order
//         );

//         if (allpayResp.respCode != "SUCCESS" && allpayResp.tradeResult != "1") {
//             return res.status(200).json({
//                 message: "Failed. Please try another payment method",
//                 status: false,
//                 serverMessage: allpayResp.tradeMsg,
//                 timeStamp: timeNow,
//             });
//         }

//         if (allpayResp.mchOrderNo != rechargeData.id_order) {
//             return res.status(200).json({
//                 message:
//                     "Failed. order number doesnot match. Please try another payment method",
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }

//         // same as didiapay and wepay
//         // statuses in our app
//         // 0 -> orderGenerated (client (our side))
//         // 1 -> success (money to be added to user balance)
//         // 2 -> failed
//         // we will create following status for wepay and other fiat gateways as they take time to process payment
//         // 3 -> orderGenerated (gateways side)

//         await connection.execute(
//             "UPDATE recharge SET status = ? WHERE phone = ? AND id_order = ? AND status = ? ",
//             [3, userInfo.phone, rechargeData.id_order, 0]
//         );

//         return res.status(200).json({
//             message: "success",
//             status: true,
//             paymentUrl: allpayResp.payInfo,
//             timeStamp: timeNow,
//         });
//     } else {
//         return res.status(200).json({
//             message: "Failed. No order is open",
//             status: false,
//             timeStamp: timeNow,
//         });
//     }
// };

// const confirmAllpayPayment = async (req, res) => {
//     console.log("allpay payment notification:", req.body);

//     if (!Allpay.verify(req.body)) {
//         return res.send("non-success");
//     }

//     const allpayData = req.body;

//     const [recharge] = await connection.query(
//         "SELECT * FROM recharge WHERE id_order = ? AND status = ? ",
//         [allpayData.mchOrderNo, 3]
//     );

//     // checking if order is open
//     if (recharge.length == 0) {
//         return res.send("non-success");
//     }

//     const rechargeData = recharge[0];

//     let status;

//     // Payment status: 1 payment success, other fail

//     if (allpayData.tradeResult == "1") {
//         status = 1;
//     } else {
//         status = 2;
//     }

//     console.log("allpay payment notification status:", status);

//     if (status == 1) {
//         await giveBonusToUplink(allpayData.amount, rechargeData.phone);

//         await connection.execute(
//             "UPDATE recharge SET status = 1 WHERE phone = ? and id_order = ?",
//             [rechargeData.phone, rechargeData.id_order]
//         );

//         await connection.execute(
//             "UPDATE users SET money = money + ? WHERE phone = ?",
//             [allpayData.amount, rechargeData.phone]
//         );

//         await giveBonus(allpayData.amount, rechargeData.phone);

//         return res.send("success");
//     }

//     await connection.execute(
//         "UPDATE recharge SET status = ? WHERE phone = ? and id_order = ?",
//         [status, rechargeData.phone, rechargeData.id_order]
//     );

//     return res.send("success");
// };

// const confirmAllpayWithdrawl = async (req, res) => {
//     console.log("allpay withdrawl notification:", req.body);

//     if (!Allpay.verify(req.body, "WITHDRAW")) {
//         return res.send("non-success");
//     }

//     const allpayData = req.body;

//     let status;

//     if (allpayData.tradeResult == "1") {
//         status = 1;
//     } else {
//         status = 2;
//     }

//     console.log("allpay withdrawl notification status:", status);

//     if (status == 1) {
//         await connection.query(
//             `UPDATE withdraw SET status = 1 WHERE id_order = ?`,
//             [allpayData.merTransferId]
//         );

//         return res.send("success");
//     }

//     if (status == 2) {
//         const [userData] = await connection.query(
//             "SELECT phone FROM withdraw WHERE id_order = ? ",
//             [allpayData.merTransferId]
//         );
//         const userInfo = userData[0];

//         await connection.query(
//             "UPDATE users SET money = money + ? WHERE phone = ? ",
//             [allpayData.transferAmount, userInfo.phone]
//         );
//     }

//     await connection.query(
//         `UPDATE withdraw SET status = ? WHERE id_order = ?`,
//         [status, allpayData.merTransferId]
//     );

//     return res.send("success");
// };

// const initiateXdpayPayment = async (req, res) => {
//     const auth = req.cookies.auth;

//     const [user] = await connection.query(
//         "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
//         [auth]
//     );
//     let userInfo = user[0];
//     // checking for user authentication
//     if (!userInfo) {
//         return res.status(200).json({
//             message: "Failed. Authentication Failed",
//             status: false,
//             timeStamp: timeNow,
//         });
//     }

//     const [recharge] = await connection.query(
//         "SELECT * FROM recharge WHERE phone = ? AND status = ? ",
//         [userInfo.phone, 0]
//     );

//     if (recharge.length != 0) {
//         const rechargeData = recharge[0];

//         const xdpayResp = await xdpay.initiatePayment(
//             rechargeData.money,
//             rechargeData.id_order
//         );

//         if (
//             xdpayResp.code != "200" &&
//             xdpayResp.msg != "success" &&
//             !xdpayResp.success
//         ) {
//             return res.status(200).json({
//                 message: "Failed. Please try another payment method",
//                 status: false,
//                 serverMessage: xdpayResp.msg,
//                 serverDesc: xdpayResp.desc,
//                 timeStamp: timeNow,
//             });
//         }

//         if (rechargeData.id_order != xdpayResp.data.orderId) {
//             return res.status(200).json({
//                 message:
//                     "Failed. order number doesnot match. Please try another payment method",
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }

//         await connection.execute(
//             "UPDATE recharge SET status = ? WHERE phone = ? AND id_order = ? AND status = ? ",
//             [3, userInfo.phone, rechargeData.id_order, 0]
//         );

//         return res.status(200).json({
//             message: "success",
//             status: true,
//             paymentUrl: xdpayResp.data.url,
//             timeStamp: timeNow,
//         });
//     } else {
//         return res.status(200).json({
//             message: "Failed. No order is open",
//             status: false,
//             timeStamp: timeNow,
//         });
//     }
// };

// const confirmXdpayPayment = async (req, res) => {
//     console.log("xdpay payment notification:", req.body);

//     if (!xdpay.verify(req.body)) {
//         return res.send("non-success");
//     }

//     const xdpayData = req.body;

//     const [recharge] = await connection.query(
//         "SELECT * FROM recharge WHERE id_order = ? AND status = ? ",
//         [xdpayData.orderId, 3]
//     );

//     // checking if order is open
//     if (recharge.length == 0) {
//         return res.send("non-success");
//     }

//     const rechargeData = recharge[0];

//     let status;

//     // Payment status: 0-order generated, 1-payment successful, 2-payment failed

//     switch (xdpayData.status) {
//         case 0:
//             status = 3;
//             break;
//         case 1:
//             status = 1;
//             break;
//         default:
//             status = 2;
//             break;
//     }

//     console.log("xdpay payment notification status:", status);

//     if (status == 1) {
//         await giveBonusToUplink(xdpayData.amount, rechargeData.phone);

//         await connection.execute(
//             "UPDATE recharge SET status = 1 WHERE phone = ? and id_order = ?",
//             [rechargeData.phone, rechargeData.id_order]
//         );

//         await connection.execute(
//             "UPDATE users SET money = money + ? WHERE phone = ?",
//             [xdpayData.amount, rechargeData.phone]
//         );

//         await giveBonus(xdpayData.amount, rechargeData.phone);

//         return res.send("success");
//     }

//     await connection.execute(
//         "UPDATE recharge SET status = ? WHERE phone = ? and id_order = ?",
//         [status, rechargeData.phone, rechargeData.id_order]
//     );

//     return res.send("success");
// };

// const confirmXdpayWithdrawl = async (req, res) => {
//     console.log("xdpay withdrawl notification:", req.body);

//     if (!xdpay.verify(req.body)) {
//         return res.send("non-success");
//     }

//     const xdpayData = req.body;

//     let status;

//     switch (xdpayData.status) {
//         case 0:
//             status = 3;
//             break;
//         case 1:
//             status = 1;
//             break;
//         default:
//             status = 2;
//             break;
//     }

//     console.log("xdpay withdrawl notification status:", status);

//     if (status == 1) {
//         await connection.query(
//             `UPDATE withdraw SET status = 1 WHERE id_order = ?`,
//             [xdpayData.orderId]
//         );

//         return res.send("success");
//     }

//     if (status == 2) {
//         const [userData] = await connection.query(
//             "SELECT phone FROM withdraw WHERE id_order = ? ",
//             [xdpayData.orderId]
//         );
//         const userInfo = userData[0];

//         await connection.query(
//             "UPDATE users SET money = money + ? WHERE phone = ? ",
//             [xdpayData.amount, userInfo.phone]
//         );
//     }

//     await connection.query(
//         `UPDATE withdraw SET status = ? WHERE id_order = ?`,
//         [status, xdpayData.orderId]
//     );

//     return res.send("success");
// };

const initiateOkpayPayment = async (req, res) => {
    const auth = req.cookies.auth;

    const [user] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
        [auth]
    );
    let userInfo = user[0];
    // checking for user authentication
    if (!userInfo) {
        return res.status(200).json({
            message: "Failed. Authentication Failed",
            status: false,
            timeStamp: timeNow,
        });
    }

    const [recharge] = await connection.query(
        "SELECT * FROM recharge WHERE phone = ? AND status = ? ",
        [userInfo.phone, 0]
    );

    if (recharge.length != 0) {
        const rechargeData = recharge[0];

        const okpayResp = await Okpay.initiatePayment(
            rechargeData.money,
            rechargeData.id_order
        );

        if (okpayResp.code != 0) {
            return res.status(200).json({
                message: "Failed. Please try another payment method",
                status: false,
                serverMessage: okpayResp.msg,
                timeStamp: timeNow,
            });
        }

        // if (rechargeData.id_order != okpayResp.data.transaction_Id) {
        //     return res.status(200).json({
        //         message:
        //             "Failed. order number does not match. Please try another payment method",
        //         status: false,
        //         timeStamp: timeNow,
        //     });
        // }

        await connection.execute(
            "UPDATE recharge SET status = ? WHERE phone = ? AND id_order = ? AND status = ? ",
            [3, userInfo.phone, rechargeData.id_order, 0]
        );

        return res.status(200).json({
            message: "success",
            status: true,
            paymentUrl: okpayResp.data.url,
            timeStamp: timeNow,
        });
    } else {
        return res.status(200).json({
            message: "Failed. No order is open",
            status: false,
            timeStamp: timeNow,
        });
    }
};

const confirmOkpayPayment = async (req, res) => {
    console.log("okpay payment notification:", req.body);

    if (!Okpay.verify(req.body)) {
        return res.send("non-success");
    }

    const okpayData = req.body;

    const [recharge] = await connection.query(
        "SELECT * FROM recharge WHERE id_order = ? AND status = ? ",
        [okpayData.out_trade_no, 3]
    );

    // checking if order is open
    if (recharge.length == 0) {
        return res.send("failure");
    }

    const rechargeData = recharge[0];

    let status;

    // Payment status: 0-order generated, 1-payment successful, 2-payment failed

    switch (okpayData.status) {
        case "0":
            status = 3;
            break;
        case "1":
            status = 1;
            break;
        default:
            status = 2;
            break;
    }

    console.log("okpay payment notification status:", status);

    if (status == 1) {
        await giveBonusToUplink(okpayData.pay_money, rechargeData.phone);

        await connection.execute(
            "UPDATE recharge SET status = 1 WHERE phone = ? and id_order = ?",
            [rechargeData.phone, rechargeData.id_order]
        );

        await connection.execute(
            "UPDATE users SET money = money + ? WHERE phone = ?",
            [okpayData.pay_money, rechargeData.phone]
        );

        await giveBonus(okpayData.pay_money, rechargeData.phone);

        return res.send("success");
    }

    await connection.execute(
        "UPDATE recharge SET status = ? WHERE phone = ? and id_order = ?",
        [status, rechargeData.phone, rechargeData.id_order]
    );

    return res.send("success");
};

const confirmOkpayWithdrawl = async (req, res) => {
    console.log("okpay withdrawl notification:", req.body);

    if (!Okpay.verify(req.body)) {
        return res.send("failure");
    }

    const okpayData = req.body;

    let status;

    switch (okpayData.status) {
        case "0":
            status = 3;
            break;
        case "1":
            status = 1;
            break;
        default:
            status = 2;
            break;
    }

    console.log("okpay withdrawl notification status:", status);

    if (status == 1) {
        await connection.query(
            `UPDATE withdraw SET status = 1 WHERE id_order = ?`,
            [okpayData.out_trade_no]
        );

        return res.send("success");
    }

    if (status == 2) {
        const [userData] = await connection.query(
            "SELECT phone FROM withdraw WHERE id_order = ? ",
            [okpayData.out_trade_no]
        );
        const userInfo = userData[0];

        await connection.query(
            "UPDATE users SET money = money + ? WHERE phone = ? ",
            [okpayData.money, userInfo.phone]
        );
    }

    await connection.query(
        `UPDATE withdraw SET status = ? WHERE id_order = ?`,
        [status, okpayData.out_trade_no]
    );

    return res.send("success");
};

/**
 *
 * @param {number} rechargeAmount
 * @param {string} phone
 */
const giveBonus = async (rechargeAmount, phone) => {
    let bonus = 0;

    if (rechargeAmount >= 100_000) {
        bonus = rechargeAmount * 0.09;
    } else if (rechargeAmount >= 50_000) {
        bonus = rechargeAmount * 0.07;
    } else if (rechargeAmount >= 10_000) {
        bonus = rechargeAmount * 0.05;
    } else if (rechargeAmount >= 4_000) {
        bonus = rechargeAmount * 0.03;
    } else if (rechargeAmount >= 1_000) {
        bonus = rechargeAmount * 0.02;
    }

    await connection.execute(
        "UPDATE users SET money = money + ? WHERE phone = ?",
        [bonus, phone]
    );
};

/**
 *
 * @param {number} rechargeAmount
 * @param {string} phone
 */
const giveBonusToUplink = async (rechargeAmount, phone) => {
    const [rechargeCount] = await connection.execute(
        "SELECT COUNT(*) as count FROM recharge WHERE phone = ? AND status = 1",
        [phone]
    );

    if (rechargeCount[0].count == 0) {
        const [upLinkInvite] = await connection.execute(
            "SELECT invite FROM users WHERE phone = ?",
            [phone]
        );

        const [uplinkUser] = await connection.execute(
            "SELECT * FROM users WHERE code = ?",
            [upLinkInvite[0].invite]
        );

        if (uplinkUser.length == 0) {
            return;
        }

        const bonus = rechargeAmount * 0.1;

        await connection.execute(
            "UPDATE users SET money = money + ? WHERE phone = ?",
            [bonus, uplinkUser[0].phone]
        );
    }
};

const recharge = async (req, res) => {
    let auth = req.cookies.auth;
    let money = req.body.money;
    let type = req.body.type;
    let typeid = req.body.typeid;

    if (type != "cancel") {
        if (!auth || !money || money < 100) {
            return res.status(200).json({
                message: "Failed",
                status: false,
                timeStamp: timeNow,
            });
        }
    }
    const [user] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
        [auth]
    );
    let userInfo = user[0];
    if (!userInfo) {
        return res.status(200).json({
            message: "Failed. Authentication failure",
            status: false,
            timeStamp: timeNow,
        });
    }
    if (type == "cancel") {
        await connection.query(
            "UPDATE recharge SET status = 2 WHERE phone = ? AND id_order = ? AND status = ? ",
            [userInfo.phone, typeid, 0]
        );
        return res.status(200).json({
            message: "Cancelled order successfully",
            status: true,
            timeStamp: timeNow,
        });
    }
    const [recharge] = await connection.query(
        "SELECT * FROM recharge WHERE phone = ? AND status = ? ",
        [userInfo.phone, 0]
    );
    if (recharge.length == 0) {
        let time = new Date().getTime();
        const date = new Date();
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
        let checkTime = timerJoin(time);
        let id_time =
            date.getUTCFullYear() +
            "" +
            date.getUTCMonth() +
            1 +
            "" +
            date.getUTCDate();
        let id_order =
            Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) +
            10000000000000;
        // let vat = Math.floor(Math.random() * (2000 - 0 + 1) ) + 0;

        money = Number(money);
        let client_transaction_id = id_time + id_order;
        // const formData = {
        //     username: process.env.accountBank,
        //     secret_key: process.env.secret_key,
        //     client_transaction: client_transaction_id,
        //     amount: money,
        // };

        // our gateways
        // const validTypes = ["tron", "didapay", "wepay", "allpay", "xdpay"];
        const validTypes = ["okpay", "tron"];

        if (validTypes.includes(type)) {
            // if (type == "didapay" && process.env.DIDAPAY_DISABLED) {
            //     return res.status(200).json({
            //         message:
            //             "Didapay payment is disabled.<br> Please choose another gateway",
            //         status: false,
            //         timeStamp: timeNow,
            //     });
            // }

            if (type == "tron" && process.env.TRON_DISABLED) {
                return res.status(200).json({
                    message:
                        "USDT payment is disabled.<br> Please choose another gateway",
                    status: false,
                    timeStamp: timeNow,
                });
            }

            // if (type == "wepay" && process.env.WEPAY_DISABLED) {
            //     return res.status(200).json({
            //         message:
            //             "Wepay payment is disabled.<br> Please choose another gateway",
            //         status: false,
            //         timeStamp: timeNow,
            //     });
            // }

            // if (type == "allpay" && process.env.ALLPAY_DISABLED) {
            //     return res.status(200).json({
            //         message:
            //             "Allpay payment is disabled.<br> Please choose another gateway",
            //         status: false,
            //         timeStamp: timeNow,
            //     });
            // }

            if (type == "okpay" && process.env.OKPAY_DISABLED) {
                return res.status(200).json({
                    message:
                        "Okpay Payment gateway is disabled.<br> Please choose another one",
                    status: false,
                    timeStamp: timeNow,
                });
            }

            const sql = `INSERT INTO recharge SET 
            id_order = ?,
            transaction_id = ?,
            phone = ?,
            money = ?,
            type = ?,
            status = ?,
            today = ?,
            url = ?,
            time = ?`;
            await connection.execute(sql, [
                client_transaction_id,
                "0",
                userInfo.phone,
                money,
                type,
                0,
                checkTime,
                type, // url
                time,
            ]);
            const [recharge] = await connection.query(
                "SELECT * FROM recharge WHERE phone = ? AND status = ? ",
                [userInfo.phone, 0]
            );
            return res.status(200).json({
                message: "Order generated successfully",
                datas: recharge[0],
                status: true,
                timeStamp: timeNow,
            });
        } else {
            return res.status(200).json({
                message: "Invlid gateway",
                status: false,
                timeStamp: timeNow,
            });
        }
    }
    // following code is probably redundant :>

    //     if (type == "momo") {
    //         const sql = `INSERT INTO recharge SET
    //         id_order = ?,
    //         transaction_id = ?,
    //         phone = ?,
    //         money = ?,
    //         type = ?,
    //         status = ?,
    //         today = ?,
    //         url = ?,
    //         time = ?`;
    //         await connection.execute(sql, [
    //             client_transaction_id,
    //             "NULL",
    //             userInfo.phone,
    //             money,
    //             type,
    //             0,
    //             checkTime,
    //             "NULL",
    //             time,
    //         ]);
    //         const [recharge] = await connection.query(
    //             "SELECT * FROM recharge WHERE phone = ? AND status = ? ",
    //             [userInfo.phone, 0]
    //         );
    //         return res.status(200).json({
    //             message: "Received successfully",
    //             datas: recharge[0],
    //             status: true,
    //             timeStamp: timeNow,
    //         });
    //     }

    //     const sql = `INSERT INTO recharge SET
    //     id_order = ?,
    //     transaction_id = ?,
    //     phone = ?,
    //     money = ?,
    //     type = ?,
    //     status = ?,
    //     today = ?,
    //     url = ?,
    //     time = ?`;
    //     await connection.execute(sql, [
    //         client_transaction_id,
    //         "0",
    //         userInfo.phone,
    //         money,
    //         type,
    //         0,
    //         checkTime,
    //         "0",
    //         time,
    //     ]);
    //     const [recharge] = await connection.query(
    //         "SELECT * FROM recharge WHERE phone = ? AND status = ? ",
    //         [userInfo.phone, 0]
    //     );
    //     return res.status(200).json({
    //         message: "Successful application creation",
    //         datas: recharge[0],
    //         status: true,
    //         timeStamp: timeNow,
    //     });
    // } else {
    //     return res.status(200).json({
    //         message: "Received successfully",
    //         datas: recharge[0],
    //         status: true,
    //         timeStamp: timeNow,
    //     });
    // }
};

const addBank = async (req, res) => {
    let auth = req.cookies.auth;
    let name_bank = req.body.name_bank;
    let name_user = req.body.name_user;
    let stk = req.body.stk;
    let tp = req.body.tp;
    let email = req.body.email;
    let sdt = req.body.sdt;
    let tinh = req.body.tinh;
    let chi_nhanh = req.body.chi_nhanh;
    let time = new Date().getTime();

    if (
        !auth ||
        !name_bank ||
        !name_user ||
        !stk ||
        !tp ||
        !email ||
        !sdt ||
        !tinh ||
        !chi_nhanh
    ) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    const [user] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
        [auth]
    );
    let userInfo = user[0];
    if (!userInfo) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    const [user_bank] = await connection.query(
        "SELECT * FROM user_bank WHERE stk = ? ",
        [stk]
    );
    const [user_bank2] = await connection.query(
        "SELECT * FROM user_bank WHERE phone = ? ",
        [userInfo.phone]
    );
    if (user_bank.length == 0 && user_bank2.length == 0) {
        const sql = `INSERT INTO user_bank SET 
        phone = ?,
        name_bank = ?,
        name_user = ?,
        stk = ?,
        tp = ?,
        email = ?,
        sdt = ?,
        tinh = ?,
        chi_nhanh = ?,
        time = ?`;
        await connection.execute(sql, [
            userInfo.phone,
            name_bank,
            name_user,
            stk,
            tp,
            email,
            sdt,
            tinh,
            chi_nhanh,
            time,
        ]);
        return res.status(200).json({
            message: "Successfully added bank",
            status: true,
            timeStamp: timeNow,
        });
    } else if (user_bank.length > 0) {
        await connection.query(
            "UPDATE user_bank SET stk = ? WHERE phone = ? ",
            [stk, userInfo.phone]
        );
        return res.status(200).json({
            message: "Account number updated in the system",
            status: true,
            timeStamp: timeNow,
        });
    } else if (user_bank2.length > 0) {
        await connection.query(
            "UPDATE user_bank SET name_bank = ?, name_user = ?, stk = ?, tp = ?, email = ?, sdt = ?, tinh = ?, chi_nhanh = ?, time = ? WHERE phone = ?",
            [
                name_bank,
                name_user,
                stk,
                tp,
                email,
                sdt,
                tinh,
                chi_nhanh,
                time,
                userInfo.phone,
            ]
        );
        return res.status(200).json({
            message: "The account is updated",
            status: true,
            timeStamp: timeNow,
        });
    }
};

const addUSDTAddress = async (req, res) => {
    let auth = req.cookies.auth;

    let usdtAddress = req.body.usdtAddress;

    if (!auth || !usdtAddress) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    const [user] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
        [auth]
    );
    let userInfo = user[0];
    if (!userInfo) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }

    const [user_usdt_address] = await connection.query(
        "SELECT * FROM user_usdt_address WHERE phone = ? ",
        [userInfo.phone]
    );

    if (user_usdt_address.length == 0) {
        const sql = `INSERT INTO user_usdt_address SET 
        phone = ?,
        usdt_address = ?`;
        await connection.execute(sql, [userInfo.phone, usdtAddress]);
        return res.status(200).json({
            message: "Successfully added tron usdt address",
            status: true,
            timeStamp: timeNow,
        });
    } else {
        await connection.query(
            "UPDATE user_usdt_address SET usdt_address = ? WHERE phone = ? ",
            [usdtAddress, userInfo.phone]
        );
        return res.status(200).json({
            message: "Successfully updated tron usdt address",
            status: true,
            timeStamp: timeNow,
        });
    }
};

const infoUserBank = async (req, res) => {
    let auth = req.cookies.auth;
    if (!auth) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    const [user] = await connection.query(
        "SELECT `phone`, `code`,`invite`, `money` FROM users WHERE `token` = ? ",
        [auth]
    );
    let userInfo = user[0];
    if (!user) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
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
    let date = new Date().getTime();
    let checkTime = timerJoin(date);
    const [recharge] = await connection.query(
        "SELECT * FROM recharge WHERE phone = ? AND today = ? AND status = 1 ",
        [userInfo.phone, checkTime]
    );
    const [minutes_1] = await connection.query(
        "SELECT * FROM minutes_1 WHERE phone = ? AND today = ? ",
        [userInfo.phone, checkTime]
    );
    let total = 0;
    recharge.forEach((data) => {
        total += data.money;
    });
    let total2 = 0;
    minutes_1.forEach((data) => {
        total2 += data.money;
    });

    let result = 0;
    if (total - total2 > 0) result = total - total2;

    const [userBank] = await connection.query(
        "SELECT * FROM user_bank WHERE phone = ? ",
        [userInfo.phone]
    );

    const [user_usdt_address] = await connection.query(
        "SELECT * FROM user_usdt_address WHERE phone = ? ",
        [userInfo.phone]
    );

    return res.status(200).json({
        message: "Received successfully",
        datas: userBank,
        usdtAddress: user_usdt_address,
        userInfo: user,
        result: result,
        status: true,
        timeStamp: timeNow,
    });
};

const withdrawal3 = async (req, res) => {
    let auth = req.cookies.auth;
    let money = req.body.money;
    let password = req.body.password;
    const type = req.body.type;

    if (!auth || !money || !password || !type || money < 300) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }

    const [user] = await connection.query(
        "SELECT `phone`, `code`,`invite`, `money` FROM users WHERE `token` = ? AND password = ?",
        [auth, md5(password)]
    );

    if (user.length == 0) {
        return res.status(200).json({
            message: "incorrect password",
            status: false,
            timeStamp: timeNow,
        });
    }
    let userInfo = user[0];
    const [rechargeInfo] = await connection.query(
        "SELECT SUM(money) AS totalRecharge FROM recharge WHERE phone = ? AND status = 1",
        [userInfo.phone]
    );
    const [BetInfoWingo] = await connection.query(
        "SELECT SUM(money + fee) AS totalWingoBet FROM minutes_1 WHERE phone = ?",
        [userInfo.phone]
    );
    const [betInfo5d] = await connection.query(
        "SELECT SUM(money + fee) AS total5dBet FROM result_5d WHERE phone = ?",
        [userInfo.phone]
    );
    const totalRecharge = Number(rechargeInfo[0].totalRecharge);
    const totalBet = BetInfoWingo[0].totalWingoBet + betInfo5d[0].total5dBet;
    if (totalRecharge < 100) {
        return res.status(200).json({
            message: "Please recharge at least 500",
            status: false,
            timeStamp: timeNow,
        });
    }
    if (totalBet < totalRecharge * 3) {
        return res.status(200).json({
            message: `Please bet at least ${totalRecharge * 3 - totalBet} more`,
            status: false,
            timeStamp: timeNow,
        });
    }
    const date = new Date();
    let id_time =
        date.getUTCFullYear() +
        "" +
        date.getUTCMonth() +
        1 +
        "" +
        date.getUTCDate();
    let id_order =
        Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) +
        10000000000000;

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
    let dates = new Date().getTime();
    let checkTime = timerJoin(dates);
    // const [recharge] = await connection.query(
    //     "SELECT * FROM recharge WHERE phone = ? AND today = ? AND status = 1 ",
    //     [userInfo.phone, checkTime]
    // );
    const [recharge] = await connection.query(
        "SELECT * FROM recharge WHERE phone = ? AND status = 1 ",
        [userInfo.phone]
    );
    // const [minutes_1] = await connection.query(
    //     "SELECT * FROM minutes_1 WHERE phone = ? AND today = ? ",
    //     [userInfo.phone, checkTime]
    // );
    // TODO: Include bets from other games (other than wingo) to calculate the total bet

    const [minutes_1] = await connection.query(
        "SELECT * FROM minutes_1 WHERE phone = ?",
        [userInfo.phone]
    );
    // total amount recharged today
    let total = 0;
    recharge.forEach((data) => {
        total += data.money;
    });
    // total bet today (i guess)
    let total2 = 0;
    minutes_1.forEach((data) => {
        total2 += data.money;
    });

    let result = 0;
    // if (total - total2 > 0) result = total - total2;
    if (total >= total2) result = total - total2;

    const [user_bank] = await connection.query(
        "SELECT * FROM user_bank WHERE `phone` = ?",
        [userInfo.phone]
    );
    const [user_usdt_address] = await connection.query(
        "SELECT * FROM user_usdt_address WHERE `phone` = ?",
        [userInfo.phone]
    );

    const [withdraw] = await connection.query(
        "SELECT * FROM withdraw WHERE `phone` = ? AND today = ?",
        [userInfo.phone, checkTime]
    );
    const [withdraw_usdt] = await connection.query(
        "SELECT * FROM withdraw_usdt WHERE `phone` = ? AND today = ?",
        [userInfo.phone, checkTime]
    );

    const totalWithdrawlsToday = withdraw.length + withdraw_usdt.length;

    if (type == "usdt") {
        if (user_usdt_address.length != 0) {
            if (totalWithdrawlsToday < 3) {
                if (userInfo.money - money >= 0) {
                    if (result == 0) {
                        let fee = 0;
                        if (money < 10000) {
                            fee = money * 0.05;
                        }
                        let money1 = money - fee;
                        let infoUsdtAddress = user_usdt_address[0];
                        const sql = `INSERT INTO withdraw_usdt SET 
                    id_order = ?,
                    phone = ?,
                    usdt_address = ?,
                    money = ?,
                    status = ?,
                    today = ?,
                    time = ?`;
                        await connection.execute(sql, [
                            id_time + "" + id_order,
                            userInfo.phone,
                            infoUsdtAddress.usdt_address,
                            money1,
                            0,
                            checkTime,
                            dates,
                        ]);
                        await connection.query(
                            "UPDATE users SET money = money - ? WHERE phone = ? ",
                            [money, userInfo.phone]
                        );
                        return res.status(200).json({
                            message: "Withdrawal successfull",
                            status: true,
                            money: userInfo.money - money,
                            timeStamp: timeNow,
                        });
                    } else {
                        return res.status(200).json({
                            message:
                                "The total bet is not enough. Bet more " +
                                result,
                            status: false,
                            timeStamp: timeNow,
                        });
                    }
                } else {
                    return res.status(200).json({
                        message:
                            "The balance is not enough to fulfill the request",
                        status: false,
                        timeStamp: timeNow,
                    });
                }
            } else {
                return res.status(200).json({
                    message: "You can only make 3 withdrawals per day",
                    status: false,
                    timeStamp: timeNow,
                });
            }
        } else {
            return res.status(200).json({
                message: "Please link your tron usdt address first",
                status: false,
                timeStamp: timeNow,
            });
        }
    }

    if (user_bank.length != 0) {
        if (totalWithdrawlsToday < 3) {
            if (userInfo.money - money >= 0) {
                if (result == 0) {
                    let fee = 0;
                    if (money < 10000) {
                        fee = money * 0.05;
                    }
                    let money1 = money - fee;
                    let infoBank = user_bank[0];
                    const sql = `INSERT INTO withdraw SET 
                    id_order = ?,
                    phone = ?,
                    money = ?,
                    stk = ?,
                    name_bank = ?,
                    user_email = ?,
                    ifsc = ?,
                    name_user = ?,
                    user_bank_phone = ?,
                    status = ?,
                    today = ?,
                    time = ?`;
                    await connection.execute(sql, [
                        id_time + "" + id_order,
                        userInfo.phone,
                        money1,
                        infoBank.stk,
                        infoBank.name_bank,
                        infoBank.email,
                        infoBank.sdt,
                        infoBank.name_user,
                        infoBank.tinh,
                        0,
                        checkTime,
                        dates,
                    ]);
                    await connection.query(
                        "UPDATE users SET money = money - ? WHERE phone = ? ",
                        [money, userInfo.phone]
                    );
                    return res.status(200).json({
                        message: "Withdrawal successfull",
                        status: true,
                        money: userInfo.money - money,
                        timeStamp: timeNow,
                    });
                } else {
                    return res.status(200).json({
                        message:
                            "The total bet is not enough. Bet more " + result,
                        status: false,
                        timeStamp: timeNow,
                    });
                }
            } else {
                return res.status(200).json({
                    message: "The balance is not enough to fulfill the request",
                    status: false,
                    timeStamp: timeNow,
                });
            }
        } else {
            return res.status(200).json({
                message: "You can only make 3 withdrawals per day",
                status: false,
                timeStamp: timeNow,
            });
        }
    } else {
        return res.status(200).json({
            message: "Please link your bank first",
            status: false,
            timeStamp: timeNow,
        });
    }
};

const recharge2 = async (req, res) => {
    let auth = req.cookies.auth;
    let money = req.body.money;
    if (!auth) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    const [user] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
        [auth]
    );
    let userInfo = user[0];
    if (!userInfo) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    const [recharge] = await connection.query(
        "SELECT * FROM recharge WHERE phone = ? AND status = ? ",
        [userInfo.phone, 0]
    );
    const [bank_recharge] = await connection.query(
        "SELECT * FROM bank_recharge"
    );
    if (recharge.length != 0) {
        return res.status(200).json({
            message: "Received successfully",
            datas: recharge[0],
            infoBank: bank_recharge,
            status: true,
            timeStamp: timeNow,
        });
    } else {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
};

const listRecharge = async (req, res) => {
    let auth = req.cookies.auth;
    if (!auth) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    const [user] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
        [auth]
    );
    let userInfo = user[0];
    if (!user) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    const [recharge] = await connection.query(
        "SELECT * FROM recharge WHERE phone = ? ORDER BY id DESC ",
        [userInfo.phone]
    );
    return res.status(200).json({
        message: "Receive success",
        datas: recharge,
        status: true,
        timeStamp: timeNow,
    });
};

const search = async (req, res) => {
    let auth = req.cookies.auth;
    let phone = req.body.phone;
    if (!auth) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    const [user] = await connection.query(
        "SELECT `phone`, `code`,`invite`, `level` FROM users WHERE `token` = ? ",
        [auth]
    );
    if (user.length == 0) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    let userInfo = user[0];
    if (userInfo.level == 1) {
        const [users] = await connection.query(
            `SELECT * FROM users WHERE phone = ? ORDER BY id DESC `,
            [phone]
        );
        return res.status(200).json({
            message: "Receive success",
            datas: users,
            status: true,
            timeStamp: timeNow,
        });
    } else if (userInfo.level == 2) {
        const [users] = await connection.query(
            `SELECT * FROM users WHERE phone = ? ORDER BY id DESC `,
            [phone]
        );
        if (users.length == 0) {
            return res.status(200).json({
                message: "Receive success",
                datas: [],
                status: true,
                timeStamp: timeNow,
            });
        } else {
            if (users[0].ctv == userInfo.phone) {
                return res.status(200).json({
                    message: "Receive success",
                    datas: users,
                    status: true,
                    timeStamp: timeNow,
                });
            } else {
                return res.status(200).json({
                    message: "Failed",
                    status: false,
                    timeStamp: timeNow,
                });
            }
        }
    } else {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
};

const listWithdraw = async (req, res) => {
    let auth = req.cookies.auth;
    if (!auth) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    const [user] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
        [auth]
    );
    let userInfo = user[0];
    if (!user) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    const [recharge] = await connection.query(
        "SELECT * FROM withdraw WHERE phone = ? ORDER BY id DESC ",
        [userInfo.phone]
    );
    const [usdtWithdrawl] = await connection.query(
        "SELECT * FROM withdraw_usdt WHERE phone = ? ORDER BY id DESC ",
        [userInfo.phone]
    );

    const data = [...recharge, ...usdtWithdrawl];

    return res.status(200).json({
        message: "Receive success",
        datas: data,
        status: true,
        timeStamp: timeNow,
    });
};

const useRedenvelope = async (req, res) => {
    let auth = req.cookies.auth;
    let code = req.body.code;
    if (!auth || !code) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    const [user] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
        [auth]
    );
    let userInfo = user[0];
    if (!user) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    const [redenvelopes] = await connection.query(
        "SELECT * FROM redenvelopes WHERE id_redenvelope = ?",
        [code]
    );

    if (redenvelopes.length == 0) {
        return res.status(200).json({
            message: "Invalid gift code",
            status: false,
            timeStamp: timeNow,
        });
    } else {
        let infoRe = redenvelopes[0];
        const d = new Date();
        const time = d.getTime();

        const [usedRedenvelopes] = await connection.query(
            "SELECT * FROM redenvelopes_used WHERE id_redenvelops = ? AND phone_used = ?",
            [code, userInfo.phone]
        );

        if (usedRedenvelopes.length > 0) {
            return res.status(200).json({
                message: "Gift code already used",
                status: false,
                timeStamp: timeNow,
            });
        }

        await connection.query(
            "UPDATE redenvelopes SET used = ?, status = ? WHERE `id_redenvelope` = ? ",
            [0, 1, infoRe.id_redenvelope]
        );
        await connection.query(
            "UPDATE users SET money = money + ? WHERE `phone` = ? ",
            [infoRe.money, userInfo.phone]
        );
        let sql =
            "INSERT INTO redenvelopes_used SET phone = ?, phone_used = ?, id_redenvelops = ?, money = ?, `time` = ? ";
        await connection.query(sql, [
            infoRe.phone,
            userInfo.phone,
            infoRe.id_redenvelope,
            infoRe.money,
            time,
        ]);
        return res.status(200).json({
            message: `Received successfully +${infoRe.money}`,
            status: true,
            timeStamp: timeNow,
        });

        // if (infoRe.status == 0) {
        //     await connection.query(
        //         "UPDATE redenvelopes SET used = ?, status = ? WHERE `id_redenvelope` = ? ",
        //         [0, 1, infoRe.id_redenvelope]
        //     );
        //     await connection.query(
        //         "UPDATE users SET money = money + ? WHERE `phone` = ? ",
        //         [infoRe.money, userInfo.phone]
        //     );
        //     let sql =
        //         "INSERT INTO redenvelopes_used SET phone = ?, phone_used = ?, id_redenvelops = ?, money = ?, `time` = ? ";
        //     await connection.query(sql, [
        //         infoRe.phone,
        //         userInfo.phone,
        //         infoRe.id_redenvelope,
        //         infoRe.money,
        //         time,
        //     ]);
        //     return res.status(200).json({
        //         message: `Received successfully +${infoRe.money}`,
        //         status: true,
        //         timeStamp: timeNow,
        //     });
        // } else {
        //     return res.status(200).json({
        //         message: "Gift code already used",
        //         status: false,
        //         timeStamp: timeNow,
        //     });
        // }
    }
};

const callback_bank = async (req, res) => {
    let transaction_id = req.body.transaction_id;
    let client_transaction_id = req.body.client_transaction_id;
    let amount = req.body.amount;
    let requested_datetime = req.body.requested_datetime;
    let expired_datetime = req.body.expired_datetime;
    let payment_datetime = req.body.payment_datetime;
    let status = req.body.status;
    if (!transaction_id) {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
    if (status == 2) {
        await connection.query(
            `UPDATE recharge SET status = 1 WHERE id_order = ?`,
            [client_transaction_id]
        );
        const [info] = await connection.query(
            `SELECT * FROM recharge WHERE id_order = ?`,
            [client_transaction_id]
        );
        await connection.query(
            "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ? ",
            [info[0].money, info[0].money, info[0].phone]
        );
        return res.status(200).json({
            message: 0,
            status: true,
        });
    } else {
        await connection.query(`UPDATE recharge SET status = 2 WHERE id = ?`, [
            id,
        ]);

        return res.status(200).json({
            message: "Cancellation successful",
            status: true,
            datas: recharge,
        });
    }
};

const updateRecharge = async (req, res) => {
    let auth = req.cookies.auth;
    let money = req.body.money;
    let order_id = req.body.id_order;
    let data = req.body.inputData;

    // if (type != 'upi') {
    //     if (!auth || !money || money < 300) {
    //         return res.status(200).json({
    //             message: 'upi failed',
    //             status: false,
    //             timeStamp: timeNow,
    //         })
    //     }
    // }
    const [user] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
        [auth]
    );
    let userInfo = user[0];
    if (!user) {
        return res.status(200).json({
            message: "user not found",
            status: false,
            timeStamp: timeNow,
        });
    }
    const [utr] = await connection.query(
        "SELECT * FROM recharge WHERE `utr` = ? ",
        [data]
    );
    let utrInfo = utr[0];

    if (!utrInfo) {
        await connection.query(
            "UPDATE recharge SET utr = ? WHERE phone = ? AND id_order = ?",
            [data, userInfo.phone, order_id]
        );
        return res.status(200).json({
            message: "UTR updated",
            status: true,
            timeStamp: timeNow,
        });
    } else {
        return res.status(200).json({
            message: "UTR is already in use",
            status: false,
            timeStamp: timeNow,
        });
    }
};

const createJiliAccount = async (phone) => {
    const jiliAccount = "jili_indusclub_" + phone;

    const jiliUser = new Jili(jiliAccount);

    const result = await jiliUser.createAccount();

    if (result.success && result.data.ErrorCode == 0) {
        await connection.query(
            "UPDATE users SET jili_account = ? WHERE phone = ?",
            [jiliAccount, phone]
        );

        return {
            status: true,
            message: "",
        };
    } else if (result.data.Message == "Member already exist") {
        await connection.query(
            "UPDATE users SET jili_account = ? WHERE phone = ?",
            [jiliAccount, phone]
        );

        return {
            status: true,
            message: "",
        };
    } else {
        return {
            status: false,
            message: result.data,
        };
    }
};

const initJili = async (req, res) => {
    let auth = req.cookies.auth;

    const [user] = await connection.query(
        "SELECT `phone`, `code`, `invite`, `jili_account`  FROM users WHERE `token` = ? ",
        [auth]
    );

    let userInfo = user[0];

    if (!userInfo) {
        return res.status(200).json({
            message: "Failed. Authentication failure",
            status: false,
            timeStamp: timeNow,
        });
    }

    if (!userInfo.jili_account) {
        const result = await createJiliAccount(userInfo.phone);

        if (result.status) {
            return res.status(200).json({
                message: "Success",
                status: true,
                timeStamp: timeNow,
            });
        } else {
            return res.status(200).json({
                message: "Failed",
                status: false,
                timeStamp: timeNow,
            });
        }
    } else {
        return res.status(200).json({
            message: "Success",
            status: true,
            timeStamp: timeNow,
        });
    }
};

const getJiliAccountInfo = async (req, res) => {
    let auth = req.cookies.auth;

    const [user] = await connection.query(
        "SELECT `phone`, `code`, `invite`, `jili_account`  FROM users WHERE `token` = ? ",
        [auth]
    );

    let userInfo = user[0];

    if (!userInfo) {
        return res.status(200).json({
            message: "Failed. Authentication failure",
            status: false,
            timeStamp: timeNow,
        });
    }

    if (!userInfo.jili_account) {
        const result = await createJiliAccount(userInfo.phone);

        if (!result.status) {
            return res.status(200).json({
                message: "Failed",
                status: false,
                timeStamp: timeNow,
            });
        }
    }

    const jiliUser = new Jili(userInfo.jili_account);

    const result = await jiliUser.getAccountInfo();

    if (result.success && result.data.ErrorCode == 0) {
        return res.status(200).json({
            message: result.data,
            status: true,
            timeStamp: timeNow,
        });
    } else {
        return res.status(200).json({
            message: result.data,
            status: false,
            timeStamp: timeNow,
        });
    }
};

const depositJiliBalance = async (req, res) => {
    let auth = req.cookies.auth;
    const amount = Math.floor(Number(req.body.amount));

    const [user] = await connection.query(
        "SELECT `phone`, `code`, `invite`, `jili_account`, `money` FROM users WHERE `token` = ? ",
        [auth]
    );

    let userInfo = user[0];

    if (!userInfo) {
        return res.status(200).json({
            message: "Failed. Authentication failure",
            status: false,
            timeStamp: timeNow,
        });
    }

    if (userInfo.money < amount) {
        return res.status(200).json({
            message: "Insufficient balance",
            status: false,
            timeStamp: timeNow,
        });
    }

    const [rechargeInfo] = await connection.query(
        "SELECT SUM(money) AS totalRecharge FROM recharge WHERE phone = ? AND status = 1",
        [userInfo.phone]
    );
    if (rechargeInfo[0].totalRecharge < 1000) {
        return res.status(200).json({
            message: "Please recharge at least 1000",
            status: false,
            timeStamp: timeNow,
        });
    }

    if (!userInfo.jili_account) {
        const result = await createJiliAccount(userInfo.phone);

        if (!result.status) {
            return res.status(200).json({
                message: "Failed",
                status: false,
                timeStamp: timeNow,
            });
        }
    }

    const jiliUser = new Jili(userInfo.jili_account);

    const result = await jiliUser.balanceTransfer(true, amount);

    if (
        result.success &&
        result.data.ErrorCode == 0 &&
        result.data.Data.Status == 1
    ) {
        await connection.query(
            "UPDATE `users` SET `money` = `money` - ? WHERE `token` = ? ",
            [amount, auth]
        );

        return res.status(200).json({
            message: "Success",
            data: result.data.Data,
            mainBalance: userInfo.money - amount,
            status: true,
            timeStamp: timeNow,
        });
    } else {
        return res.status(200).json({
            message: result.data.Message,
            data: result,
            status: false,
            timeStamp: timeNow,
        });
    }
};

const withdrawJiliBalance = async (req, res) => {
    let auth = req.cookies.auth;
    const amount = Number(req.body.amount);

    const [user] = await connection.query(
        "SELECT `phone`, `code`, `invite`, `jili_account`, `money` FROM users WHERE `token` = ? ",
        [auth]
    );

    let userInfo = user[0];

    if (!userInfo) {
        return res.status(200).json({
            message: "Failed. Authentication failure",
            status: false,
            timeStamp: timeNow,
        });
    }

    if (!userInfo.jili_account) {
        const result = await createJiliAccount(userInfo.phone);

        if (!result.status) {
            return res.status(200).json({
                message: "Failed",
                status: false,
                timeStamp: timeNow,
            });
        }
    }

    const jiliUser = new Jili(userInfo.jili_account);

    const result = await jiliUser.balanceTransfer(false, amount);

    if (
        result.success &&
        result.data.ErrorCode == 0 &&
        result.data.Data.Status == 1
    ) {
        await connection.query(
            "UPDATE `users` SET `money` = `money` + ? WHERE `token` = ? ",
            [amount, auth]
        );

        return res.status(200).json({
            message: "Success",
            data: result.data.Data,
            mainBalance: userInfo.money + amount,
            status: true,
            timeStamp: timeNow,
        });
    } else {
        return res.status(200).json({
            message: result.data.Message,
            data: result,
            status: false,
            timeStamp: timeNow,
        });
    }
};

const loginJili = async (req, res) => {
    let auth = req.cookies.auth;
    const gameId = Number(req.body.gameId);

    const [user] = await connection.query(
        "SELECT `phone`, `code`, `invite`, `jili_account`, `money` FROM users WHERE `token` = ? ",
        [auth]
    );

    let userInfo = user[0];

    if (!userInfo) {
        return res.status(200).json({
            message: "Failed. Authentication failure",
            status: false,
            timeStamp: timeNow,
        });
    }

    if (!userInfo.jili_account) {
        const result = await createJiliAccount(userInfo.phone);

        if (!result.status) {
            return res.status(200).json({
                message: "Failed",
                status: false,
                timeStamp: timeNow,
            });
        }
    }

    const jiliUser = new Jili(userInfo.jili_account);

    const result = await jiliUser.login(gameId);

    if (result.success && result.data.ErrorCode == 0) {
        return res.status(200).json({
            message: "Success",
            data: result.data.Data,
            status: true,
            timeStamp: timeNow,
        });
    } else {
        return res.status(200).json({
            message: result.data.Message,
            data: result,
            status: false,
            timeStamp: timeNow,
        });
    }
};

const initKingmaker = async (req, res) => {
    let auth = req.cookies.auth;

    const ipAddress = req.headers["x-forwarded-for"] || req.ip;

    const [user] = await connection.query(
        "SELECT `phone`, `code`, `invite`, `name_user`, `kingmaker_account`  FROM users WHERE `token` = ? ",
        [auth]
    );

    let userInfo = user[0];

    if (!userInfo) {
        return res.status(200).json({
            message: "Failed. Authentication failure",
            status: false,
            timeStamp: timeNow,
        });
    }

    const result = await authorizeKingmakerAccount(
        userInfo.phone,
        ipAddress,
        userInfo.name_user
    );

    if (result.status) {
        return res.status(200).json({
            message: "Success",
            status: true,
            timeStamp: timeNow,
        });
    } else {
        return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
        });
    }
};

/**
 * Authorized kingmaker account
 * @param {string} phone phone number
 * @param {string} userip user ip
 * @param {string} username username
 * @returns {Promise<{status: boolean, message: string, kingmakerUser: Kingmaker}>}
 */
const authorizeKingmakerAccount = async (phone, userip, username) => {
    const kingmakerUserid = "kingmaker_indusclub_" + phone;

    const kingmakerUser = new Kingmaker(userip, username, kingmakerUserid);

    const result = await kingmakerUser.authorize();

    if (result.success) {
        await connection.query(
            "UPDATE users SET kingmaker_account = ? WHERE phone = ?",
            [kingmakerUserid, phone]
        );

        return {
            status: true,
            message: "",
            kingmakerUser: kingmakerUser,
        };
    } else if (result.success) {
        return {
            status: true,
            message: "",
            kingmakerUser: kingmakerUser,
        };
    } else {
        return {
            status: false,
            message: result.data,
            kingmakerUser: null,
        };
    }
};

const getKingmakerBalance = async (req, res) => {
    let auth = req.cookies.auth;

    const ipAddress = req.headers["x-forwarded-for"] || req.ip;

    const [user] = await connection.query(
        "SELECT `phone`, `code`, `invite`, `kingmaker_account`, `name_user`  FROM users WHERE `token` = ? ",
        [auth]
    );

    let userInfo = user[0];

    if (!userInfo) {
        return res.status(200).json({
            message: "Failed. Authentication failure",
            status: false,
            timeStamp: timeNow,
        });
    }

    if (!userInfo.kingmaker_account) {
        await authorizeKingmakerAccount(
            userInfo.phone,
            ipAddress,
            userInfo.name_user
        );
    }

    const result = await Kingmaker.getBalance(userInfo.kingmaker_account);

    if (result.success) {
        return res.status(200).json({
            message: result.data,
            status: true,
            timeStamp: timeNow,
        });
    } else {
        return res.status(200).json({
            message: result.data,
            status: false,
            timeStamp: timeNow,
        });
    }
};

const depositKingmakerBalance = async (req, res) => {
    let auth = req.cookies.auth;
    const amount = Math.floor(Number(req.body.amount));

    const ipAddress = req.headers["x-forwarded-for"] || req.ip;

    const [user] = await connection.query(
        "SELECT `phone`, `code`, `invite`, `kingmaker_account`, `name_user`, `money` FROM users WHERE `token` = ? ",
        [auth]
    );

    let userInfo = user[0];

    if (!userInfo) {
        return res.status(200).json({
            message: "Failed. Authentication failure",
            status: false,
            timeStamp: timeNow,
        });
    }

    if (!amount || amount <= 0) {
        return res.status(200).json({
            message: "Invalid amount",
            status: false,
            timeStamp: timeNow,
        });
    }

    if (userInfo.money < amount) {
        return res.status(200).json({
            message: "Insufficient balance",
            status: false,
            timeStamp: timeNow,
        });
    }

    const [rechargeInfo] = await connection.query(
        "SELECT SUM(money) AS totalRecharge FROM recharge WHERE phone = ? AND status = 1",
        [userInfo.phone]
    );

    if (rechargeInfo[0].totalRecharge < 1000) {
        return res.status(200).json({
            message: "Please recharge at least 1000",
            status: false,
            timeStamp: timeNow,
        });
    }

    if (!userInfo.kingmaker_account) {
        await authorizeKingmakerAccount(
            userInfo.phone,
            ipAddress,
            userInfo.name_user
        );
    }

    const result = await Kingmaker.credit(userInfo.kingmaker_account, amount);

    if (result.success) {
        await connection.query(
            "UPDATE `users` SET `money` = `money` - ? WHERE `token` = ? ",
            [amount, auth]
        );

        return res.status(200).json({
            message: "Success",
            data: result.data,
            mainBalance: userInfo.money - amount,
            status: true,
            timeStamp: timeNow,
        });
    } else {
        return res.status(200).json({
            message: result.data.Message,
            data: result,
            status: false,
            timeStamp: timeNow,
        });
    }
};

const withdrawKingmakerBalance = async (req, res) => {
    let auth = req.cookies.auth;
    const amount = Math.floor(Number(req.body.amount));

    const ipAddress = req.headers["x-forwarded-for"] || req.ip;

    const [user] = await connection.query(
        "SELECT `phone`, `code`, `invite`, `kingmaker_account`, `name_user`, `money` FROM users WHERE `token` = ? ",
        [auth]
    );

    let userInfo = user[0];

    if (!userInfo) {
        return res.status(200).json({
            message: "Failed. Authentication failure",
            status: false,
            timeStamp: timeNow,
        });
    }

    if (!amount || amount <= 0) {
        return res.status(200).json({
            message: "Invalid amount",
            status: false,
            timeStamp: timeNow,
        });
    }

    if (!userInfo.kingmaker_account) {
        await authorizeKingmakerAccount(
            userInfo.phone,
            ipAddress,
            userInfo.name_user
        );
    }

    const result = await Kingmaker.debit(userInfo.kingmaker_account, amount);

    if (result.success) {
        await connection.query(
            "UPDATE `users` SET `money` = `money` + ? WHERE `token` = ? ",
            [amount, auth]
        );

        return res.status(200).json({
            message: "Success",
            data: result.data,
            mainBalance: userInfo.money + amount,
            status: true,
            timeStamp: timeNow,
        });
    } else {
        return res.status(200).json({
            message: result.data.Message,
            data: result,
            status: false,
            timeStamp: timeNow,
        });
    }
};

const lauchKingmakerGame = async (req, res) => {
    let auth = req.cookies.auth;
    const gamecode = req.body.gameId;

    const ipAddress = req.headers["x-forwarded-for"] || req.ip;

    const [user] = await connection.query(
        "SELECT `phone`, `code`, `invite`, `kingmaker_account`, `name_user`, `money` FROM users WHERE `token` = ? ",
        [auth]
    );

    let userInfo = user[0];

    if (!userInfo) {
        return res.status(200).json({
            message: "Failed. Authentication failure",
            status: false,
            timeStamp: timeNow,
        });
    }

    const authResult = await authorizeKingmakerAccount(
        userInfo.phone,
        ipAddress,
        userInfo.name_user
    );

    if (!authResult.kingmakerUser) {
        return res.status(200).json({
            message: "Failed",
            data: null,
            status: false,
            timeStamp: timeNow,
        });
    }

    const result = await authResult.kingmakerUser.launchGame(gamecode);

    if (result.success) {
        return res.status(200).json({
            message: "Success",
            data: result.data,
            status: true,
            timeStamp: timeNow,
        });
    } else {
        return res.status(200).json({
            message: "Failed",
            data: result,
            status: false,
            timeStamp: timeNow,
        });
    }
};

const exp = {
    userInfo,
    changeUser,
    promotion,
    myTeam,
    currentUSDTPrice,
    confirmUSDTTransaction,
    // initiateDidapayPayment,
    // confirmDidapayPayment,
    // confirmDidapayWithdrawl,
    // initiateWepayPayment,
    // confirmWepayPayment,
    // confirmWepayWithdrawl,
    // initiateAllpayPayment,
    // confirmAllpayPayment,
    // confirmAllpayWithdrawl,
    // initiateXdpayPayment,
    // confirmXdpayPayment,
    // confirmXdpayWithdrawl,
    initiateOkpayPayment,
    confirmOkpayPayment,
    confirmOkpayWithdrawl,
    recharge,
    recharge2,
    listRecharge,
    listWithdraw,
    changePassword,
    checkInHandling,
    infoUserBank,
    addBank,
    addUSDTAddress,
    withdrawal3,
    callback_bank,
    listMyTeam,
    verifyCode,
    useRedenvelope,
    search,
    updateRecharge,
    initJili,
    getJiliAccountInfo,
    depositJiliBalance,
    withdrawJiliBalance,
    loginJili,
    initKingmaker,
    getKingmakerBalance,
    depositKingmakerBalance,
    withdrawKingmakerBalance,
    lauchKingmakerGame,
};

export default exp;
