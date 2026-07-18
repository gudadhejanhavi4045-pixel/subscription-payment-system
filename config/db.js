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
        console.log("====================================");
        console.log("MySQL Connection Error:");
        console.log(err);
        console.log("====================================");
    } else {
        console.log("====================================");
        console.log("MySQL Connected");
        console.log("====================================");

        db.query("SELECT DATABASE() AS db", (err, result) => {
            if (err) {
                console.log("Database Check Error:", err);
            } else {
                console.log("Connected Database:", result[0].db);
            }
        });

        db.query("DESCRIBE users", (err, result) => {
            if (err) {
                console.log("Users Table Error:", err);
            } else {
                console.log("Users Table Structure:");
                console.table(result);
            }
        });
    }
});

module.exports = db;