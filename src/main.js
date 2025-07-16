// require('dotenv').config({path: './.env'}); // Load environment variables from .env file
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