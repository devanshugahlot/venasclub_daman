import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

class Kingmaker {
    static #BASE_URL = "https://staging-api.queenmakergames.co";
    static #POST_HEADERS = {
        "Content-Type": "application/json",
        "X-QM-ClientId": process.env.KINGMAKER_X_QM_ClientId,
        "X-QM-ClientSecret": process.env.KINGMAKER_X_QM_ClientSecret,
    };
    static #GET_HEADERS = {
        "X-QM-ClientId": process.env.KINGMAKER_X_QM_ClientId,
        "X-QM-ClientSecret": process.env.KINGMAKER_X_QM_ClientSecret,
    };
    static #LANG = "en-US";
    static #CURRENCY = "INR";
    static #PLATFORM = 1; // 0 desktop 1 mobile;
    static #BET_LIMIT = 2;

    static #TEST_MODE = false;

    #username;
    #userip;
    #userid;
    #authtoken;
    #isTestPlayer;

    /**
     *
     * @param {boolean} test
     */
    // static setTestMode(test) {
    //     Kingmaker.#TEST_MODE = test;
    // }

    /**
     * access Kingmaker games
     * @param {string} userip IP address of player
     * @param {string} username username of player
     * @param {string} userid userid of player
     * @param {boolean} isTestPlayer true if player is a test player
     */
    constructor(userip, username, userid, isTestPlayer = false) {
        this.#userip = userip;
        this.#username = username;
        this.#userid = userid;
        this.#isTestPlayer = isTestPlayer;

        // if (Kingmaker.#TEST_MODE) {
        //     this.#baseUrl = Jili.#TEST_BASE_URL;
        // } else {
        //     this.#baseUrl = Jili.#PROD_BASE_URL;
        // }
    }

    /**
     * authorizes to Kingmaker games or create a new account if it doesn't exist
     */
    async authorize() {
        const username = this.#username;
        const userip = this.#userip;
        const userid = this.#userid;
        const isTestPlayer = this.#isTestPlayer;

        let endPoint = Kingmaker.#BASE_URL + "/api/player/authorize";

        const ret = {
            success: false,
            data: null,
        };

        return fetch(endPoint, {
            method: "POST",
            headers: Kingmaker.#POST_HEADERS,
            body: JSON.stringify({
                ipaddress: userip,
                username: username,
                userid: userid,
                lang: Kingmaker.#LANG,
                cur: Kingmaker.#CURRENCY,
                betlimitid: Kingmaker.#BET_LIMIT,
                istestplayer: isTestPlayer,
                platformtype: Kingmaker.#PLATFORM,
            }),
        })
            .then(async (res) => {
                const resClone = res.clone();

                return res
                    .json()
                    .then((data) => {
                        const status = res.status;

                        if (status == 200) {
                            this.#authtoken = data.authtoken;

                            ret.success = true;
                            ret.data = data;
                        } else {
                            console.error("[KINGMAKER_AUTH_ERROR]: ", data);

                            ret.success = false;
                            ret.data = data;
                        }

                        return ret;
                    })
                    .catch((err) => {
                        console.error("[KINGMAKER_AUTH_ERROR]: ", err);
                        console.error("Trying to parse text...");
                        resClone.text().then((text) => {
                            console.error(text);
                        });

                        ret.success = false;
                        ret.data = err;

                        return ret;
                    });
            })
            .catch((err) => {
                console.error("[KINGMAKER_AUTH_ERROR]: ", err);

                ret.success = false;
                ret.data = err;

                return ret;
            });
    }

    /**
     * get user balance
     * @param {string} userid userid of player
     */
    static async getBalance(userid) {
        const endPoint =
            Kingmaker.#BASE_URL +
            "/api/player/balance" +
            "?userid=" +
            userid +
            "&cur=" +
            Kingmaker.#CURRENCY;

        const ret = {
            success: false,
            data: null,
        };

        return fetch(endPoint, {
            method: "GET",
            headers: Kingmaker.#GET_HEADERS,
        })
            .then(async (res) => {
                const data = await res.json();

                const status = res.status;

                if (status == 200) {
                    ret.success = true;
                    ret.data = data;
                } else {
                    console.error("[KINGMAKER_BALANCE_ERROR]: ", data);

                    ret.success = false;
                    ret.data = data;
                }

                return ret;
            })
            .catch((err) => {
                console.error("[KINGMAKER_BALANCE_ERROR]: ", err);

                ret.success = false;
                ret.data = err;

                return ret;
            });
    }

    /**
     * credit balance
     * @param {string} userid userid of player
     * @param {number} ammount ammount to credit
     */
    static async credit(userid, ammount) {
        const transactionId = Kingmaker.#getOrderId();

        let endPoint = Kingmaker.#BASE_URL + "/api/wallet/credit";

        const ret = {
            success: false,
            data: null,
        };

        return fetch(endPoint, {
            method: "POST",
            headers: Kingmaker.#POST_HEADERS,
            body: JSON.stringify({
                userid: userid,
                amt: ammount,
                cur: Kingmaker.#CURRENCY,
                txid: transactionId,
            }),
        })
            .then(async (res) => {
                const data = await res.json();

                const status = res.status;

                if (status == 200) {
                    ret.success = true;
                    ret.data = data;
                } else {
                    console.error("[KINGMAKER_CREDIT_ERROR]: ", data);

                    ret.success = false;
                    ret.data = data;
                }

                return ret;
            })
            .catch((err) => {
                console.error("[KINGMAKER_CREDIT_ERROR]: ", err);

                ret.success = false;
                ret.data = err;

                return ret;
            });
    }

    /**
     * debit balance
     * @param {string} userid userid of player
     * @param {number} ammount ammount to debit
     */
    static async debit(userid, ammount) {
        const transactionId = Kingmaker.#getOrderId();

        const endPoint = Kingmaker.#BASE_URL + "/api/wallet/debit";

        const ret = {
            success: false,
            data: null,
        };

        return fetch(endPoint, {
            method: "POST",
            headers: Kingmaker.#POST_HEADERS,
            body: JSON.stringify({
                userid: userid,
                amt: ammount,
                cur: Kingmaker.#CURRENCY,
                txid: transactionId,
            }),
        })
            .then(async (res) => {
                const data = await res.json();

                const status = res.status;

                if (status == 200) {
                    ret.success = true;
                    ret.data = data;
                } else {
                    console.error("[KINGMAKER_DEBIT_ERROR]: ", data);

                    ret.success = false;
                    ret.data = data;
                }

                return ret;
            })
            .catch((err) => {
                console.error("[KINGMAKER_DEBIT_ERROR]: ", err);

                ret.success = false;
                ret.data = err;

                return ret;
            });
    }

    async launchGame(gcode) {
        const gpcode = "KMQM";

        const endPoint =
            "https://staging-lobby.queenmakergames.co" +
            "/gamelauncher" +
            "?gpcode=" +
            gpcode +
            "&gcode=" +
            gcode +
            "&token=" +
            this.#authtoken;

        const ret = {
            success: false,
            data: null,
        };

        return fetch(endPoint, {
            method: "GET",
            // headers: Kingmaker.#GET_HEADERS,
        })
            .then(async (res) => {
                return res
                    .text()
                    .then((text) => {
                        // window.location.href = 'data:text/html,' + encodeURIComponent(text)
                        ret.success = true;
                        // ret.data = "data:text/html," + encodeURIComponent(text);
                        ret.data = text;

                        return ret;
                    })
                    .catch((err) => {
                        console.error("[KINGMAKER_LAUNCH_ERROR]: ", err);

                        ret.success = false;
                        ret.data = err;

                        return ret;
                    });
            })
            .catch((err) => {
                console.error("[KINGMAKER_LAUNCH_ERROR]: ", err);

                ret.success = false;
                ret.data = err;

                return ret;
            });
    }

    static #getOrderId() {
        const date = new Date();

        const id_time =
            date.getUTCFullYear() +
            "" +
            date.getUTCMonth() +
            1 +
            "" +
            date.getUTCDate();
        let id_order =
            Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) +
            10000000000000;

        return id_time + id_order;
    }
}

export default Kingmaker;
