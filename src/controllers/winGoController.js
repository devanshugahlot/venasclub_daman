import connection from "../config/connectDB.js";
import jwt from "jsonwebtoken";
import md5 from "md5";
import e from "express";
// require("dotenv").config();
import dotenv from "dotenv";
dotenv.config();

const winGoPage = async (req, res) => {
    return res.render("bet/wingo/win.ejs");
};

const winGoPage3 = async (req, res) => {
    return res.render("bet/wingo/win3.ejs");
};

const winGoPage5 = async (req, res) => {
    return res.render("bet/wingo/win5.ejs");
};

const winGoPage10 = async (req, res) => {
    return res.render("bet/wingo/win10.ejs");
};

const isNumber = (params) => {
    let pattern = /^[0-9]*\d$/;
    return pattern.test(params);
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
        date = new Date();
    }
    let years = formateT(date.getFullYear());
    let months = formateT(date.getMonth() + 1);
    let days = formateT(date.getDate());

    let hours = formateT(date.getHours());
    let minutes = formateT(date.getMinutes());
    let seconds = formateT(date.getSeconds());
    return (
        years +
        "-" +
        months +
        "-" +
        days +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds
    );
}

const rosesPlus = async (auth, money) => {
    const [level] = await connection.query("SELECT * FROM level ");

    const [user] = await connection.query(
        "SELECT `phone`, `code`, `invite`, `vip_level` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ",
        [auth]
    );

    let userInfo = user[0];
    let level0 = level[0];

    const [f1] = await connection.query(
        "SELECT `phone`, `code`, `invite`, `rank`, `vip_level` FROM users WHERE code = ? AND veri = 1  LIMIT 1 ",
        [userInfo.invite]
    );
    if (money >= 1) {
        if (f1.length > 0) {
            let infoF1 = f1[0];
            level0 = level[infoF1.vip_level];
            let rosesF1 = (money / 100) * level0.f1;
            await connection.query(
                "UPDATE users SET money = money + ?, roses_f1 = roses_f1 + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ",
                [rosesF1, rosesF1, rosesF1, rosesF1, infoF1.phone]
            );
            const [f2] = await connection.query(
                "SELECT `phone`, `code`, `invite`, `rank`, `vip_level` FROM users WHERE code = ? AND veri = 1  LIMIT 1 ",
                [infoF1.invite]
            );
            if (f2.length > 0) {
                let infoF2 = f2[0];
                level0 = level[infoF2.vip_level];
                let rosesF2 = (money / 100) * level0.f2;
                await connection.query(
                    "UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ",
                    [rosesF2, rosesF2, rosesF2, infoF2.phone]
                );
                const [f3] = await connection.query(
                    "SELECT `phone`, `code`, `invite`, `rank`, `vip_level` FROM users WHERE code = ? AND veri = 1  LIMIT 1 ",
                    [infoF2.invite]
                );
                if (f3.length > 0) {
                    let infoF3 = f3[0];
                    level0 = level[infoF3.vip_level];
                    let rosesF3 = (money / 100) * level0.f3;
                    await connection.query(
                        "UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ",
                        [rosesF3, rosesF3, rosesF3, infoF3.phone]
                    );
                    const [f4] = await connection.query(
                        "SELECT `phone`, `code`, `invite`, `rank`, `vip_level` FROM users WHERE code = ? AND veri = 1  LIMIT 1 ",
                        [infoF3.invite]
                    );
                    if (f4.length > 0) {
                        let infoF4 = f4[0];
                        level0 = level[infoF4.vip_level];
                        let rosesF4 = (money / 100) * level0.f4;
                        await connection.query(
                            "UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ",
                            [rosesF4, rosesF4, rosesF4, infoF4.phone]
                        );
                    }
                }
            }
        }
    }
};
// const rosesPlus = async (auth, money) => {
//     const [level] = await connection.query('SELECT * FROM level WHERE id = ?', [1]);
//     let level0 = level[0];

//     const [user] = await connection.query('SELECT `phone`, `code`, `invite` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ', [auth]);
//     let userInfo = user[0];

