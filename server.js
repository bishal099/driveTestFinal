// include express in the app
import express from "express";
import userModel from "./models/userModel.js";
import bodyParser from 'body-parser';
import router from './routes/routes.js';
import bcrypt from 'bcrypt';
import session from "express-session";
import MongoStore from 'connect-mongo';
import {
    mongoURI
} from "./models/userModel.js";
import {
    isAuthenticatedUser,
    isAdminUser
} from "./middleware/authenticateUserMiddleware.js";


const app = express();


app.use(bodyParser.urlencoded({
    extended: true
}));

const sessionStore = new MongoStore({
    mongoUrl: mongoURI,
    dbName: "driveTest",
    collectionName: "usersSession"
});

app.use(session({
    secret: "My-Secret-Key",
    resave: false,
    saveUninitialized: false,
    sessionStore
}));

// set engine to ejs
app.set('view engine', 'ejs');

// set assets static path as default public
app.use(express.static('public'));


const port = process.env.PORT || 7080;

// app listen to the port
app.listen(port, () => {
    console.log(`**** App is Listening to Port: ${port} ****   \n\nHomepage: http://localhost:${port} \nLogin: http://localhost:${port}/login`);
});

// store condition in res.locals property which can be accessed from any ejs file 
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.user_id ? true : false;
    // global session 
    res.locals.session = req.session;
    res.locals.userType = req.session.user_UserType;
    next();
});
app.use("/", router)