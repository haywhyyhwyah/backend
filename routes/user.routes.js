const express = require("express")
const router = express.Router()

const {getSignin, getSignup, getDashboard, getStudents, postSignup, postSignin} = require("../controllers/user.controllers")

router.get('/', (req, res) => {
    res.send('<h1>Welcome to node.</h1>');
});

router.get('/guy', (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

router.get('/students', getStudents )

router.get('/music', (req, res) => {
    res.send(allMusic)
})

router.get("/signin", getSignin )

router.get("/signup", getSignup )

router.post("/signup", postSignup);


router.post("/signin", postSignin);

router.get("/dashboard", getDashboard )


module.exports = router;