//     if (money >= 1) {
//         if (userInfo.code) {
//             let referralLevels = [
//                 { level: 1, percentage: 2, selfReferral: 2 },
//                 { level: 2, percentage: 2, selfReferral: 5 },
//                 { level: 3, percentage: 2, selfReferral: 8 },
//                 { level: 4, percentage: 2, selfReferral: 11 },
//                 { level: 5, percentage: 2, selfReferral: 14 },
//                 { level: 6, percentage: 2, selfReferral: 17 },
//                 { level: 7, percentage: 2, selfReferral: 20 },
//                 { level: 8, percentage: 2, selfReferral: 23 },
//                 { level: 9, percentage: 2, selfReferral: 26 },
//                 { level: 10, percentage: 2, selfReferral: 29 },
//                 { level: 11, percentage: 2, selfReferral: 32 },
//                 { level: 12, percentage: 2, selfReferral: 35 },
//                 { level: 13, percentage: 2, selfReferral: 38 },
//                 { level: 14, percentage: 2, selfReferral: 41 },
//                 { level: 15, percentage: 2, selfReferral: 44 }
//             ];

//             for (const referralLevel of referralLevels) {
//                 if (userInfo.code >= referralLevel.selfReferral) {
//                     let roses = money * referralLevel.percentage;
//                     await connection.query('UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ', [roses, roses, roses, userInfo.phone]);
//                 }
//             }
//         }
//     }
// };

