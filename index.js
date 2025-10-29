const express = require("express")
const app = express()
const port = process.env.PORT || 3000
const dotenv = require("dotenv")
dotenv.config()
const ejs = require("ejs")
const mongoose = require("mongoose")
const URI = process.env.MONGO_URI
app.set("view engine", "ejs")
const bcrypt = require("bcryptjs")
const saltRounds = 10;



app.use(express.urlencoded({extended: true}));
app.use(express.json())
// Connect to MongoDB
mongoose.connect(URI)
.then(()=>{
    console.log("connected to mongodb");
}).catch((err)=>{
    console.log("Not connected", err);
})

// Schema
let userSchema = new mongoose.Schema({
    firstName: {
        type:String, 
        required: [true, "First name is required"],
        match: [/^[A-Za-z]+$/, "First name must contain only letters"],
        trim: true,
    },

    lastName: {
        type:String, 
        required: [true, "Last name is required"],
        match: [/^[A-Za-z]+$/, "Last name must contain only letters"],
        trim: true,
    },

    email: {
        type:String, 
        required: [true, "Email is required"],
        unique: [true, "Email has been taken, please choose another one"],
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
        lowercase: true
    },

    password: {
        type:String, 
        required:true
    },
})

const User = mongoose.model('user', userSchema)

let allStudents = [
    {name: "John", age: 20, city: "New York"},
    {name: "Jane", age: 22, city: "Los Angeles"},
    {name: "Mike", age: 21, city: "Chicago"},
    {name: "Emily", age: 23, city: "Houston"},
    {name: "David", age: 24, city: "Phoenix"},
    {name: "Sarah", age: 22, city: "Philadelphia"}
]

let allMusic = [
    {
        songID: "1",
        songTitle: "twe twe",
        songURL: "https://cdn.trendybeatz.com/audio/Kizz-Daniel-Twe-Twe-(TrendyBeatz.com).mp3",
        songIMG: "https://trendybeatz.com/images/Kizz-Daniel-Twe-Twe-Artwork.jpg"
    },
    {
        songID: "2",
        songTitle: "Jaho",
        songURL: "https://audiomack.com/kizzdaniel/song/jaho",
        songIMG: "https://i.audiomack.com/kizz-daniel-2/49f5450593.webp?width=360"
    },  
    {
        songID: "3",
        songTitle: "My G",
        songURL: "https://audiomack.com/kizzdaniel/song/my-g",
        songIMG: "https://i.audiomack.com/kizzdaniel/1973423649.webp?width=416"
    },  
    {
        songID: "4",
        songTitle: "Odo",
        songURL: "https://audiomack.com/kizzdaniel/song/cough-odo",
        songIMG: "https://i.audiomack.com/kizzdaniel/fe568a10d9.webp?width=416"
    },
    {
        songID: "5",
        songTitle: "Shuperu",
        songURL: "https://audiomack.com/kizzdaniel/song/shu-peru",
        songIMG: "https://i.audiomack.com/kizzdaniel/ee0af5e598.webp?width=416"
    },
    {
        songID: "6",
        songTitle: "Buga",
        songURL: "https://audiomack.com/kizzdaniel/song/buga",
        songIMG: "https://i.audiomack.com/kizzdaniel/5ce99379fc.webp?width=416"
    },
    {
        songID: "7",
        songTitle: "Feran you two",
        songURL: "https://audiomack.com/kizzdaniel/song/feran-you-two",
        songIMG: "https://i.audiomack.com/kizzdaniel/fe568a10d9.webp?width=416"
    },
    {
        songID: "8",
        songTitle: "Blood is thicker",
        songURL: "https://audiomack.com/kizzdaniel/song/blood-is-thicker",
        songIMG: "https://i.audiomack.com/kizzdaniel/fe568a10d9.webp?width=416"
    },
    {
        songID: "9",
        songTitle: "Anchovy",
        songURL: "https://audiomack.com/kizzdaniel/song/anchovy",
        songIMG: "https://i.audiomack.com/kizzdaniel/fe568a10d9.webp?width=416"
    },
    {
        songID: "10",
        songTitle: "Rich till i die",
        songURL: "https://audiomack.com/kizzdaniel/song/rtid-rich-till-i-die",
        songIMG: "https://i.audiomack.com/kizzdaniel/e9326b08ce.webp?width=416"
    }
]

app.get('/', (req, res) => {
    res.send('<h1>Welcome to node.</h1>');
});

app.get('/guy', (req, res)=>{
    res.sendFile(__dirname + "/index.html") 
})

app.get('/students', (req, res)=>{
    res.send(allStudents)
})

app.get('/music', (req, res)=>{
    res.send(allMusic)
})

app.get("/signin", (req, res)=>{
    res.render("signin")
})

app.get("/dashboard", (req, res)=>{
    res.render("dashboard")
})

app.get("/signup", (req, res)=>{
    res.render("signup")
})

app.post("/signup", (req, res)=>{
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
        .then((existingUser) =>{
            if (existingUser) {
                res.status(400).send("Email already exists");
                return Promise.reject("User already exists")
            }

            return bcrypt.hash(password, saltRounds);
        })
        .then((hashedPassword) => {
            if (!hashedPassword) return;   // If user exists, skip this step, It is optional

            // Step 4 is to Save new user
            const newUser = new User ({
                firstName,
                lastName,
                email,
                password: hashedPassword //Store hashed password not the plain text password
            });

            return newUser.save();
        })
        .then((savedUser) =>{
            if (!savedUser) return;  //If user exists, skip this step, it is also optional
            console.log("User registered succesfully")
            res.redirect("/signin")
        })
        .catch((err) =>{
            if (err !== "User  already exists") {
                console.error("Error saving user", err);
                res.status(500).send("Internal Server Error")
            }
        });
});


app.listen(port, () => {
    console.log("Server is running on port 3000");
})