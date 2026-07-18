const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/ask", (req, res) => {

    const { user_id, question } = req.body;

    if (!user_id || !question) {
        return res.status(400).json({
            success: false,
            message: "User ID and Question are required"
        });
    }

    db.query(
        "SELECT plan FROM users WHERE id = ?",
        [user_id],
        (err, userResult) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            if (userResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            const plan = userResult[0].plan || "Free";

            let limit = 1;

            switch (plan) {
                case "Bronze":
                    limit = 5;
                    break;

                case "Silver":
                    limit = 10;
                    break;

                case "Gold":
                    limit = -1; // Unlimited
                    break;

                default:
                    limit = 1;
            }

            if (limit === -1) {

                db.query(
                    "INSERT INTO questions(user_id,question) VALUES(?,?)",
                    [user_id, question],
                    (err) => {

                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message: "Failed to post question"
                            });
                        }

                        res.json({
                            success: true,
                            message: "Question Posted Successfully",
                            remaining: "Unlimited"
                        });

                    }
                );

                return;
            }

            db.query(
                `SELECT COUNT(*) AS total
                 FROM questions
                 WHERE user_id=?
                 AND DATE(created_at)=CURDATE()`,
                [user_id],
                (err, countResult) => {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "Database Error"
                        });
                    }

                    const total = countResult[0].total;

                    if (total >= limit) {

                        return res.status(403).json({
                            success: false,
                            message: `Daily limit reached. Your ${plan} plan allows only ${limit} question(s) per day.`
                        });

                    }

                    db.query(
                        "INSERT INTO questions(user_id,question) VALUES(?,?)",
                        [user_id, question],
                        (err) => {

                            if (err) {
                                return res.status(500).json({
                                    success: false,
                                    message: "Failed to post question"
                                });
                            }

                            res.json({
                                success: true,
                                message: "Question Posted Successfully",
                                remaining: limit - total - 1
                            });

                        }
                    );

                }
            );

        }
    );

});

module.exports = router;