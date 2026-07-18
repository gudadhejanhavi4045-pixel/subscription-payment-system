const mysql = require("mysql2");

const db = mysql.createConnection({

    host:"localhost",
    user:"root",
    password:"Janhavigudadhe@4015",
    database:"subscription_db"

});

db.connect((err)=>{

    if(err){
        console.log(err);
    }
    else{
        console.log("MySQL Connected");
    }
});

module.exports = db;