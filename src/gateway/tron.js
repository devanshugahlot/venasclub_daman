import Tronweb from "tronweb";
import dotenv from "dotenv";
dotenv.config();

class Tron {
    static #MAINNET = "https://api.trongrid.io";
    static #MAINNET_API_KEY = process.env.TRON_MAINNET_API_KEY;

    // owners address
    static #MAINNET_ADDRESS = process.env.TRON_MAINNET_ADDRESS;
    static #MAINNET_USDT_CONTRACT_ADDRESS =
        "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

    // testnet does not need api key
    static #TEST_MODE = false;
    static #TESTNET = "https://api.shasta.trongrid.io";
    // owners address
    // static #TESTNET_ADDRESS = "TRmUpJdz5KYC75CNvnH8bwSzEuojBeaBf5";
    static #TESTNET_ADDRESS = "TJG39fefN4iRvsbSLMs9bnkfxszcqhM75T";
    static #TESTNET_USDT_CONTRACT_ADDRESS =
        "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs";

    static #tronWeb = null;

    constructor() {
        const fullNode = Tron.#TESTNET;
        const solidityNode = Tron.#TESTNET;
        const eventServer = Tron.#TESTNET;
        Tron.#tronWeb = new Tronweb(fullNode, solidityNode, eventServer);
    }

    /**
     *
     * @param {boolean} test
     */
    static setTestMode(test) {
        Tron.#TEST_MODE = test ? true : false;
    }

    static #getEventByTransactionId(id) {
        const BASE_URL = Tron.#TEST_MODE ? Tron.#TESTNET : Tron.#MAINNET;

