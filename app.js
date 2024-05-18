const express = require("express");
const app = express();
const { connect } = require("./config/Database");
require("dotenv").config();


const listRoutes = require("./routes/List");


app.use(express.json());
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

app.get("/", (req, res) => {
    res.send("Welcome to the CSV Email Management API");
});

app.use("/mathongo/v1/lists",listRoutes);

const start = async () => {
    try {
        await connect(MONGO_URL);
        app.listen(PORT, () => {
            console.log("Server is listening at " + PORT);
        });
    } catch (error) {
        console.error("Error starting the server:", error.message);
    }
};

start();


