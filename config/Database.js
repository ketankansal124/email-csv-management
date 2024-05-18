const mongoose = require("mongoose")

exports.connect = async (MONGO_URL) => {
    await mongoose.connect(MONGO_URL)
        .then(() => {
            console.log("DB Connection Succesful")
        })
        .catch((err) => {
            console.log("DB Connection Successful");
            console.error(err);
            process.exit(1);
        })
}