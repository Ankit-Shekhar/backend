import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()
//the flow comes here from "userRouter" and here "/register" is added as a new endpoint and it passes the control to "registerUser", the "registerUser" function is called from the "user.controller.js" and the control is passed to it. 
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)


export default router