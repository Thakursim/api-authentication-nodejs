const express = require("express")
const mongoose = require("mongoose")
const app = express()
const authRoute = require("./routes/auth")

const dbURI = "mongodb://localhost/authentication"
app.use(express.json()) // Used to make sure the server can receive json as req body.
app.use("/api/auth", authRoute)

mongoose.connect(dbURI , {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection

db.on("error", (err)=>{console.log(err)})
db.once("open", () =>{console.log("DB started successfully")})

app.listen(3000, () => {console.log("Server started at 3000")})