const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

db.connect((err) => {
    if (err) {
        console.log("Connection Error:", err);
        return;
    }

    console.log("====================================");
    console.log("Connected Database:", process.env.MYSQLDATABASE);
    console.log("Host:", process.env.MYSQLHOST);
    console.log("====================================");

    db.query("SHOW CREATE TABLE users", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result[0]["Create Table"]);
        }
    });
});

module.exports = db;