        return Tron.#get(BASE_URL + `/v1/transactions/${id}/events`);
    }

    static #getUSDTTransactionInfo(address) {
        const BASE_URL = Tron.#TEST_MODE ? Tron.#TESTNET : Tron.#MAINNET;
        const USDT_CONTRACT_ADDRESS = Tron.#TEST_MODE
            ? Tron.#TESTNET_USDT_CONTRACT_ADDRESS
            : Tron.#MAINNET_USDT_CONTRACT_ADDRESS;

        return Tron.#get(
            BASE_URL +
                `/v1/accounts/${address}/transactions/trc20?contract_address=${USDT_CONTRACT_ADDRESS}&only_to=true&limit=200`
        );
    }

    static #getTransactionById(id) {
        const BASE_URL = Tron.#TEST_MODE ? Tron.#TESTNET : Tron.#MAINNET;

        const reqUrl = `${BASE_URL}/wallet/gettransactionbyid`;
        const json = JSON.stringify({
            value: id,
        });

        return Tron.#get(reqUrl, "POST", json);
    }

    /**
     * Confirms the TRX transfer to the address
     * @param {string} id The transaction ID
     */
    async confirmTRXTransfer(id) {
        const ADDRESS = Tron.#TEST_MODE
            ? Tron.#TESTNET_ADDRESS
            : Tron.#MAINNET_ADDRESS;

        const retData = {
            success: false,
            message: "FAILURE",
            value: null,
        };

        let tx = await Tron.#getTransactionById(id);

        if (!tx) {
            retData.message = "Transaction not found";
            return retData;
        }

        if (tx.Error) {
            retData.message = tx.Error;
            return retData;
        }

        const result = tx.ret;
        if (result[0].contractRet != "SUCCESS") {
            retData.message = "Transaction not valid. Transaction failed";
            return retData;
        }

        if (tx.txID != id) {
            retData.message = "Transaction ID not found";
            return retData;
        }
        const contract = tx.raw_data.contract[0];
        if (contract.type != "TransferContract") {
            retData.message =
                "Transaction not valid. Transaction does not transfer TRX";
            return retData;
        }

        if (Tron.#fromHex(contract.parameter.value.to_address) != ADDRESS) {
            retData.message =
                "Transaction not valid. Transaction does not transfer TRX to us";
            return retData;
        }

        retData.success = true;
        retData.message = "SUCCESS";
        retData.value = contract.parameter.value.amount / 1000000;

        return retData;
    }

    /**
     * Confirms the USDT transfer to address
     * @param {string} id The transaction id
     */
    async confirmUSDTTransfer(id) {
        const ADDRESS = Tron.#TEST_MODE
            ? Tron.#TESTNET_ADDRESS
            : Tron.#MAINNET_ADDRESS;
        const USDT_CONTRACT_ADDRESS = Tron.#TEST_MODE
            ? Tron.#TESTNET_USDT_CONTRACT_ADDRESS
            : Tron.#MAINNET_USDT_CONTRACT_ADDRESS;
        const TOKEN_NAME = Tron.#TEST_MODE ? "Tether Token" : "Tether USD";

        const retData = {
            success: false,
            message: "FAILURE",
            value: null,
        };

        // getting event emited by the transaction
        const tx = await Tron.#getEventByTransactionId(id);

        if (!tx.success) {
            retData.message = "Transaction not valid. Transfer Event not found";
            return retData;
        }

        if (tx.data.length == 0) {
            retData.message = "Transaction not valid. Transfer Event not found";
            return retData;
        }

        let from, eventResult;
        const eventData = tx.data[0];

        // checking if the event is a USDT transfer event
        if (
            eventData.contract_address == USDT_CONTRACT_ADDRESS &&
            eventData.event_name == "Transfer"
        ) {
            eventResult = eventData.result;
            from = Tron.#fromHex(eventResult.from);
        } else {
            retData.message =
                "Transaction not valid. Transaction does not transfer USDT";
            return retData;
        }

        // getting transactions recieved to us
        const resp = await Tron.#getUSDTTransactionInfo(ADDRESS);

        if (!resp.success) {
            retData.message = "Transaction not valid. Transaction not found";
            return retData;
        }

        if (resp.data.length == 0) {
            retData.message = "Transaction not valid. Transaction not found";
            return retData;
        }

        const txs = resp.data;
        let found = false;
        let index = 0;
        let foundTX = null;

        while (index < txs.length) {
            const tx = txs[index];

            if (tx.transaction_id == id) {
                found = true;
                foundTX = tx;
                break;
            }

            index++;
        }

        if (!found) {
            retData.message = "Transaction not valid. Transaction not found";
            return retData;
        }

        const token = foundTX.token_info;

        // verifying USTD token
        if (
            token.symbol == "USDT" &&
            token.name == TOKEN_NAME &&
            token.address == USDT_CONTRACT_ADDRESS &&
            foundTX.to == ADDRESS &&
            foundTX.type == "Transfer" &&
            foundTX.from == from
        ) {
            retData.success = true;
            retData.message = "SUCCESS";
            retData.value = foundTX.value / 1000000;

            return retData;
        }

        retData.message =
            "Transaction not valid. Transaction does not transfer USDT to us";
        return retData;
    }

    /**
     * Get the ticker information for the TRX-INR with current Price
     */
    static async getTRXtoINR() {
        const data = await fetch(
            "https://www.zebapi.com/pro/v1/market/TRX-INR/ticker"
        );
        return (await data.json())["24hoursHigh"];
    }

    /**
     * Get the ticker information for the USDT-INR with current Price
     */
    static async getUSDTtoINR() {
        const data = await fetch(
            "https://www.zebapi.com/pro/v1/market/USDT-INR/ticker"
        );
        return (await data.json())["24hoursHigh"];
    }

    /**
     * Validates the transaction hash
     * @param {string} txhash transaction hash
     * @return {boolean} true if valid, false otherwise
     */
    static validateTxhash(txhash) {
        // return preg_match("/^([A-Fa-f0-9]{64})$/", txhash);
        const regex = new RegExp(/^([A-Fa-f0-9]{64})$/);
        return regex.test(txhash);
    }

    /**
     *
     * @param {string} reqUrl
     * @param {"POST" | "GET"} method
     * @param {string} json
     */
    static async #get(reqUrl, method = "GET", json = "") {
        const postHeaders = {
            "Content-Type": "application/json",
            Charset: "utf-8",
            "Content-Length": json.length,
        };

        const getHeaders = {};

        if (!Tron.#TEST_MODE) {
            postHeaders["TRON-PRO-API-KEY"] = Tron.#MAINNET_API_KEY;
            getHeaders["TRON-PRO-API-KEY"] = Tron.#MAINNET_API_KEY;
        }

        const data = await fetch(reqUrl, {
            method,
            body: method === "POST" ? json : null,
            headers: method == "POST" ? postHeaders : getHeaders,
        });

        return await data.json();
    }

    static #toHex(s) {
        return Tron.#tronWeb.address.toHex(s);
    }

    static #fromHex(s) {
        return Tron.#tronWeb.address.fromHex(s);
    }
}

if (process.env.TRON_TEST_MODE) {
    Tron.setTestMode(true);
}

export default Tron;
