const bcrypt = require("bcryptjs")
const saltRounds = 10;
const nodemailer = require("nodemailer");
const User = require("../models/user.models");
const jwt = require("jsonwebtoken");






const getSignup = (req, res) => {
    res.render("signup")
}

const postSignup = (req, res) => {
    const { firstName, lastName, email, password } = req.body
    console.log(req.body)

    // Step 1 is to validate strong password // Regex isMatch
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
        return res.status(400).send(
            "Password must be at least 8 characters long, contain uppercase, lowercase, a number, and a special character"
        );
    }

    User.findOne({ email })
        .then((existingUser) => {
            if (existingUser) {
                res.status(400).send("Email already exists");
                return Promise.reject("User already exists")
            }

            return bcrypt.hash(password, saltRounds);
        })
        .then((hashedPassword) => {
            if (!hashedPassword) return;   // If user exists, skip this step, It is optional

            // Step 4 is to Save new user
            const newUser = new User({
                firstName,
                lastName,
                email,
                password: hashedPassword //Store hashed password not the plain text password
            });

            console.log(newUser)

            return newUser.save();
        })
        .then((savedUser) => {
            if (!savedUser) return;  //If user exists, skip this step, it is also optional
            console.log("User registered succesfully")
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'oa8903532@gmail.com',
                    pass: 'bgcroiyfuykpzyyv'
                }
            });

            let mailOptions = {
                from: 'oa8903532@gmail.com',
                to: [req.body.email],
                subject: 'Welcome to our routerlication',

                html: `
                <!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Order Confirmation</title>
    <style>
      /* Email-friendly base styles */
      body{margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#243b53}
      .outer{width:100%;padding:24px 12px}
      .card{max-width:680px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(34,50,71,0.08)}
      .hero{background:linear-gradient(90deg,#7c5cff 0%,#53d2ff 100%);padding:22px 24px;color:#021028}
      .brand{display:flex;align-items:center;gap:12px}
      .mark{width:46px;height:46px;border-radius:8px;background:#fff;color:#081124;font-weight:800;display:inline-flex;align-items:center;justify-content:center}
      .title{font-size:18px;font-weight:700;margin:0}
      .subtitle{font-size:13px;margin:4px 0 0;color:#0b2940}
      .content{padding:20px 24px}
      h2{margin:0;font-size:20px;color:#10283a}
      p{margin:12px 0;color:#526f86;line-height:1.45}
      .order-meta{display:flex;flex-wrap:wrap;gap:12px;margin:14px 0}
      .meta{background:#f6fbff;border:1px solid rgba(5,35,73,0.04);padding:10px 12px;border-radius:8px;font-size:13px;color:#09304a}
      .items{width:100%;border-collapse:collapse;margin-top:12px}
      .items td{padding:12px 8px;border-bottom:1px solid #eef5fb;font-size:14px;color:#2b4b61}
      .items .item-name{font-weight:600}
      .total{display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:10px;border-top:1px dashed #e6f0f8}
      .btn{display:inline-block;padding:12px 20px;border-radius:10px;background:linear-gradient(90deg,#7c5cff,#53d2ff);color:#041024;font-weight:700;text-decoration:none}
      .muted{font-size:13px;color:#86a0b8}
      .footer{padding:14px 20px;background:#fbfdff;border-top:1px solid #edf6ff;text-align:center;color:#7f98ad;font-size:13px}
      @media (max-width:520px){.brand{gap:8px}.content{padding:16px}.hero{padding:18px}}
    </style>
  </head>
  <body>
    <div class="outer">
      <div class="card">
        <div class="hero">
          <div class="brand">
            <div class="mark">hw</div>
            <div>
              <div class="title">haywhy — Order Confirmed</div>
              <div class="subtitle">Thanks for your purchase — your order is on its way</div>
            </div>
          </div>
        </div>

        <div class="content">
          <h2>Hi {{customerName}},</h2>
          <p>We received your order <strong>#{{orderNumber}}</strong> placed on {{orderDate}}. Below is a summary of your purchase — we'll send another email when your items ship.</p>

          <div class="order-meta">
            <div class="meta">Order #: <strong>{{orderNumber}}</strong></div>
            <div class="meta">Placed: <strong>{{orderDate}}</strong></div>
            <div class="meta">Payment: <strong>{{paymentMethod}}</strong></div>
          </div>

          <!-- itemsHtml is expected to be pre-rendered server-side as table rows -->
          <table class="items" role="presentation" width="100%">
            <tbody>
              {{itemsHtml}}
            </tbody>
          </table>

          <div class="total">
            <div style="font-size:15px;color:#2b4b61">Order Total</div>
            <div style="font-size:18px;font-weight:800;color:#10283a">{{total}}</div>
          </div>

          <p style="margin-top:18px">Need to change something? You can view your order details or contact our support team if you have any questions.</p>

          <div style="margin-top:14px;display:flex;gap:12px;flex-wrap:wrap">
            <a class="btn" href="{{viewOrderUrl}}">View your order</a>
            <a style="align-self:center;text-decoration:none;color:#4f6b87;font-weight:600" href="{{supportUrl}}">Contact support</a>
          </div>
        </div>

        <div class="footer">If you didn't place this order, please <a href="{{supportUrl}}" style="color:#355a78">contact support</a> immediately. © {{year}} haywhy</div>
      </div>
    </div>
  </body>
</html>

                `
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email sent: " + info.response)
                }
            });
            res.status(201).json({success: true, message: "User signed up Successfully"})
        })
        .catch((err) => {
            if (err !== "User  already exists") {
                console.error("Error saving user", err);
                res.status(500).send("Internal Server Error")
            }
        });
}


const getSignin = (req, res) => {
    res.render("signin")
}

const postSignin = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("All fields are required")
    }

    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                res.status(400).send("No account found with that mail")
            }

            bcrypt.compare(password, user.password)
                .then((isMatch) => {
                    if (isMatch) {
                        console.log("Login sucessful")

                        const token = jwt.sign({id: user._id, email: user.email}, process.env.JWT_SECRET, { expiresIn: "1d"});
                        console.log(token);


                        res.status(201).json({
                            success: true, 
                            message: "User signed in Successfully",
                            token,
                            user:{
                                email: user.email,
                                firstName: user.firstName,
                                lastName: user.lastName
                            }
                        });
                    } else {
                        console.log("Invalid password")
                        res.status(400).send("Invalid email or password")
                    }
                })
                .catch((err) => {
                    console.error("Error comparing password", err);
                    res.status(500).send("Internal Server Error")
                });
        })
        .catch((err) => {
            console.error("Error finding user:", err);
            res.status(500).send("Internal server error")
        });
}

const getDashboard = (req, res) => {
    res.render("dashboard")
}

let allStudents = [
    { name: "John", age: 20, city: "New York" },
    { name: "Jane", age: 22, city: "Los Angeles" },
    { name: "Mike", age: 21, city: "Chicago" },
    { name: "Emily", age: 23, city: "Houston" },
    { name: "David", age: 24, city: "Phoenix" },
    { name: "Sarah", age: 22, city: "Philadelphia" }
]

const getStudents = (req, res) => {
    res.send(allStudents)
}

module.exports = {
    getSignin,
    getSignup,
    getDashboard,
    getStudents,
    postSignup,
    postSignin
}