const betWinGo = async (req, res) => {
    let { typeid, join, x, money } = req.body;
    let auth = req.cookies.auth;

    if (typeid != 1 && typeid != 3 && typeid != 5 && typeid != 10) {
        return res.status(200).json({
            message: "Error!",
            status: true,
        });
    }

    let gameJoin = "";
    if (typeid == 1) gameJoin = "wingo";
    if (typeid == 3) gameJoin = "wingo3";
    if (typeid == 5) gameJoin = "wingo5";
    if (typeid == 10) gameJoin = "wingo10";
    const [winGoNow] = await connection.query(
        `SELECT period FROM wingo WHERE status = 0 AND game = '${gameJoin}' ORDER BY id DESC LIMIT 1 `
    );
    const [user] = await connection.query(
        "SELECT `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ",
        [auth]
    );
    if (!winGoNow[0] || !user[0] || !isNumber(x) || !isNumber(money)) {
        return res.status(200).json({
            message: "Error!",
            status: true,
        });
    }

    let userInfo = user[0];
    // const [rechargeInfo] = await connection.query(
    //     "SELECT SUM(money) AS totalRecharge FROM recharge WHERE phone = ? AND status = 1",
    //     [userInfo.phone]
    // );
    // if (rechargeInfo[0].totalRecharge < 300) {
    //     return res.status(200).json({
    //         message: "Please recharge at least 300",
    //         status: true,
    //     });
    // }
    let period = winGoNow[0].period;
    let fee = 0;
    // if (x * money < 50) {
    //     fee = 1;
    // } else {
    //     fee = x * money * 0.02;
    // }
    fee = x * money * 0.05;

    let total = x * money - fee;
    let timeNow = Date.now();
    let check = userInfo.money - total;

    if (total <= 0) {
        return res.status(200).json({
            message: "The amount is not enough",
            status: false,
        });
    }

    let date = new Date();
    let years = formateT(date.getFullYear());
    let months = formateT(date.getMonth() + 1);
    let days = formateT(date.getDate());
    let id_product =
        years + months + days + Math.floor(Math.random() * 1000000000000000);

    let formatTime = timerJoin();

    let color = "";
    if (join == "l") {
        color = "big";
    } else if (join == "n") {
        color = "small";
    } else if (join == "t") {
        color = "violet";
    } else if (join == "d") {
        color = "red";
    } else if (join == "x") {
        color = "green";
    } else if (join == "0") {
        color = "red-violet";
    } else if (join == "5") {
        color = "green-violet";
    } else if (join % 2 == 0) {
        color = "red";
    } else if (join % 2 != 0) {
        color = "green";
    }

    let checkJoin = "";

    if ((!isNumber(join) && join == "l") || join == "n") {
        checkJoin = `
        <div data-v-a9660e98="" class="van-image" style="width: 30px; height: 30px;">
            <img src="/images/${
                join == "n" ? "small" : "big"
            }.png" class="van-image__img">
        </div>
        `;
    } else {
        checkJoin = `
        <span data-v-a9660e98="">${isNumber(join) ? join : ""}</span>
        `;
    }

    let result = `
    <div data-v-a9660e98="" issuenumber="${period}" addtime="${formatTime}" rowid="1" class="hb">
        <div data-v-a9660e98="" class="item c-row">
            <div data-v-a9660e98="" class="result">
                <div data-v-a9660e98="" class="select select-${color}">
                    ${checkJoin}
                </div>
            </div>
            <div data-v-a9660e98="" class="c-row c-row-between info">
                <div data-v-a9660e98="">
                    <div data-v-a9660e98="" class="issueName">
                        ${period}
                    </div>
                    <div data-v-a9660e98="" class="tiem">${formatTime}</div>
                </div>
            </div>
        </div>
        <!---->
    </div>
    `;

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
    let checkTime = timerJoin(date.getTime());

    if (check >= 0) {
        const sql = `INSERT INTO minutes_1 SET 
        id_product = ?,
        phone = ?,
        code = ?,
        invite = ?,
        stage = ?,
        level = ?,
        money = ?,
        amount = ?,
        fee = ?,
        get = ?,
        game = ?,
        bet = ?,
        status = ?,
        today = ?,
        time = ?`;
        await connection.execute(sql, [
            id_product,
            userInfo.phone,
            userInfo.code,
            userInfo.invite,
            period,
            userInfo.level,
            total,
            x,
            fee,
            0,
            gameJoin,
            join,
            0,
            checkTime,
            timeNow,
        ]);
        await connection.execute(
            "UPDATE `users` SET `money` = `money` - ? WHERE `token` = ? ",
            [money * x, auth]
        );
        const [users] = await connection.query(
            "SELECT `money`, `level` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ",
            [auth]
        );
        await rosesPlus(auth, money * x);
        const [level] = await connection.query("SELECT * FROM level ");
        let level0 = level[0];
        const sql2 = `INSERT INTO roses SET 
        phone = ?,
        code = ?,
        invite = ?,
        f1 = ?,
        f2 = ?,
        f3 = ?,
        f4 = ?,
        time = ?`;
        let total_m = money * x;
        let f1 = (total_m / 100) * level0.f1;
        let f2 = (total_m / 100) * level0.f2;
        let f3 = (total_m / 100) * level0.f3;
        let f4 = (total_m / 100) * level0.f4;
        await connection.execute(sql2, [
            userInfo.phone,
            userInfo.code,
            userInfo.invite,
            f1,
            f2,
            f3,
            f4,
            timeNow,
        ]);
        return res.status(200).json({
            message: "Successful bet",
            status: true,
            data: result,
            change: users[0].level,
            money: users[0].money,
        });
    } else {
        return res.status(200).json({
            message: "The amount is not enough",
            status: false,
        });
    }
};

const listOrderOld = async (req, res) => {
    let { typeid, pageno, pageto } = req.body;

    if (typeid != 1 && typeid != 3 && typeid != 5 && typeid != 10) {
        return res.status(200).json({
            message: "Error!",
            status: true,
        });
    }
    if (pageno < 0 || pageto < 0) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false,
        });
    }
    let auth = req.cookies.auth;
    const [user] = await connection.query(
        "SELECT `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ",
        [auth]
    );

    let game = "";
    if (typeid == 1) game = "wingo";
    if (typeid == 3) game = "wingo3";
    if (typeid == 5) game = "wingo5";
    if (typeid == 10) game = "wingo10";

    const [wingo] = await connection.query(
        `SELECT * FROM wingo WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT ${pageno}, ${pageto} `
    );
    const [wingoAll] = await connection.query(
        `SELECT * FROM wingo WHERE status != 0 AND game = '${game}' `
    );
    const [period] = await connection.query(
        `SELECT period FROM wingo WHERE status = 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `
    );
    if (!wingo[0]) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false,
        });
    }
    if (!pageno || !pageto || !user[0] || !wingo[0] || !period[0]) {
        return res.status(200).json({
            message: "Error!",
            status: true,
        });
    }
    let page = Math.ceil(wingoAll.length / 10);
    return res.status(200).json({
        code: 0,
        msg: "Receive success",
        data: {
            gameslist: wingo,
        },
        period: period[0].period,
        page: page,
        status: true,
    });
};

