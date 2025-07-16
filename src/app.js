import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:8000",
    credentials: true
}));

//configuring the limit of Json that can be accepted
app.use(express.json({
    limit: "16kb"
}));

//with extended we can send nested objects in the request body, not highly used
app.use(express.urlencoded({extended: true, limit: "16kb"}));

//used to store static files like images, css, js, etc. within my local server
app.use(express.static("public"));

//cookie parser is used to read imp cookies from users browser and update them as well, basically performing CRUD ops over the users cookies
app.use(cookieParser());



//routes import
import userRoute from './routes/user.routes.js'

//routes declaration: its a middleware, so we have to use app.use()
app.use("/api/v1/users", userRoute) //this creates the url: http://localhost:8000/api/v1/users/register
export { app }