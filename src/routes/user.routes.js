import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword,forgotPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getUserWatchHistory } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
//the flow comes here from "userRouter" from app.js and here "/register" is added as a new endpoint and it passes the control to "registerUser", the "registerUser" function is called from the "user.controller.js" and the control is passed to it. 
router.route("/register").post(

    // using the upload Middleware from multer.middleware.js to handle file handling(to accept fields)
    upload.fields([
        {
            // when making frontend , their the form from which avatar will be sent should have the same name given here ie. "avatar"
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

router.route("/login").post(loginUser)
router.route("/forgot-password").post(forgotPassword)

// secured routes :: means where user has tot be logged in to continue
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/update-user-password").post(verifyJWT, changeCurrentPassword)
router.route("/fetch-current-user-details").get(verifyJWT, getCurrentUser)
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails)
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/update-coverImage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

// to get data from url: params, we use this "("/channel/:username")" syntax:
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile)
router.route("/watch-history").get(verifyJWT, getUserWatchHistory)
export default router 