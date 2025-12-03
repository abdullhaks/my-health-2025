import { Router } from "express";
import container from "../../config/inversify";
import IUserAuthController from "../../controllers/user/interfaces/IUserAuthController";
import IUserProfileController from "../../controllers/user/interfaces/IUserProfileController";
import { upload, uploadToS3 } from "../../middlewares/common/uploadS3";
import { verifyAccessTokenMidleware } from "../../middlewares/common/checkAccessToken";
import IUserAppointmentController from "../../controllers/user/interfaces/IUserAppointmentController";
import IConversationController from "../../controllers/common/interfaces/IConversationController";
import IMessageController from "../../controllers/common/interfaces/IMessageController";
import IUserSessionController from "../../controllers/user/interfaces/IUserSessionController";
import IDetailsController from "../../controllers/common/interfaces/IDetailsController";
import IPaymentController from "../../controllers/common/interfaces/IPaymentController";
import IDirectDocUploadS3Controller from "../../controllers/common/interfaces/IDirectDocUploadS3Controller";
import IUserReportAnalysisController from "../../controllers/user/interfaces/IUserReportAnalysisController";
import INotificationController from "../../controllers/common/interfaces/INotificationController";
import IUserBlogController from "../../controllers/user/interfaces/IUserBlogController";
import IUserDashboardController from "../../controllers/user/interfaces/IUserDashboardController";
import IUserPrescriptionController from "../../controllers/user/interfaces/IUserPrescriptionController";
import IUserTransactionController from "../../controllers/user/interfaces/IUserTransactionController";
import { resolve } from "path";
import IUserHealthStatusController from "../../controllers/user/interfaces/IUserHealthStatusController";

const userRoutes = Router();

const authCtrl = container.get<IUserAuthController>("IUserAuthController");
const profileCtrl = container.get<IUserProfileController>("IUserProfileController");
const appointmentCtrl = container.get<IUserAppointmentController>("IUserAppointmentController");
const conversationCtrl = container.get<IConversationController>("IConversationController");
const messageCtrl = container.get<IMessageController>("IMessageController");
const sessionCtrl = container.get<IUserSessionController>("IUserSessionController");
const detailsCtrl = container.get<IDetailsController>("IDetailsController");
const paymentCtrl =  container.get<IPaymentController>("IPaymentController");
const directUploadCtrl = container.get<IDirectDocUploadS3Controller>("IDirectDocUploadS3Controller");
const reportAnalysisCtrl = container.get<IUserReportAnalysisController>("IUserReportAnalysisController");
const notificationCtrl = container.get<INotificationController>("INotificationController");
const blogCtrl = container.get<IUserBlogController>("IUserBlogController");
const dashboardCtrl = container.get<IUserDashboardController>("IUserDashboardController");
const prescriptionCtrl = container.get<IUserPrescriptionController>("IUserPrescriptionController");
const transactionCtrl = container.get<IUserTransactionController>("IUserTransactionController");
const healthStatusCtrl = container.get<IUserHealthStatusController>("IUserHealthStatusController");



userRoutes.post("/login",(req,res)=>authCtrl.userLogin(req,res));

userRoutes.post("/logout",(req,res)=>authCtrl.userLogout(req,res))

userRoutes.post("/signup",(req,res)=>authCtrl.userSignup(req,res));

userRoutes.post("/refreshToken",(req,res)=>authCtrl.refreshToken(req,res));

userRoutes.post("/verifyOtp",(req,res)=>authCtrl.verifyOtp(req,res));

userRoutes.get("/resentOtp",(req,res)=>authCtrl.resentOtp(req,res));

userRoutes.get("/forgotPassword",(req,res)=>authCtrl.forgotPassword(req,res));

userRoutes.get("/recoveryPassword",(req,res)=>authCtrl.getRecoveryPassword(req,res));

userRoutes.post("/verifyRecoveryPassword",(req,res)=>authCtrl.verifyRecoveryPassword(req,res));

userRoutes.patch("/resetPassword/:email",(req,res)=>authCtrl.resetPassword(req,res));

userRoutes.patch("/changePassword",(req,res)=>profileCtrl.changePassword(req,res))

userRoutes.patch("/updateProfile",verifyAccessTokenMidleware("user"),( req,res)=>profileCtrl.updateProfile(req,res));

userRoutes.patch("/updateDp" ,verifyAccessTokenMidleware("user"), upload.single("profile"),
uploadToS3("users/profile-images",true), (req,res)=>profileCtrl.updateDp(req,res));

userRoutes.post(
  "/directFileUpload",
  verifyAccessTokenMidleware("user"),
  upload.single("doc"),
  (req, res) => directUploadCtrl.directUpload(req, res)
);


