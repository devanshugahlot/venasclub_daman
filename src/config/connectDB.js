// const mysql = require("mysql2/promise");
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const connection = mysql.createPool({
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

export default connection;