const GetMyEmerdList = async (req, res) => {
    let { typeid, pageno, pageto } = req.body;

    // if (!pageno || !pageto) {
    //     pageno = 0;
    //     pageto = 10;
    // }

    if (typeid != 1 && typeid != 3 && typeid != 5 && typeid != 10) {
        return res.status(200).json({
            message: "Error!",
            status: true,
        });
    }

    if (pageno < 0 || pageto < 0) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false,
        });
    }
    let auth = req.cookies.auth;

    let game = "";
    if (typeid == 1) game = "wingo";
    if (typeid == 3) game = "wingo3";
    if (typeid == 5) game = "wingo5";
    if (typeid == 10) game = "wingo10";

    const [user] = await connection.query(
        "SELECT `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1 LIMIT 1 ",
        [auth]
    );
    const [minutes_1] = await connection.query(
        `SELECT * FROM minutes_1 WHERE phone = ? AND game = '${game}' ORDER BY id DESC LIMIT ${
            Number(pageno) + "," + Number(pageto)
        }`,
        [user[0].phone]
    );
    const [minutes_1All] = await connection.query(
        `SELECT * FROM minutes_1 WHERE phone = ? AND game = '${game}' ORDER BY id DESC `,
        [user[0].phone]
    );

    if (!minutes_1[0]) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false,
        });
    }
    if (!pageno || !pageto || !user[0] || !minutes_1[0]) {
        return res.status(200).json({
            message: "Error!",
            status: true,
        });
    }
    let page = Math.ceil(minutes_1All.length / 10);

    let datas = minutes_1.map((data) => {
        let { id, phone, code, invite, level, game, ...others } = data;
        return others;
    });

    return res.status(200).json({
        code: 0,
        msg: "Receive success",
        data: {
            gameslist: datas,
        },
        page: page,
        status: true,
    });
};

