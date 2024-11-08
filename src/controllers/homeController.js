import connection from "../config/connectDB.js";
import jwt from "jsonwebtoken";
import md5 from "md5";
import e from "express";
// require("dotenv").config();
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const homePage = async (req, res) => {
    const [settings] = await connection.query("SELECT `app` FROM admin");
    let app = settings[0].app;
    return res.render("home/index.ejs", { app });
};

const checkInPage = async (req, res) => {
    return res.render("checkIn/checkIn.ejs");
};

const checkDes = async (req, res) => {
    return res.render("checkIn/checkDes.ejs");
};

const checkRecord = async (req, res) => {
    return res.render("checkIn/checkRecord.ejs");
};

const downloadApk = async (req, res) => {
    res.download("./venasclub.apk");
};

const addBank = async (req, res) => {
    return res.render("wallet/addbank.ejs");
};

const addUSDTAddress = async (req, res) => {
    return res.render("wallet/addUSDTAddress.ejs");
};

// promotion
const promotionPage = async (req, res) => {
    return res.render("promotion/promotion.ejs");
};

const promotionmyTeamPage = async (req, res) => {
    return res.render("promotion/myTeam.ejs");
};

const promotionDesPage = async (req, res) => {
    return res.render("promotion/promotionDes.ejs");
};

const tutorialPage = async (req, res) => {
    return res.render("promotion/tutorial.ejs");
};

const bonusRecordPage = async (req, res) => {
    return res.render("promotion/bonusrecord.ejs");
};

// wallet
const walletPage = async (req, res) => {
    return res.render("wallet/index.ejs");
};

const rechargePage = async (req, res) => {
    return res.render("wallet/recharge.ejs");
};

const tronRechargePage = async (req, res) => {
    return res.render("wallet/tron.ejs");
};

// const didapayRechargePage = async (req, res) => {
//     return res.render("wallet/didapay.ejs");
// };

// const wepayRechargePage = async (req, res) => {
//     return res.render("wallet/wepay.ejs");
// };

// const xdpayRechargePage = async (req, res) => {
//     return res.render("wallet/xdpay.ejs");
// };

const okpayRechargePage = async (req, res) => {
    return res.render("wallet/okpay.ejs");
};

const winpayRechargePage = async (req, res) => {
    return res.render("wallet/winpay.ejs");
};

// const allpayRechargePage = async (req, res) => {
//     return res.render("wallet/allpay.ejs");
// };

const rechargerecordPage = async (req, res) => {
    return res.render("wallet/rechargerecord.ejs");
};

const withdrawalPage = async (req, res) => {
    return res.render("wallet/withdrawal.ejs");
};

const withdrawalrecordPage = async (req, res) => {
    return res.render("wallet/withdrawalrecord.ejs");
};

// member page
const mianPage = async (req, res) => {
    let auth = req.cookies.auth;
    const [user] = await connection.query(
        "SELECT `level` FROM users WHERE `token` = ? ",
        [auth]
    );
    let level = user[0].level;
    return res.render("member/index.ejs", { level });
};
const aboutPage = async (req, res) => {
    return res.render("member/about/index.ejs");
};

const privacyPolicy = async (req, res) => {
    return res.render("member/about/privacyPolicy.ejs");
};

const newtutorial = async (req, res) => {
    return res.render("member/newtutorial.ejs");
};

const forgot = async (req, res) => {
    let auth = req.cookies.auth;
    const [user] = await connection.query(
        "SELECT `time_otp` FROM users WHERE token = ? ",
        [auth]
    );
    let time = user[0].time_otp;
    return res.render("member/forgot.ejs", { time });
};

const redenvelopes = async (req, res) => {
    return res.render("member/redenvelopes.ejs");
};

const riskAgreement = async (req, res) => {
    return res.render("member/about/riskAgreement.ejs");
};

const keFuMenu = async (req, res) => {
    let auth = req.cookies.auth;

    const [users] = await connection.query(
        "SELECT `level`, `ctv` FROM users WHERE token = ?",
        [auth]
    );

    let telegram = "";
    if (users.length == 0) {
        let [settings] = await connection.query(
            "SELECT `telegram`, `cskh` FROM admin"
        );
        telegram = settings[0].telegram;
    } else {
        if (users[0].level != 0) {
            var [settings] = await connection.query("SELECT * FROM admin");
        } else {
            var [check] = await connection.query(
                "SELECT `telegram` FROM point_list WHERE phone = ?",
                [users[0].ctv]
            );
            if (check.length == 0) {
                var [settings] = await connection.query("SELECT * FROM admin");
            } else {
                var [settings] = await connection.query(
                    "SELECT `telegram` FROM point_list WHERE phone = ?",
                    [users[0].ctv]
                );
            }
        }
        telegram = settings[0].telegram;
    }

    return res.render("keFuMenu.ejs", { telegram });
};

const myProfilePage = async (req, res) => {
    return res.render("member/myProfile.ejs");
};

const exp = {
    homePage,
    checkInPage,
    promotionPage,
    walletPage,
    mianPage,
    myProfilePage,
    promotionmyTeamPage,
    promotionDesPage,
    tutorialPage,
    bonusRecordPage,
    keFuMenu,
    rechargePage,
    downloadApk,
    tronRechargePage,
    // didapayRechargePage,
    // wepayRechargePage,
    // xdpayRechargePage,
    okpayRechargePage,
    winpayRechargePage,
    // allpayRechargePage,
    rechargerecordPage,
    withdrawalPage,
    withdrawalrecordPage,
    aboutPage,
    privacyPolicy,
    riskAgreement,
    newtutorial,
    redenvelopes,
    forgot,
    checkDes,
    checkRecord,
    addBank,
    addUSDTAddress,
};

export default exp;
