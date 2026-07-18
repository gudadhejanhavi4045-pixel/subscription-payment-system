const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/db");

// Register User
router.post("/register", async (req, res) => {

    const { name, email, password } = req.body;

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
        INSERT INTO users(name,email,password)
        VALUES(?,?,?)
        `;

        db.query(sql, [name, email, hashedPassword], (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: "Registration Successful"
            });

        });

    } catch (error) {

        res.status(500).json(error);

    }

});
// Login User
router.post("/login", (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(400).json({
                message: "User Not Found"
            });
        }

        const user = result[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({
                message: "Incorrect Password"
            });
        }

        res.json({
            message: "Login Successful",
            user
        });

    });

});
module.exports = router;