const addWinGo = async (game) => {
    try {
        let join = "";
        if (game == 1) join = "wingo";
        if (game == 3) join = "wingo3";
        if (game == 5) join = "wingo5";
        if (game == 10) join = "wingo10";

        const [winGoNow] = await connection.query(
            `SELECT period FROM wingo WHERE status = 0 AND game = "${join}" ORDER BY id DESC LIMIT 1 `
        );
        const [setting] = await connection.query("SELECT * FROM `admin` ");
        const winningAlgorithmStatus = setting[0].winning_algorithm;
        let period = winGoNow[0].period; // cầu hiện tại
        let amount = Math.floor(Math.random() * 10); // xanh đỏ tím
        let timeNow = Date.now();

        const [bettingUsers] = await connection.query(
            `SELECT * FROM minutes_1 WHERE status = 0 AND game = "${join}"`
        );

        // console.log("betting users:", bettingUsers);

        if (winningAlgorithmStatus) {
            if (bettingUsers.length != 0) {
                if (bettingUsers.length == 1) {
                    // handling 1 bet (always looses)
                    const bettingUser = bettingUsers[0];

                    // console.log("handling 1 bet");

                    // TODO: TRY TO randomize these
                    if (bettingUser.bet == "x") {
                        amount = 2;
                    } else if (bettingUser.bet == "d") {
                        amount = 1;
                    } else if (bettingUser.bet == "t") {
                        amount = 3;
                    } else if (bettingUser.bet == "l") {
                        amount = 3;
                    } else if (bettingUser.bet == "n") {
                        amount = 7;
                    } else {
                        while (bettingUser.bet == amount) {
                            amount = Math.floor(Math.random() * 10);
                        }
                    }
                } else {
                    // handle multiple bets
                    let bets = [];
                    // console.log("handling multiple bets");

                    bettingUsers.forEach((bettingUser) => {
                        bets.push(bettingUser.bet);
                    });

                    // console.log("bets:", bets);
                    const notUsedBets = getNotBettedResult(bets);

                    // console.log("remaining bets:", notUsedBets);

                    if (notUsedBets.length != 0) {
                        amount =
                            notUsedBets[
                                Math.floor(Math.random() * notUsedBets.length)
                            ];
                    } else {
                        const resToMoneyChart = {
                            0: 0,
                            1: 0,
                            2: 0,
                            3: 0,
                            4: 0,
                            5: 0,
                            6: 0,
                            7: 0,
                            8: 0,
                            9: 0,
                        };
                        const res = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

                        bettingUsers.forEach((bettingUser) => {
                            res.forEach((r) => {
                                const a = getMoneyToBeGiven(
                                    bettingUser.bet,
                                    r,
                                    bettingUser.money
                                );

                                resToMoneyChart[r] = a + resToMoneyChart[r];
                            });
                        });

                        // console.log(resToMoneyChart);
                        let min = Math.min(...Object.values(resToMoneyChart));
                        const minList = [];
                        amount = 0;

                        for (const key in resToMoneyChart) {
                            if (resToMoneyChart[key] <= min) {
                                min = resToMoneyChart[key];
                                minList.push(key);
                            }
                        }

                        if (minList.length != 0) {
                            amount =
                                minList[
                                    Math.floor(Math.random() * minList.length)
                                ];
                        }
                    }
                }
            }
        }

        // console.log("amount (result):", amount);

        let nextResult = "";
        if (game == 1) nextResult = setting[0].wingo1;
        if (game == 3) nextResult = setting[0].wingo3;
        if (game == 5) nextResult = setting[0].wingo5;
        if (game == 10) nextResult = setting[0].wingo10;

        let newArr = "";
        if (nextResult == "-1") {
            await connection.execute(
                `UPDATE wingo SET amount = ?,status = ? WHERE period = ? AND game = "${join}"`,
                [amount, 1, period]
            );
            newArr = "-1";
        } else {
            let result = "";
            let arr = nextResult.split("|");
            let check = arr.length;
            if (check == 1) {
                newArr = "-1";
            } else {
                for (let i = 1; i < arr.length; i++) {
                    newArr += arr[i] + "|";
                }
                newArr = newArr.slice(0, -1);
            }
            result = arr[0];
            await connection.execute(
                `UPDATE wingo SET amount = ?,status = ? WHERE period = ? AND game = "${join}"`,
                [result, 1, period]
            );
        }
        const sql = `INSERT INTO wingo SET 
        period = ?,
        amount = ?,
        game = ?,
        status = ?,
        time = ?`;
        await connection.execute(sql, [
            Number(period) + 1,
            0,
            join,
            0,
            timeNow,
        ]);

        if (game == 1) join = "wingo1";
        if (game == 3) join = "wingo3";
        if (game == 5) join = "wingo5";
        if (game == 10) join = "wingo10";

        await connection.execute(`UPDATE admin SET ${join} = ?`, [newArr]);
    } catch (error) {
        if (error) {
            console.log(error);
        }
    }
};

/**
 *
 * @param {[]} bets
 */
const getNotBettedResult = (bets) => {
    let amount = null;
    let notUsedBets = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    if (bets.includes("x")) {
        notUsedBets = notUsedBets.filter((i) => i % 2 == 0);
    }

    if (bets.includes("d")) {
        notUsedBets = notUsedBets.filter((i) => i % 2 != 0);
    }

    if (notUsedBets.length == 0) return [];

    if (bets.includes("t")) {
        notUsedBets = notUsedBets.filter((i) => i != 0 || i != 5);
    }

    if (bets.includes("l")) {
        notUsedBets = notUsedBets.filter((i) => i < 5);
    }

    if (bets.includes("n")) {
        notUsedBets = notUsedBets.filter((i) => i > 4);
    }

    if (notUsedBets.length == 0) return [];

    bets.forEach((bet, i) => {
        notUsedBets = notUsedBets.filter((j) => j != `${bet}`);
    });

    return notUsedBets;
};

