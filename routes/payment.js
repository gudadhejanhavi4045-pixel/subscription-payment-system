const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const db = require("../config/db");
const transporter = require("../config/mailer");

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// =======================
// CREATE ORDER
// =======================
router.post("/create-order", async (req, res) => {

    const { userId, plan } = req.body;

    let amount = 0;

    switch (plan) {
        case "Bronze":
            amount = 10000;
            break;
        case "Silver":
            amount = 30000;
            break;
        case "Gold":
            amount = 100000;
            break;
        default:
            return res.status(400).json({
                success: false,
                message: "Invalid subscription plan"
            });
    }

    try {

        const order = await razorpay.orders.create({
            amount,
            currency: "INR",
            receipt: "receipt_" + Date.now()
        });

        res.json({
            success: true,
            order
        });

    } catch (err) {

        console.log("CREATE ORDER ERROR:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

// =======================
// VERIFY PAYMENT
// =======================
router.post("/verify-payment", (req, res) => {

    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        userId,
        plan
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
            success: false,
            message: "Payment Verification Failed"
        });
    }

    // Update subscription plan
    db.query(
        "UPDATE users SET plan=? WHERE id=?",
        [plan, userId],
        (err) => {

            if (err) {

                console.log("=================================");
                console.log("UPDATE ERROR");
                console.log(err);
                console.log("=================================");

                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            // Fetch user details
            db.query(
                "SELECT * FROM users WHERE id=?",
                [userId],
                async (err, result) => {

                    if (err) {

                        console.log("=================================");
                        console.log("SELECT ERROR");
                        console.log(err);
                        console.log("=================================");

                        return res.status(500).json({
                            success: false,
                            message: err.message
                        });
                    }

                    if (result.length === 0) {

                        return res.status(404).json({
                            success: false,
                            message: "User not found"
                        });

                    }

                    const user = result[0];

                    try {

                        const info = await transporter.sendMail({

                            from: process.env.EMAIL_USER,

                            to: user.email,

                            subject: "Subscription Activated",

                            html: `
                            <h2>Subscription Activated Successfully</h2>

                            <p>Hello <b>${user.name}</b>,</p>

                            <p>Your subscription has been activated.</p>

                            <table border="1" cellpadding="10">

                                <tr>
                                    <th>Plan</th>
                                    <td>${plan}</td>
                                </tr>

                                <tr>
                                    <th>Amount</th>
                                    <td>${
                                        plan === "Bronze"
                                            ? "₹100"
                                            : plan === "Silver"
                                            ? "₹300"
                                            : "₹1000"
                                    }</td>
                                </tr>

                            </table>

                            <br>

                            <h3>Thank you for choosing our platform.</h3>
                            `

                        });

                        console.log("=================================");
                        console.log("EMAIL SENT SUCCESSFULLY");
                        console.log(info);
                        console.log("=================================");

                    } catch (emailError) {

                        console.log("EMAIL ERROR");
                        console.log(emailError);

                    }

                    res.json({
                        success: true,
                        message: "Subscription Activated & Email Sent"
                    });

                }
            );

        }
    );

});

module.exports = router;