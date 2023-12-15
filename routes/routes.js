import express from "express";
import Controller from "../controller/controller.js";
import {
    isAuthenticatedUser,
    isAdminUser,
    isExaminerUser
} from "../middleware/authenticateUserMiddleware.js";


const router = express.Router();


router.get("/", Controller.getHomepage);
router.get("/login", Controller.getLoginSignupPage);
router.post("/login", Controller.postLogin);
router.post("/signup", Controller.postSignUp);
router.get("/dashboard", isAuthenticatedUser, Controller.getDashboard);
router.get("/g2_page", isAuthenticatedUser, Controller.getG2Page);
router.get("/g_page", isAuthenticatedUser, Controller.getGPage);
router.post("/g2_page", Controller.postG2Page);
router.post("/g_page_post", Controller.postGPage);
router.post("/logout", Controller.logout);

router.get("/appointment", isAdminUser, Controller.getAppointmentPage);
router.post("/appointment", Controller.postAppointmentPage);
router.get('/getAvailableSlots', Controller.getAvailableSlots);
router.get('/getAvailableSlotsForDriver', Controller.getAvailableSlotsForDriver);

router.get("/examiner_dashboard", isExaminerUser, Controller.getExaminerDashboard);
router.get("/examiner_page", isExaminerUser, Controller.getExaminerPage);
router.post("/examiner_page", isExaminerUser, Controller.postExaminerPage);

router.get("/admin_dashboard", isAdminUser, Controller.getAdminDashboard);



export default router;