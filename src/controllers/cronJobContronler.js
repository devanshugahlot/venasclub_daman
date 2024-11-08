import connection from "../config/connectDB.js";
import winGoController from "./winGoController.js";
import k5Controller from "./k5Controller.js";
import k3Controller from "./k3Controller.js";
import cron from "node-cron";

let timeNow = Date.now();

const cronJobGame1p = (io) => {
    cron.schedule("*/1 * * * *", async () => {
        // await resetWingoPeriod();
        await winGoController.addWinGo(1);
        await winGoController.handlingWinGo1P(1);
        const [winGo1] = await connection.execute(
            'SELECT * FROM `wingo` WHERE `game` = "wingo" ORDER BY `id` DESC LIMIT 2 ',
            []
        );
        const data = winGo1; // Cầu mới chưa có kết quả
        io.emit("data-server", { data: data });

        await k5Controller.add5D(1);
        await k5Controller.handling5D(1);
        const [k5D] = await connection.execute(
            "SELECT * FROM 5d WHERE `game` = 1 ORDER BY `id` DESC LIMIT 2 ",
            []
        );
        const data2 = k5D; // Cầu mới chưa có kết quả
        io.emit("data-server-5d", { data: data2, game: "1" });

        await k3Controller.addK3(1);
        await k3Controller.handlingK3(1);
        const [k3] = await connection.execute(
            "SELECT * FROM k3 WHERE `game` = 1 ORDER BY `id` DESC LIMIT 2 ",
            []
        );
        const data3 = k3; // Cầu mới chưa có kết quả
        io.emit("data-server-k3", { data: data3, game: "1" });
    });
    cron.schedule("*/3 * * * *", async () => {
        await winGoController.addWinGo(3);
        await winGoController.handlingWinGo1P(3);
        const [winGo1] = await connection.execute(
            'SELECT * FROM `wingo` WHERE `game` = "wingo3" ORDER BY `id` DESC LIMIT 2 ',
            []
        );
        const data = winGo1; // Cầu mới chưa có kết quả
        io.emit("data-server", { data: data });

        await k5Controller.add5D(3);
        await k5Controller.handling5D(3);
        const [k5D] = await connection.execute(
            "SELECT * FROM 5d WHERE `game` = 3 ORDER BY `id` DESC LIMIT 2 ",
            []
        );
        const data2 = k5D; // Cầu mới chưa có kết quả
        io.emit("data-server-5d", { data: data2, game: "3" });

        await k3Controller.addK3(3);
        await k3Controller.handlingK3(3);
        const [k3] = await connection.execute(
            "SELECT * FROM k3 WHERE `game` = 3 ORDER BY `id` DESC LIMIT 2 ",
            []
        );
        const data3 = k3; // Cầu mới chưa có kết quả
        io.emit("data-server-k3", { data: data3, game: "3" });
    });
    cron.schedule("*/5 * * * *", async () => {
        await winGoController.addWinGo(5);
        await winGoController.handlingWinGo1P(5);
        const [winGo1] = await connection.execute(
            'SELECT * FROM `wingo` WHERE `game` = "wingo5" ORDER BY `id` DESC LIMIT 2 ',
            []
        );
        const data = winGo1; // Cầu mới chưa có kết quả
        io.emit("data-server", { data: data });

        await k5Controller.add5D(5);
        await k5Controller.handling5D(5);
        const [k5D] = await connection.execute(
            "SELECT * FROM 5d WHERE `game` = 5 ORDER BY `id` DESC LIMIT 2 ",
            []
        );
        const data2 = k5D; // Cầu mới chưa có kết quả
        io.emit("data-server-5d", { data: data2, game: "5" });

        await k3Controller.addK3(5);
        await k3Controller.handlingK3(5);
        const [k3] = await connection.execute(
            "SELECT * FROM k3 WHERE `game` = 5 ORDER BY `id` DESC LIMIT 2 ",
            []
        );
        const data3 = k3; // Cầu mới chưa có kết quả
        io.emit("data-server-k3", { data: data3, game: "5" });
    });
    cron.schedule("*/10 * * * *", async () => {
        await winGoController.addWinGo(10);
        await winGoController.handlingWinGo1P(10);
        const [winGo1] = await connection.execute(
            'SELECT * FROM `wingo` WHERE `game` = "wingo10" ORDER BY `id` DESC LIMIT 2 ',
            []
        );
        const data = winGo1; // Cầu mới chưa có kết quả
        io.emit("data-server", { data: data });

        await k5Controller.add5D(10);
        await k5Controller.handling5D(10);
        const [k5D] = await connection.execute(
            "SELECT * FROM 5d WHERE `game` = 10 ORDER BY `id` DESC LIMIT 2 ",
            []
        );
        const data2 = k5D; // Cầu mới chưa có kết quả
        io.emit("data-server-5d", { data: data2, game: "10" });

        await k3Controller.addK3(10);
        await k3Controller.handlingK3(10);
        const [k3] = await connection.execute(
            "SELECT * FROM k3 WHERE `game` = 10 ORDER BY `id` DESC LIMIT 2 ",
            []
        );
        const data3 = k3; // Cầu mới chưa có kết quả
        io.emit("data-server-k3", { data: data3, game: "10" });
    });

    cron.schedule("0 0 * * *", async () => {
        await connection.execute("UPDATE users SET roses_today = ?", [0]);
        await connection.execute("UPDATE point_list SET money = ?", [0]);
        await resetWingoPeriod();
    });
};

const resetWingoPeriod = async () => {
    let arr = ["wingo10", "wingo5", "wingo3", "wingo"];

    const period = getFreshPeriod();
    console.log("resetting wingo period...");

    for (let i = 0; i < arr.length; i++) {
        const res = await connection.execute(
            "SELECT * FROM wingo WHERE status = 0 AND game = ?",
            [arr[i]]
        );

        if (res[0].length == 0) {
            await connection.execute(
                "INSERT INTO wingo SET period = ?, game = ?, amount = 0, status = 0, time = ?",
                [String(period), arr[i], timeNow]
            );
        } else {
            const first = res[0][0];

            await connection.execute(
                "UPDATE wingo SET period = ?, time = ? WHERE id = ?",
                [String(period), first.time, first.id]
            );

            if (res[0].length > 1) {
                for (let j = 1; j < res[0].length; j++) {
                    await connection.execute(
                        "UPDATE wingo SET period = ?, status = 1, time = ? WHERE id = ?",
                        [String(period), res[0][j].time, res[0][j].id]
                    );
                }
            }
        }

        // const sql =
        //     "INSERT INTO wingo SET period = ?, game = ?, amount = 6, status = 1, time = ?";
        // await connection.execute(sql, [String(period), arr[i], timeNow]);
        // const sql =
        //     "INSERT INTO wingo SET period = ?, game = ?, amount = 0, status = 0, time = ?";
        // await connection.execute(sql, [String(period), arr[i], timeNow]);
    }
};

const getFreshPeriod = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return Number(`${year}${month}${day}0001`);
};

const exp = {
    cronJobGame1p,
};

export default exp;