const getMoneyToBeGiven = (bet, result, total) => {
    let nhan_duoc = 0;

    if (result == 0 && bet == 0) {
        nhan_duoc = total * 9;
    } else if (result == 0 && bet == "t") {
        nhan_duoc = total * 4.5;
    } else if (result == 0 && bet == "n") {
        nhan_duoc = total * 2;
    } else if (result == 0 && bet == "d") {
        nhan_duoc = total * 1.5;
    } else if (result == 1 && bet == 1) {
        nhan_duoc = total * 9;
    } else if (result == 1 && bet == "n") {
        nhan_duoc = total * 2;
    } else if (result == 1 && bet == "x") {
        nhan_duoc = total * 2;
    } else if (result == 2 && bet == 2) {
        nhan_duoc = total * 9;
    } else if (result == 2 && bet == "n") {
        nhan_duoc = total * 2;
    } else if (result == 2 && bet == "d") {
        nhan_duoc = total * 2;
    } else if (result == 3 && bet == 3) {
        nhan_duoc = total * 9;
    } else if (result == 3 && bet == "n") {
        nhan_duoc = total * 2;
    } else if (result == 3 && bet == "x") {
        nhan_duoc = total * 2;
    } else if (result == 4 && bet == 4) {
        nhan_duoc = total * 9;
    } else if (result == 4 && bet == "n") {
        nhan_duoc = total * 2;
    } else if (result == 4 && bet == "d") {
        nhan_duoc = total * 2;
    } else if (result == 5 && bet == 5) {
        nhan_duoc = total * 9;
    } else if (result == 5 && bet == "t") {
        nhan_duoc = total * 4.5;
    } else if (result == 5 && bet == "x") {
        nhan_duoc = total * 1.5;
    } else if (result == 5 && bet == "l") {
        nhan_duoc = total * 2;
    } else if (result == 6 && bet == 6) {
        nhan_duoc = total * 9;
    } else if (result == 6 && bet == "l") {
        nhan_duoc = total * 2;
    } else if (result == 6 && bet == "d") {
        nhan_duoc = total * 2;
    } else if (result == 7 && bet == 7) {
        nhan_duoc = total * 9;
    } else if (result == 7 && bet == "l") {
        nhan_duoc = total * 2;
    } else if (result == 7 && bet == "x") {
        nhan_duoc = total * 2;
    } else if (result == 8 && bet == 8) {
        nhan_duoc = total * 9;
    } else if (result == 8 && bet == "l") {
        nhan_duoc = total * 2;
    } else if (result == 8 && bet == "d") {
        nhan_duoc = total * 2;
    } else if (result == 9 && bet == 9) {
        nhan_duoc = total * 9;
    } else if (result == 9 && bet == "l") {
        nhan_duoc = total * 2;
    } else if (result == 9 && bet == "x") {
        nhan_duoc = total * 2;
    }

    return nhan_duoc;
};

