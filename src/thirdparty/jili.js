import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

class Jili {
    static #TEST_BASE_URL = process.env.JILI_TEST_BASE_URL;
    static #PROD_BASE_URL = process.env.JILI_PROD_BASE_URL;

    static #AGENT_ID = "xchange99_INR";
    static #TEST_AGENT_KEY = process.env.JILI_TEST_AGENT_KEY;
    static #PROD_AGENT_KEY = process.env.JILI_PROD_AGENT_KEY;
    static #LANG = process.env.JILI_LANG;

    static #TEST_MODE = false;

    #account;
    #baseUrl;

    /**
     *
     * @param {boolean} test
     */
    static setTestMode(test) {
        Jili.#TEST_MODE = test;
    }

    /**
     * access jili games
     * @param {string} account unique user account to login (or create account)
     */
    constructor(account) {
        this.#account = account;

        if (Jili.#TEST_MODE) {
            this.#baseUrl = Jili.#TEST_BASE_URL;
        } else {
            this.#baseUrl = Jili.#PROD_BASE_URL;
        }
    }

    /**
     * logs in to jili games or create a new account if it doesn't exist
     * @param {string} gameId logs into specified game
     */
    async login(gameId) {
        const account = this.#account;

        let endPoint =
            this.#baseUrl +
            "/api1/LoginWithoutRedirect?AgentId=" +
            Jili.#AGENT_ID +
            "&GameId=" +
            gameId +
            "&Account=" +
            account +
            "&Lang=" +
            Jili.#LANG +
            "&Key=";

        const str =
            "Account=" +
            account +
            "&GameId=" +
            gameId +
            "&Lang=" +
            Jili.#LANG +
            "&AgentId=" +
            Jili.#AGENT_ID;

        endPoint += Jili.#genHash(str);

        const ret = {
            success: false,
            data: null,
        };

        endPoint += "&HomeUrl=" + "http://localhost:3000";

        return fetch(endPoint)
            .then(async (res) => {
                const data = await res.json();

                if (data.ErrorCode == 0) {
                    ret.success = true;
                    ret.data = data;
                } else {
                    ret.success = false;
                    ret.data = data;
                }

                return ret;
            })
            .catch((err) => {
                console.error(err);

                ret.success = false;
                ret.data = err;

                return ret;
            });
    }

    /**
     * logs out from jili games
     */
    async logout() {
        const account = this.#account;

        let endPoint =
            this.#baseUrl +
            "/api1/KickMember?Account=" +
            account +
            "&AgentId=" +
            Jili.#AGENT_ID +
            "&Key=";

        const str = "Account=" + account + "&AgentId=" + Jili.#AGENT_ID;

        endPoint += Jili.#genHash(str);

        const ret = {
            success: false,
            data: null,
        };

        return fetch(endPoint)
            .then(async (res) => {
                const data = await res.json();

                if (data.ErrorCode == 0) {
                    ret.success = true;
                    ret.data = data;
                } else {
                    ret.success = false;
                    ret.data = data;
                }

                return ret;
            })
            .catch((err) => {
                console.error(err);

                ret.success = false;
                ret.data = err;

                return ret;
            });
    }

    /**
     * get account info
     */
    async getAccountInfo() {
        const account = this.#account;

        let endPoint =
            this.#baseUrl +
            "/api1/GetMemberInfo?Accounts=" +
            account +
            "&AgentId=" +
            Jili.#AGENT_ID +
            "&Key=";

        const str = "Accounts=" + account + "&AgentId=" + Jili.#AGENT_ID;

        endPoint += Jili.#genHash(str);

        const ret = {
            success: false,
            data: null,
        };

        return fetch(endPoint)
            .then(async (res) => {
                const data = await res.json();

                if (data.ErrorCode == 0) {
                    ret.success = true;
                    ret.data = data;
                } else {
                    ret.success = false;
                    ret.data = data;
                }

                return ret;
            })
            .catch((err) => {
                console.error(err);

                ret.success = false;
                ret.data = err;

                return ret;
            });
    }

