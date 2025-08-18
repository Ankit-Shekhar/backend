// require('dotenv').config({path: './.env'}); // Load's environment variables from .env file and makes them available everywhere required in the application. :: "As early as possible import the dotenv file and configure it"
//import syntax for dotenv is an experimental feature, so to use that we have to configure it in package.json as ""dev": "nodemon -r dotenv/config --experimental-json-modules src/main.js""
import dotenv from "dotenv"

import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDb from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
});

connectDb()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
})
.catch((error) => {
    console.error(`Database connection failed: ${error}`);
});












// //always use "async await" and "try catch" when dealing with database

// // "ifis" statement is a way to write functions: below is an example.

// (async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//     } catch (error) {
//         console.log(`ERROR: ${error}`);
//     }
// })()

//The above can be done but a more better practise is in the "index.js"