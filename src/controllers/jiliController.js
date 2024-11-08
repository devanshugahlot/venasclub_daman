import Jili from "../thirdparty/jili.js";
import connection from "../config/connectDB.js";

/**
 * Get the current datetime in GMT-5 and 10 minutes ago
 * @returns
 */
function getStartDatetime() {
    // Get the current datetime in GMT-5
    const now = new Date();
    now.setUTCHours(now.getUTCHours() - 5);
    now.setUTCMinutes(now.getUTCMinutes() - 10);

    // Format the datetime as YYYY-MM-DDThh:mm:ss
    const formattedDatetime = now.toISOString().slice(0, 19);

    return formattedDatetime;
}

/**
 * Get the current datetime in GMT-4 and 10 minutes ago
 * @returns
 */
function getEndDatetime() {
    // Get the current datetime in GMT-4
    const now = new Date();
    now.setUTCHours(now.getUTCHours() - 4);
    now.setUTCMinutes(now.getUTCMinutes() - 10);

    // Format the datetime as YYYY-MM-DDThh:mm:ss
    const formattedDatetime = now.toISOString().slice(0, 19);

    return formattedDatetime;
}

/**
 * Retrieves the bet record from the Jili API.
 *
 * @return {Promise<{success: boolean, data: [] | string}>} The bet record object with the following properties:
 *   - success: A boolean indicating whether the request was successful.
 *   - data: The retrieved bet record data. If the request was successful, it will contain an array of bet records. Otherwise, it will contain an error message.
 */
const getBetRecord = async () => {
    const startTime = getStartDatetime();
    const endTime = getEndDatetime();

    const result = await Jili.getBetRecord(startTime, endTime);
    // const result = await Jili.getBetRecord("2023-11-28T3:00:00", "2023-11-28T4:00:00");

    const ret = {
        success: false,
        data: null,
    };

    if (result.success && result.data.ErrorCode == 0) {
        ret.success = true;
        ret.data = result.data.Data.Result;
    } else {
        ret.success = false;
        ret.data = result;
    }

    return ret;
};

const rosesPlus = async (userPhone, money) => {
    const [level] = await connection.query("SELECT * FROM level ");

    const [user] = await connection.query(
        "SELECT `phone`, `code`, `invite`, `vip_level` FROM users WHERE phone = ? AND veri = 1  LIMIT 1 ",
        [userPhone]
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

const giveCommission = async () => {
    const result = await getBetRecord();

    if (!result.success) {
        console.error("[Jili_commision_error: ]", result.data);
        return;
    }

    const betRecord = result.data;

    if (betRecord.length == 0) {
        return;
    }

    betRecord.forEach(async (bet) => {
        const jiliUser = bet.Account;

        const userInfoQuery = await connection.execute(
            "SELECT phone FROM users WHERE jili_account = ?",
            [jiliUser]
        );

        const userInfo = userInfoQuery[0][0];

        if (!userInfo) {
            return;
        }

        rosesPlus(userInfo.phone, bet.Turnover);
    });
};

const exp = {
    giveCommission,
};

export default exp;