    /**
     * transfer balance
     * @param {boolean} deposit true if depositing, false if withdrawing
     * @param {number} ammount ammount to transfer
     */
    async balanceTransfer(deposit, ammount) {
        const account = this.#account;
        const transferType = deposit ? 2 : 3; //1: withdraw  2:deposit
        const transactionId = Jili.#getOrderId();

        let endPoint =
            this.#baseUrl +
            "/api1/ExchangeTransferByAgentId?Account=" +
            account +
            "&TransactionId=" +
            transactionId +
            "&Amount=" +
            ammount +
            "&TransferType=" +
            transferType +
            "&AgentId=" +
            Jili.#AGENT_ID +
            "&Key=";

        const str =
            "Account=" +
            account +
            "&TransactionId=" +
            transactionId +
            "&Amount=" +
            ammount +
            "&TransferType=" +
            transferType +
            "&AgentId=" +
            Jili.#AGENT_ID;

        endPoint += Jili.#genHash(str);

        const ret = {
            success: false,
            data: null,
        };

        return fetch(endPoint)
            .then(async (res) => {
                const data = await res.json();

                if (data.ErrorCode == 0) {
                    ret.success = true;
                    ret.data = data;
                } else {
                    ret.success = false;
                    ret.data = data;
                }

                return ret;
            })
            .catch((err) => {
                console.error(err);

                ret.success = false;
                ret.data = err;

                return ret;
            });
    }

    static async getBetRecord(startTime, endTime) {
        const page = 1;
        const pageLimit = 25000;

        const baseUrl = Jili.#TEST_MODE
            ? Jili.#TEST_BASE_URL
            : Jili.#PROD_BASE_URL;

        let endPoint =
            baseUrl +
            "/api1/GetBetRecordByTime?StartTime=" +
            startTime +
            "&EndTime=" +
            endTime +
            "&Page=" +
            page +
            "&PageLimit=" +
            pageLimit +
            "&AgentId=" +
            Jili.#AGENT_ID +
            "&Key=";

        const str =
            "StartTime=" +
            startTime +
            "&EndTime=" +
            endTime +
            "&Page=" +
            page +
            "&PageLimit=" +
            pageLimit +
            "&AgentId=" +
            Jili.#AGENT_ID;

        endPoint += Jili.#genHash(str);

        const ret = {
            success: false,
            data: null,
        };

        return fetch(endPoint)
            .then(async (res) => {
                const data = await res.json();

                if (data.ErrorCode == 0) {
                    ret.success = true;
                    ret.data = data;
                } else {
                    ret.success = false;
                    ret.data = data;
                }

                return ret;
            })
            .catch((err) => {
                console.error(err);

                ret.success = false;
                ret.data = err;

                return ret;
            });
    }

    /**
     * create a new account
     */
    async createAccount() {
        const account = this.#account;

        let endPoint =
            this.#baseUrl +
            "/api1/CreateMember?Account=" +
            account +
            "&AgentId=" +
            Jili.#AGENT_ID +
            "&Key=";

        const str = "Account=" + account + "&AgentId=" + Jili.#AGENT_ID;

        endPoint += Jili.#genHash(str);

        const ret = {
            success: false,
            data: null,
        };

        return fetch(endPoint)
            .then(async (res) => {
                const data = await res.json();

                if (data.ErrorCode == 0) {
                    ret.success = true;
                    ret.data = data;
                } else {
                    ret.success = false;
                    ret.data = data;
                }

                return ret;
            })
            .catch((err) => {
                console.error(err);

                ret.success = false;
                ret.data = err;

                return ret;
            });
    }

    static #genHash(data) {
        const agentKey = Jili.#TEST_MODE
            ? Jili.#TEST_AGENT_KEY
            : Jili.#PROD_AGENT_KEY;
        const date = new Date();
        const utc = date.getTime() + date.getTimezoneOffset() * 60000;

        const date_4 = utc + 3600000 * -4;
        const nd = new Date(date_4);
        let month = nd.getMonth() + 1;

        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }

        const dateStr =
            nd.getFullYear().toString().substring(2, 4) + month + nd.getDate();

        // let KeyG = CryptoJS.MD5(dateStr+agid+agentKey).toString();
        const keyG = crypto
            .createHash("md5")
            .update(dateStr + Jili.#AGENT_ID + agentKey)
            .digest("hex");

        const key = crypto
            .createHash("md5")
            .update(data + keyG)
            .digest("hex");

        return "000000" + key + "000000";
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

if (process.env.jili_TEST_MODE) {
    Jili.setTestMode(true);
}

export default Jili;
