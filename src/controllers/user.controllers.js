import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {

    // LOGIC :: THAT HAS TO BE EXECUTED.

    // get user details from Frontend
    // validation: should not be empty
    // check if user already exists: via. username, email
    // check for coverimages, check for avatar because avatar is mandatory to give here.
    // upload them on cloudinary
    // create user object - create entry in DB (because mongoDb is a noSql type db so there mostly data is passed in form of objects)
    // remove password and refresh token field from response (because the returned response will have passwords and refresh tokens as well in it, it actually returns all the data that we pass to it, so we remove the above mentioned fields from it and then show it to the user.)
    // check for user creation (final check that user was created successfully or not, wheather the response had any value or was null?)
    // return response

    // Debug: Check what we're receiving
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);
    console.log("Content-Type:", req.headers['content-type']);


    // { email, fullName, username, password } these are the data fields that we will recieve from user from the "body" thats why we used "req.body" 
    const { email, fullName, username, password } = req.body || {};
    console.log("email: ", email);
    if (email === "") {
        throw new ApiError(400, "This field is Mandatory")
    }
    console.log("username: ", username);
    if (username === "") {
        throw new ApiError(400, "This field is Mandatory")
    }
    console.log("fullName: ", fullName);
    if (fullName === "") {
        throw new ApiError(400, "This field is Mandatory")
    }
    console.log("password: ", password);
    if (password === "") {
        throw new ApiError(400, "This field is Mandatory")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with this email or username already exists")
    }

    // local path of avatar stored in our local storage (server). Here putting '?' because maybe for any reason we may not have access to files and avatar as there are multiple files being uploaded and [0]index of avatar returns an object, so it is possible that for some reason it may not return that object.
    // const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // both the above cases will create a problem that if we didnt uploaded any one of the required then also the will try to access the data on the [0] index of avatar and coverImage which then will be undefined and then it will throw this error "TypeError: Cannot read properties of undefined (reading '0')" and not our custom error which says that "this file is required". So, better way is to check them using a 'if' condition which is done below.

    //if we didnt uploaded coverImg and did'nt even check its local path then it can throw an error, so to resolve it we ::

    let coverImageLocalPath;

    // here we check 
    // 1. are we getting files from body or not
    // 2. the returning array has coverImage or not
    // 3. the returned coverImage has any properties or not
    // if all of these are true then its proved that we recieved the "coverImageLocalPath" and we can extract its path from their.
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path
    }
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // uploaded avater and coverImage to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // First check if avatar is successfully uploaded or not? if avatar is not successfully uploaded then give a error otherwise it will create an error in DB because avatar is mandatory to upload.
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }


    const user = await User.create({
        fullName,
        avatar: avatar.url,
        // creating a check for "coverImage" that if it has been successfully uploaded then upload its url , if not then let it remain empty as its not mandatory to upload "coverImage".
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // checking if "user" is successfully created or not, if not then throw an error , if created then remove the password and refresh token from the response and then return the response to user.
    const createdUser = await User.findById(user._id).select(
        //by default everythink is selected, so the (-ve) represents what not to select
        "-password -refreshToken"
    )


    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // returning the response::
    return res.status(201).json(
        // creating an object of "ApiResponse" utility that we made and passing the parameters that we need as response ::
        // new ApiResponse -> object of ApiResponse class (statusCode, Data, "Message")
        new ApiResponse(200, createdUser, "User registered Successfuly")
    )

})



export { registerUser } 