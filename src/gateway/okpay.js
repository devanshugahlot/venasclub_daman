import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

class Okpay {
    static #TEST_BASE_URL = "https://sandbox.wpay.one";
    static #BASE_URL = "https://api.wpay.one";

    static #paymentNotifyUrl = process.env.OKPAY_PAYMENT_NOTIFICATION_URL;
    static #paymentReturnUrl = process.env.OKPAY_PAYMENT_RETURN_URL;
    static #withdrawNotifyUrl = process.env.OKPAY_WITHDRAW_NOTIFICATION_URL;

    static #TEST_MODE = false;

    /**
     *
     * @param {boolean} test
     */
    static setTestMode(test) {
        Okpay.#TEST_MODE = test ? true : false;
    }

    /**
     * Initiate payment to okpay systems
     * @param {string} amount payment amount
     * @param {string} orderId merchant order number
     */
    static async initiatePayment(amount, orderId) {
        let REQ_URL = Okpay.#TEST_MODE ? Okpay.#TEST_BASE_URL : Okpay.#BASE_URL;
        REQ_URL += "/v1/Collect";

        const key = Okpay.#TEST_MODE
            ? process.env.OKPAY_SANDBOX_MERCHANT_KEY
            : process.env.OKPAY_MERCHANT_KEY;
        const id = Okpay.#TEST_MODE
            ? process.env.OKPAY_SANDBOX_MERCHANT_ID
            : process.env.OKPAY_MERCHANT_ID;

        const signStr =
            `currency=INR&` +
            `mchId=${id}&` +
            `money=${amount}&` +
            `notify_url=${Okpay.#paymentNotifyUrl}&` +
            `out_trade_no=${orderId}&` +
            `pay_type=UPI&` +
            `returnUrl=${Okpay.#paymentReturnUrl}&` +
            `key=${key}`;

        const sign = Okpay.#sign(signStr);

        const data = {
            mchId: id,
            currency: "INR",
            out_trade_no: orderId,
            pay_type: "UPI",
            money: amount,
            notify_url: Okpay.#paymentNotifyUrl,
            returnUrl: Okpay.#paymentReturnUrl,
            sign,
        };

        return await Okpay.#get(REQ_URL, JSON.stringify(data));
    }

    /**
     * Initiate withdrawl from okpay's systems
     * @param {string} amount amount to withdraw
     * @param {string} bankAccount Bank account number
     * @param {string} customName Name of account holder
     * @param {string} ifsc IFSC code
     * @param {string} orderId merchant order number
     */
    static async initiateWithdrawl(
        amount,
        bankAccount,
        customName,
        ifsc,
        orderId
    ) {
        let REQ_URL = Okpay.#TEST_MODE ? Okpay.#TEST_BASE_URL : Okpay.#BASE_URL;
        REQ_URL += "/v1/Payout";

        const key = Okpay.#TEST_MODE
            ? process.env.OKPAY_SANDBOX_MERCHANT_KEY
            : process.env.OKPAY_MERCHANT_KEY;
        const id = Okpay.#TEST_MODE
            ? process.env.OKPAY_SANDBOX_MERCHANT_ID
            : process.env.OKPAY_MERCHANT_ID;

        const signStr =
            `account=${bankAccount}&` +
            `currency=INR&` +
            `mchId=${id}&` +
            `money=${amount}&` +
            `notify_url=${Okpay.#withdrawNotifyUrl}&` +
            `out_trade_no=${orderId}&` +
            `pay_type=BANK&` +
            `reserve1=${ifsc}&` +
            `userName=${customName}&` +
            `key=${key}`;

        const sign = Okpay.#sign(signStr);

        const data = {
            account: bankAccount,
            currency: "INR",
            mchId: id,
            money: amount,
            notify_url: Okpay.#withdrawNotifyUrl,
            out_trade_no: orderId,
            pay_type: "BANK",
            reserve1: ifsc,
            userName: customName,
            sign,
        };

        return await Okpay.#get(REQ_URL, JSON.stringify(data));
    }

    /**
     *
     * @param {*} data data sent by Okpay's systems
     * @returns {boolean} `true` if verification is passed else `false`
     */
    static verify(data) {
        const key = Okpay.#TEST_MODE
            ? process.env.OKPAY_SANDBOX_MERCHANT_KEY
            : process.env.OKPAY_MERCHANT_KEY;

        const signStr =
            (data.attach == undefined || data.attach == ""
                ? ""
                : `attach=${data.attach}&`) +
            `currency=${data.currency}&` +
            `mchId=${data.mchId}&` +
            `merchant_ratio=${data.merchant_ratio}&` +
            `money=${data.money}&` +
            `out_trade_no=${data.out_trade_no}&` +
            (data.pay_money == undefined
                ? ""
                : `pay_money=${data.pay_money}&`) +
            `real_money=${data.real_money}&` +
            `status=${data.status}&` +
            `key=${key}`;

        return Okpay.#sign(signStr) == data.sign;
    }

    /**
     *
     * @param {string} data data to sign
     */
    static #sign(data) {
        return crypto.createHash("md5").update(data).digest("hex");
    }

    /**
     *
     * @param {string} reqUrl req url
     * @param {string} json json data
     */
    static async #get(reqUrl, json) {
        const postHeaders = {
            "Content-Type": "application/json",
            Charset: "utf-8",
            "Content-Length": json.length,
        };

        const data = await fetch(reqUrl, {
            method: "POST",
            body: json,
            headers: postHeaders,
        });

        return await data.json();
    }
}

if (process.env.OKPAY_TEST_MODE) {
    Okpay.setTestMode(true);
}

export default Okpay;