const handlingWinGo1P = async (typeid) => {
    let game = "";
    if (typeid == 1) game = "wingo";
    if (typeid == 3) game = "wingo3";
    if (typeid == 5) game = "wingo5";
    if (typeid == 10) game = "wingo10";

    const [winGoNow] = await connection.query(
        `SELECT * FROM wingo WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `
    );

    // update ket qua
    // amount is the result of the game
    await connection.execute(
        `UPDATE minutes_1 SET result = ? WHERE status = 0 AND game = '${game}'`,
        [winGoNow[0].amount]
    );

    //  X -> GREEN
    // D -> RED
    // T -> voilet

    // may be l means small and N means big

    let result = Number(winGoNow[0].amount);
    switch (result) {
        case 0:
            await connection.execute(
                `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "d" AND bet != "0" AND bet != "t" `,
                []
            );
            break;
        case 1:
            await connection.execute(
                `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "x" AND bet != "1" `,
                []
            );
            break;
        case 2:
            await connection.execute(
                `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "d" AND bet != "2" `,
                []
            );
            break;
        case 3:
            await connection.execute(
                `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "x" AND bet != "3" `,
                []
            );
            break;
        case 4:
            await connection.execute(
                `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "d" AND bet != "4" `,
                []
            );
            break;
        case 5:
            await connection.execute(
                `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "x" AND bet != "5" AND bet != "t" `,
                []
            );
            break;
        case 6:
            await connection.execute(
                `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "d" AND bet != "6" `,
                []
            );
            break;
        case 7:
            await connection.execute(
                `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "x" AND bet != "7" `,
                []
            );
            break;
        case 8:
            await connection.execute(
                `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "d" AND bet != "8" `,
                []
            );
            break;
        case 9:
            await connection.execute(
                `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "x" AND bet != "9" `,
                []
            );
            break;
        default:
            break;
    }

    if (result < 5) {
        await connection.execute(
            `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet = "l" `,
            []
        );
    } else {
        await connection.execute(
            `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet = "n" `,
            []
        );
    }

    // lấy ra danh sách đặt cược chưa xử lý
    const [order] = await connection.execute(
        `SELECT * FROM minutes_1 WHERE status = 0 AND game = '${game}' `
    );
    for (let i = 0; i < order.length; i++) {
        let orders = order[i];
        let result = orders.result;
        let bet = orders.bet;
        let total = orders.money;
        let id = orders.id;
        let phone = orders.phone;
        var nhan_duoc = 0;
        // x - green
        // t - Violet
        // d - red

        // Sirf 1-4 aur 6-9 tk hi *9 aana chahiye
        // Aur 0 aur 5 pe *4.5
        // Aur red aur green pe *2
        // 1,2,3,4,6,7,8,9

        if (bet == "l" || bet == "n") {
            nhan_duoc = total * 2;
        } else {
            if (result == 0 || result == 5) {
                if (bet == "d" || bet == "x") {
                    nhan_duoc = total * 1.5;
                } else if (bet == "t") {
                    nhan_duoc = total * 4.5;
                } else if (bet == "0" || bet == "5") {
                    nhan_duoc = total * 4.5;
                }
            } else {
                if (result == 1 && bet == "1") {
                    nhan_duoc = total * 9;
                } else {
                    if (result == 1 && bet == "x") {
                        nhan_duoc = total * 2;
                    }
                }
                if (result == 2 && bet == "2") {
                    nhan_duoc = total * 9;
                } else {
                    if (result == 2 && bet == "d") {
                        nhan_duoc = total * 2;
                    }
                }
                if (result == 3 && bet == "3") {
                    nhan_duoc = total * 9;
                } else {
                    if (result == 3 && bet == "x") {
                        nhan_duoc = total * 2;
                    }
                }
                if (result == 4 && bet == "4") {
                    nhan_duoc = total * 9;
                } else {
                    if (result == 4 && bet == "d") {
                        nhan_duoc = total * 2;
                    }
                }
                if (result == 6 && bet == "6") {
                    nhan_duoc = total * 9;
                } else {
                    if (result == 6 && bet == "d") {
                        nhan_duoc = total * 2;
                    }
                }
                if (result == 7 && bet == "7") {
                    nhan_duoc = total * 9;
                } else {
                    if (result == 7 && bet == "x") {
                        nhan_duoc = total * 2;
                    }
                }
                if (result == 8 && bet == "8") {
                    nhan_duoc = total * 9;
                } else {
                    if (result == 8 && bet == "d") {
                        nhan_duoc = total * 2;
                    }
                }
                if (result == 9 && bet == "9") {
                    nhan_duoc = total * 9;
                } else {
                    if (result == 9 && bet == "x") {
                        nhan_duoc = total * 2;
                    }
                }
            }
        }

        await connection.execute(
            "UPDATE `minutes_1` SET `get` = ?, `status` = 1 WHERE `id` = ? ",
            [nhan_duoc, id]
        );
        const sql =
            "UPDATE `users` SET `money` = `money` + ? WHERE `phone` = ? ";
        await connection.execute(sql, [nhan_duoc, phone]);
    }
};

const exp = {
    winGoPage,
    betWinGo,
    listOrderOld,
    GetMyEmerdList,
    handlingWinGo1P,
    addWinGo,
    winGoPage3,
    winGoPage5,
    winGoPage10,
};

export default exp;