userRoutes.get("/google", authCtrl.googleLoginRedirect); 
userRoutes.get("/google/callback", authCtrl.googleCallback); 

userRoutes.get("/me", authCtrl.getMe.bind(authCtrl));

userRoutes.get("/doctors",verifyAccessTokenMidleware("user"), (req,res)=>appointmentCtrl.fetchingDoctors(req,res));

userRoutes.post(
  "/conversation",
  verifyAccessTokenMidleware("user"),
  (req, res) => conversationCtrl.createConversation(req, res)
);


userRoutes.get(
  "/conversation/:doctorId",
  verifyAccessTokenMidleware("user"),
  (req, res) => conversationCtrl.getConversations(req, res)
);

userRoutes.get(
  "/message/:conversationId",
  verifyAccessTokenMidleware("user"),
  (req, res) => messageCtrl.getMessages(req, res)
);


userRoutes.post(
  "/message",
  verifyAccessTokenMidleware("user"),
  (req, res) => messageCtrl.sendMessage(req, res)
);

userRoutes.get("/sessions",verifyAccessTokenMidleware("user"),(req,res)=> sessionCtrl.getSessions(req,res) );

userRoutes.get("/doctorDetails",verifyAccessTokenMidleware("user"),(req,res)=>detailsCtrl.getDoctor(req,res) )

userRoutes.post(
  "/stripe/create-one-time-payment",
  verifyAccessTokenMidleware("user"),
  (req,res)=>paymentCtrl.createOneTimePaymentSession(req,res)
);

userRoutes.get("/getAppointments",verifyAccessTokenMidleware("user"),(req,res)=>appointmentCtrl.getAppointments(req,res))


userRoutes.patch("/cancelAppointment",verifyAccessTokenMidleware("user"),(req,res)=>appointmentCtrl.cancelAppointment(req,res))

userRoutes.get("/getAnalysisReports", verifyAccessTokenMidleware("user"), (req, res) =>
  reportAnalysisCtrl.getReports(req, res)) 

userRoutes.post("/cancelAnalysisReports", verifyAccessTokenMidleware("user"), (req, res) =>
  reportAnalysisCtrl.cancelAnalysisReports(req, res));

userRoutes.get("/bookedSlots",verifyAccessTokenMidleware("user"),(req,res)=>sessionCtrl.getBookedSlots(req,res))

userRoutes.post("/progressingPayment",verifyAccessTokenMidleware("user"),(req,res)=>paymentCtrl.progressingPayment(req,res))

userRoutes.post("/walletPayment",verifyAccessTokenMidleware("user"),(req,res)=> appointmentCtrl.walletPayment(req,res))

userRoutes.get("/notifications",verifyAccessTokenMidleware("user"),(req,res)=> notificationCtrl.getNewNotifications(req,res) )

userRoutes.patch("/notifications",verifyAccessTokenMidleware("user"),(req,res)=> notificationCtrl.readAllNotifications(req,res) )

userRoutes.get("/getBlogs",verifyAccessTokenMidleware("user"),(req,res)=>blogCtrl.getBlogs(req,res));

userRoutes.get("/dashboard",verifyAccessTokenMidleware("user"),(req,res)=> dashboardCtrl.getDashboardContent(req,res));

userRoutes.get("/prescription",verifyAccessTokenMidleware("user"),(req,res)=> prescriptionCtrl.getPrescription(req,res) );
userRoutes.get("/latestPrescription",verifyAccessTokenMidleware("user"),(req,res)=> prescriptionCtrl.getLatestPrescription(req,res) );
userRoutes.get("/latestDoctorPrescription",verifyAccessTokenMidleware("user"),(req,res)=> prescriptionCtrl.getLatestDoctorPrescription(req,res) );


userRoutes.get("/unAvailableDays",verifyAccessTokenMidleware("user"),(req,res)=>sessionCtrl.getUnavailableDays(req,res));

userRoutes.get("/unAvailableSessions",verifyAccessTokenMidleware("user"),(req,res)=>sessionCtrl.getUnavailablSessions(req,res));

userRoutes.get("/activeBooking",verifyAccessTokenMidleware("user"),(req,res)=>appointmentCtrl.activeBooking(req,res));

userRoutes.get("/getTransactions",verifyAccessTokenMidleware("user"),(req,res)=>transactionCtrl.getTransactions(req,res));

userRoutes.post("/healthStatus",verifyAccessTokenMidleware("user"),(req,res)=>healthStatusCtrl.checkHealthStatus(req,res));



export default userRoutes; 