import { Container } from "inversify";

import userModel from "../models/user";
import OtpModel from "../models/otp";
import adminModel from "../models/admin";
import doctorModel from "../models/doctor";
import subscriptionModel from "../models/subscription";
import conversationModel from "../models/conversation";
import messageModel from "../models/message";
import sessionModel from "../models/session";
import appointmentModel from "../models/appointment";
import reportAnalysisModel from "../models/reportAnalysis";
import analyticsModel from "../models/analytics";
import transactionModel from "../models/transaction";
import blogModel from "../models/blog";
import advertisementModel from "../models/advertisement";
import notificationModel from "../models/notification";
import prescriptionModel from "../models/prescription";
import payoutModel from "../models/payout";
import unAvailableDayModel from "../models/unAvailableDay";
import unAvailableSessionModel from "../models/unAvailableSession";
import progressPaymentModel from "../models/progressingPayment";

//controllers..................................................................
import UserAuthController from "../controllers/user/implementations/userAuthController";
import IUserAuthController from "../controllers/user/interfaces/IUserAuthController";
import UserProfileController from "../controllers/user/implementations/userProfileController";
import IUserProfileController from "../controllers/user/interfaces/IUserProfileController";
import UserAppointmentController from "../controllers/user/implementations/userAppointmentController";
import IUserAppointmentController from "../controllers/user/interfaces/IUserAppointmentController";
import UserSessionController from "../controllers/user/implementations/userSessionController";
import IUserSessionController from "../controllers/user/interfaces/IUserSessionController";
import UserReportAnalyisController from "../controllers/user/implementations/userReportAnalyisController";
import IUserReportAnalysisController from "../controllers/user/interfaces/IUserReportAnalysisController";
import UserBlogController from "../controllers/user/implementations/userBlogController";
import IUserBlogController from "../controllers/user/interfaces/IUserBlogController";
import UserDashboardController from "../controllers/user/implementations/userDashboardController";
import IUserDashboardController from "../controllers/user/interfaces/IUserDashboardController";
import UserPrescriptionController from "../controllers/user/implementations/userPrescriptionController";
import IUserPrescriptionController from "../controllers/user/interfaces/IUserPrescriptionController";
import UserTransactionController from "../controllers/user/implementations/userTransactionController";
import IUserTransactionController from "../controllers/user/interfaces/IUserTransactionController";
import UserHealthStatusController from "../controllers/user/implementations/userHealthStatusController";
import IUserHealthStatusController from "../controllers/user/interfaces/IUserHealthStatusController";


import AdminAuthController from "../controllers/admin/implementations/adminAuthController";
import IAdminAuthController from "../controllers/admin/interfaces/IAdminAuthController";
import AdminUserController from "../controllers/admin/implementations/adminUserController";
import IAdminUserController from "../controllers/admin/interfaces/IAdminUserController";
import AdminDoctorController from "../controllers/admin/implementations/adminDoctorController";
import IAdminDoctorController from "../controllers/admin/interfaces/IAdminDoctorController";
import AdminProductController from "../controllers/admin/implementations/adminProductController";
import IAdminProductController from "../controllers/admin/interfaces/IAdminProductController";
import AdminAppointmentController from "../controllers/admin/implementations/adminAppointmentController";
import IAdminAppointmentController from "../controllers/admin/interfaces/IAdminAppointmentController";
import AdminAnalyticsContorller from "../controllers/admin/implementations/adminAnalyticsContorller";
import IAdminAnalyticsController from "../controllers/admin/interfaces/IAdminAnalyticsController";
import AdminTransactionController from "../controllers/admin/implementations/adminTransactionController";
import IAdminTransactionController from "../controllers/admin/interfaces/IAdminTransactionController";
import IAdminPayoutController from "../controllers/admin/interfaces/IAdminPayoutController";
import AdminPayoutController from "../controllers/admin/implementations/adminPayoutController";


import DoctorAuthController from "../controllers/doctor/implementations/doctorAuthController";
import IDoctorAuthController from "../controllers/doctor/interfaces/IDoctorAuthController";
import DoctorProfileController from "../controllers/doctor/implementations/doctorProfileController";
import IDoctorProfileController from "../controllers/doctor/interfaces/IDoctorProfileController";
import DoctorSessionController from "../controllers/doctor/implementations/doctorSessionController";
import IDoctorSessionController from "../controllers/doctor/interfaces/IDoctorSessionController";
import DoctorAppointmentController from "../controllers/doctor/implementations/doctorAppointmentController";
import IDoctorAppointmentController from "../controllers/doctor/interfaces/IDoctorAppointmentController";
import DoctorReportAnalysisController from "../controllers/doctor/implementations/doctorReportAnalyisController";
import IDoctorReportAnalysisController from "../controllers/doctor/interfaces/IDoctorReportAnalysisController";
import DoctorPlansController from "../controllers/doctor/implementations/doctorPlansController";
import IDoctorPlanController from "../controllers/doctor/interfaces/IDoctorPlanController";
import DoctorBlogController from "../controllers/doctor/implementations/doctorBlogController";
import IDoctorBlogController from "../controllers/doctor/interfaces/IDoctorBlogController";
import IDoctorAdvertisementController from "../controllers/doctor/interfaces/IDoctorAdvertisementController";
import DoctorAdvertisementController from "../controllers/doctor/implementations/doctorAdvertisementController";
import IDoctorPrescriptionController from "../controllers/doctor/interfaces/IDoctorPrescriptionController";
import DoctorPrescriptionController from "../controllers/doctor/implementations/doctorPrescriptionController";
import IDoctorDashboardController from "../controllers/doctor/interfaces/IDoctorDashboardController";
import DoctorDashboardController from "../controllers/doctor/implementations/doctorDashboardController";
import IDoctorPayoutController from "../controllers/doctor/interfaces/IDoctorPayoutController";
import DoctorPayoutController from "../controllers/doctor/implementations/doctorPayoutController";
import IDoctorTransactionController from "../controllers/doctor/interfaces/IDoctorTransactionController";
import DoctorTransactionController from "../controllers/doctor/implementations/doctorTransactionController";


import PaymentController from "../controllers/common/implementations/paymentController"
import IPaymentController from "../controllers/common/interfaces/IPaymentController";
import ConversationController from "../controllers/common/implementations/conversationController";
import IConversationController from "../controllers/common/interfaces/IConversationController";
import MessageController from "../controllers/common/implementations/messageController";
import IMessageController from "../controllers/common/interfaces/IMessageController";
import DetailsController from "../controllers/common/implementations/detailsController";
import IDetailsController from "../controllers/common/interfaces/IDetailsController";
import DirectDocUploadS3Controller from "../controllers/common/implementations/directDocUploadS3Controller";
import IDirectDocUploadS3Controller from "../controllers/common/interfaces/IDirectDocUploadS3Controller";
import NotificationController from "../controllers/common/implementations/notificationController";
import INotificationController from "../controllers/common/interfaces/INotificationController";


//.................................................................................

//services.....................................................................
import UserAuthService from "../services/user/implementations/userAuthServices";
import IUserAuthService from "../services/user/interfaces/IUserAuthServices";
import UserProfileService from "../services/user/implementations/userProfileServices";
import IUserProfileService from "../services/user/interfaces/IuserProfileServices";
import UserAppointmentService from "../services/user/implementations/userAppointmentServices";
import IUserAppointmentService from "../services/user/interfaces/IUserAppointmentServices";
import UserSessionService from "../services/user/implementations/userSessionService";
import IUserSessionService from "../services/user/interfaces/IUserSessionService";
import UserReportAnalysisService from "../services/user/implementations/userReportAnalysis";
import IUserReportAnalysisService from "../services/user/interfaces/IUserReportAnalysis";
import UserBlogService from "../services/user/implementations/userBlogServices";
import IUserBlogService from "../services/user/interfaces/IUserBlogServices";
import UserDashboardService from "../services/user/implementations/userDashboardService";
import IUserDashboardService from "../services/user/interfaces/IUserDashboardService";
import UserPrescriptionService from "../services/user/implementations/userPrescriptionService";
import IUserPrescriptionService from "../services/user/interfaces/IUserPrescriptionService";
import UserTransactionsService from "../services/user/implementations/userTransactionServices";
import IUserTransactionsService from "../services/user/interfaces/IUserTransactionServices";


import AdminAuthService from "../services/admin/implementations/adminAuthService";
import IAdminAuthService from "../services/admin/interfaces/IAdminAuthService";
import AdminUserService from "../services/admin/implementations/adminUserService";
import IAdminUserService from "../services/admin/interfaces/IAdminUserService";
import AdminDoctorService from "../services/admin/implementations/adminDoctorService";
import IAdminDoctorService from "../services/admin/interfaces/IAdminDoctorService";
import AdminAppointmentService from "../services/admin/implementations/adminAppointmentServices";
import IAdminAppointmentsService from "../services/admin/interfaces/IAdminAppointmentServices";
import AdminAnalyticsServices from "../services/admin/implementations/adminAnalyticsServices";
import IAdminAnalyticsServices from "../services/admin/interfaces/IAdminAnalyticsServices";
import AdminTransactionsService from "../services/admin/implementations/adminTransactionServices";
import IAdminTransactionsService from "../services/admin/interfaces/IAdminTransactionServices";
import IAdminPayoutService from "../services/admin/interfaces/IAdminPayoutService";
import AdminPayoutService from "../services/admin/implementations/adminPayoutService";



import DoctorAuthService from "../services/doctor/implementations/doctorAuthServices";
import IDoctorAuthService from "../services/doctor/interfaces/IDoctorAuthServices";
import IDoctorProfileService from "../services/doctor/interfaces/IDoctorProfileSevices";
import DoctorProfileService from "../services/doctor/implementations/doctorProfileService";
import DoctorSessionService from "../services/doctor/implementations/doctorSessionService";
import IDoctorSessionService from "../services/doctor/interfaces/IDoctorSessionService";
import DoctorAppointmentService from "../services/doctor/implementations/doctorAppointmentService";
import IDoctorAppointmentService from "../services/doctor/interfaces/IDoctorAppointmentService";
import DoctorReportAnalysisService from "../services/doctor/implementations/doctorReportAnalysis";
import IDoctorReportAnalysisService from "../services/doctor/interfaces/IDoctorReportAnalysis";
import DoctorBlogService from "../services/doctor/implementations/doctorBlogServices";
import IDoctorBlogService from "../services/doctor/interfaces/IDoctorBlogServices";
import IDoctorAdvertisementService from "../services/doctor/interfaces/IDoctorAdvertisementServices";
import DoctorAdvertisementService from "../services/doctor/implementations/doctorAdvertisementServices";
import IDoctorPrescriptionService from "../services/doctor/interfaces/IDoctorPrescriptionService";
import DoctorPrescriptionService from "../services/doctor/implementations/doctorPrescriptionService";
import IDoctorDashboardService from "../services/doctor/interfaces/IDoctorDashboardService";
import DoctorDashboardService from "../services/doctor/implementations/doctorDashboardService";
import IDoctorPayoutService from "../services/doctor/interfaces/IDoctorPayoutService";
import DoctorPayoutService from "../services/doctor/implementations/doctorPayoutService";
import IDoctorTransactionsService from "../services/doctor/interfaces/IDoctorTransactionServices";
import DoctorTransactionsService from "../services/doctor/implementations/doctorTransactionServices";


import PaymentService from "../services/common/implementations/paymentService";
import IPaymentService from "../services/common/interfaces/IPaymentService";
import ConversationService from "../services/common/implementations/conversationService";
import IConversationService from "../services/common/interfaces/IConversationService";
import MessageService from "../services/common/implementations/messageService";
import IMessageService from "../services/common/interfaces/IMessageService";
import DetailsService from "../services/common/implementations/detailsService";
import IDetailsService from "../services/common/interfaces/IDetailsService";
import DirectDocUploadS3Service from "../services/common/implementations/directDocUploadS3Service";
import IDirectDocUploadS3Service from "../services/common/interfaces/IDirectDocUploadS3Service";
import NotificationService from "../services/common/implementations/notificationService";
import INotificationServices from "../services/common/interfaces/INotificationService";

//.................................................................................

//repositories......................................................................
import UserRepository from "../repositories/implementations/userRepository";
import IUserRepository from "../repositories/interfaces/IUserRepository";

import AdminRepository from "../repositories/implementations/adminRepository";
import IAdminRepository from "../repositories/interfaces/IAdminRepository";

import DoctorRepository from "../repositories/implementations/doctorRepository";
import IDoctorRepository from "../repositories/interfaces/IDoctorRepository";

import PaymentRepository from "../repositories/implementations/paymentRepository";
import IPaymentRepository from "../repositories/interfaces/IPaymentRepository";

// import AppointmentRepository from "../repositories/implementations/appointmentRepository";
// import IAppointmentRepository from "../repositories/interfaces/IAppointmentRepository";

import ConversationRepository from "../repositories/implementations/conversationRepository";
import IConversationRepository from "../repositories/interfaces/IConversationRepository";

import MessageRepository from "../repositories/implementations/messageRepository";
import IMessageRepository from "../repositories/interfaces/IMessageRepository";

import SessionRepository from "../repositories/implementations/sessionRepository";
import ISessionRepository from "../repositories/interfaces/ISessionRepository";

import AppointmentsRepository from "../repositories/implementations/appointmentsRepository";
import IAppointmentsRepository from "../repositories/interfaces/IAppointmentsRepository";

import ReportAnalysisRepository from "../repositories/implementations/reportAnalysisRepository";
import IReportAnalysisRepository from "../repositories/interfaces/IReportAnalysisRepository";

import AnalyticsRepository from "../repositories/implementations/analyticsRepository";
import IAnalyticsRepository from "../repositories/interfaces/IAnalyticsRepository";

import TransactionRepository from "../repositories/implementations/transactionRepositoty";
import ITransactionRepository from "../repositories/interfaces/ITransactionRepository";

import IBlogRepository from "../repositories/interfaces/IBlogRepository";
import BlogsRepository from "../repositories/implementations/blogRepository";

import IAdvertisementRepository from "../repositories/interfaces/IAdvertisementRepository";
import AdvertisementRepository from "../repositories/implementations/advertisementRepositoty";

import INotificationRepository from "../repositories/interfaces/INotificationRepository";
import NotificationRepository from "../repositories/implementations/notificationRepository";


import IPrescriptionRepository from "../repositories/interfaces/IPrescriptionRepositiory";
import PrescriptionRepository from "../repositories/implementations/prescriptionrRepository";


import IPayoutRepository from "../repositories/interfaces/IPayoutRepository";
import PayoutRepository from "../repositories/implementations/payoutRepository";


import IOtpRepository from "../repositories/interfaces/IOtpRepository";
import OtpRepository from "../repositories/implementations/otpRepository";


import IUnAvailableDayRepository from "../repositories/interfaces/IUnAvailableDayRepository";
import UnAvailableDayRepository from "../repositories/implementations/unAvailableDayRepository";

import IUnAvailableSessionRepository from "../repositories/interfaces/IUnAvailableSessionRepository";
import UnAvailableSessionRepository from "../repositories/implementations/unAvailableSessionRepository";


import IProgressPaymentRepository from "../repositories/interfaces/IprogressPaymentRepository";
import ProgressPaymentRepository from "../repositories/implementations/progressPaymentRepository";

//.................................................................................


const container = new Container();
//models.............................................................
container.bind("userModel").toConstantValue(userModel);
container.bind("otpModel").toConstantValue(OtpModel);
container.bind("adminModel").toConstantValue(adminModel);
container.bind("doctorModel").toConstantValue(doctorModel);
container.bind("subscriptionModel").toConstantValue(subscriptionModel);
container.bind("conversationModel").toConstantValue(conversationModel);
container.bind("messageModel").toConstantValue(messageModel);
container.bind("sessionModel").toConstantValue(sessionModel);
container.bind("appointmentModel").toConstantValue(appointmentModel);
container.bind("reportAnalysisModel").toConstantValue(reportAnalysisModel);
container.bind("analyticsModel").toConstantValue(analyticsModel);
container.bind("transactionModel").toConstantValue(transactionModel);
container.bind("blogModel").toConstantValue(blogModel);
container.bind("advertisementModel").toConstantValue(advertisementModel);
container.bind("notificationModel").toConstantValue(notificationModel);
container.bind("prescriptionModel").toConstantValue(prescriptionModel);
container.bind("payoutModel").toConstantValue(payoutModel);
container.bind("unAvailableDayModel").toConstantValue(unAvailableDayModel);
container.bind("unAvailableSessionModel").toConstantValue(unAvailableSessionModel);
container.bind("progressPaymentModel").toConstantValue(progressPaymentModel)



//...................................................................


container.bind<IUserAuthController>("IUserAuthController").to(UserAuthController);
container.bind<IUserProfileController>("IUserProfileController").to(UserProfileController);
container.bind<IUserAppointmentController>("IUserAppointmentController").to(UserAppointmentController);
container.bind<IUserSessionController>("IUserSessionController").to(UserSessionController);
container.bind<IUserReportAnalysisController>("IUserReportAnalysisController").to(UserReportAnalyisController);
container.bind<IUserBlogController>("IUserBlogController").to(UserBlogController);
container.bind<IUserDashboardController>("IUserDashboardController").to(UserDashboardController);
container.bind<IUserPrescriptionController>("IUserPrescriptionController").to(UserPrescriptionController);
container.bind<IUserTransactionController>("IUserTransactionController").to(UserTransactionController);
container.bind<IUserHealthStatusController>("IUserHealthStatusController").to(UserHealthStatusController);


container.bind<IAdminAuthController>("IAdminAuthController").to(AdminAuthController);
container.bind<IAdminUserController>("IAdminUserController").to(AdminUserController);
container.bind<IAdminDoctorController>("IAdminDoctorController").to(AdminDoctorController);
container.bind<IAdminProductController>("IAdminProductController").to(AdminProductController);
container.bind<IAdminAppointmentController>("IAdminAppointmentController").to(AdminAppointmentController);
container.bind<IAdminAnalyticsController>("IAdminAnalyticsController").to(AdminAnalyticsContorller);
container.bind<IAdminTransactionController>("IAdminTransactionController").to(AdminTransactionController);
container.bind<IAdminPayoutController>("IAdminPayoutController").to(AdminPayoutController)

container.bind<IDoctorAuthController>("IDoctorAuthController").to(DoctorAuthController)
container.bind<IDoctorProfileController>("IDoctorProfileController").to(DoctorProfileController);
container.bind<IDoctorSessionController>("IDoctorSessionController").to(DoctorSessionController);
container.bind<IDoctorAppointmentController>("IDoctorAppointmentController").to(DoctorAppointmentController);
container.bind<IDoctorReportAnalysisController>("IDoctorReportAnalysisController").to(DoctorReportAnalysisController);
container.bind<IDoctorPlanController>("IDoctorPlanController").to(DoctorPlansController);
container.bind<IDoctorBlogController>("IDoctorBlogController").to(DoctorBlogController);
container.bind<IDoctorAdvertisementController>("IDoctorAdvertisementController").to(DoctorAdvertisementController);
container.bind<IDoctorPrescriptionController>("IDoctorPrescriptionController").to(DoctorPrescriptionController);
container.bind<IDoctorDashboardController>("IDoctorDashboardController").to(DoctorDashboardController);
container.bind<IDoctorPayoutController>("IDoctorPayoutController").to(DoctorPayoutController);
container.bind<IDoctorTransactionController>("IDoctorTransactionController").to(DoctorTransactionController);


container.bind<IPaymentController>("IPaymentController").to(PaymentController);
container.bind<IConversationController>("IConversationController").to(ConversationController)
container.bind<IMessageController>("IMessageController").to(MessageController)
container.bind<IDetailsController>("IDetailsController").to(DetailsController);
container.bind<IDirectDocUploadS3Controller>("IDirectDocUploadS3Controller").to(DirectDocUploadS3Controller);
container.bind<INotificationController>("INotificationController").to(NotificationController);



//......................................................................



container.bind<IUserAuthService>("IUserAuthService").to(UserAuthService)
container.bind<IUserProfileService>("IUserProfileService").to(UserProfileService);
container.bind<IUserAppointmentService>("IUserAppointmentService").to(UserAppointmentService);
container.bind<IUserSessionService>("IUserSessionService").to(UserSessionService);
container.bind<IUserReportAnalysisService>("IUserReportAnalysisService").to(UserReportAnalysisService);
container.bind<IUserBlogService>("IUserBlogService").to(UserBlogService);
container.bind<IUserDashboardService>("IUserDashboardService").to(UserDashboardService);
container.bind<IUserPrescriptionService>("IUserPrescriptionService").to(UserPrescriptionService);
container.bind<IUserTransactionsService>("IUserTransactionsService").to(UserTransactionsService);


container.bind<IAdminAuthService>("IAdminAuthService").to(AdminAuthService);
container.bind<IAdminUserService>("IAdminUserService").to(AdminUserService);
container.bind<IAdminDoctorService>("IAdminDoctorService").to(AdminDoctorService);
container.bind<IAdminAppointmentsService>("IAdminAppointmentsService").to(AdminAppointmentService);
container.bind<IAdminAnalyticsServices>("IAdminAnalyticsServices").to(AdminAnalyticsServices);
container.bind<IAdminTransactionsService>("IAdminTransactionsService").to(AdminTransactionsService)
container.bind<IAdminPayoutService>("IAdminPayoutService").to(AdminPayoutService)


container.bind<IDoctorAuthService>("IDoctorAuthService").to(DoctorAuthService);
container.bind<IDoctorProfileService>("IDoctorProfileService").to(DoctorProfileService);
container.bind<IDoctorSessionService>("IDoctorSessionService").to(DoctorSessionService);
container.bind<IDoctorAppointmentService>("IDoctorAppointmentService").to(DoctorAppointmentService);
container.bind<IDoctorReportAnalysisService>("IDoctorReportAnalysisService").to(DoctorReportAnalysisService);
container.bind<IDoctorBlogService>("IDoctorBlogService").to(DoctorBlogService);
container.bind<IDoctorAdvertisementService>("IDoctorAdvertisementService").to(DoctorAdvertisementService);
container.bind<IDoctorPrescriptionService>("IDoctorPrescriptionService").to(DoctorPrescriptionService);
container.bind<IDoctorDashboardService>("IDoctorDashboardService").to(DoctorDashboardService);
container.bind<IDoctorPayoutService>("IDoctorPayoutService").to(DoctorPayoutService);
container.bind<IDoctorTransactionsService>("IDoctorTransactionsService").to(DoctorTransactionsService);



container.bind<IPaymentService>("IPaymentService").to(PaymentService);
container.bind<IConversationService>("IConversationService").to(ConversationService);
container.bind<IMessageService>("IMessageService").to(MessageService);
container.bind<IDetailsService>("IDetailsService").to(DetailsService);
container.bind<IDirectDocUploadS3Service>("IDirectDocUploadS3Service").to(DirectDocUploadS3Service);
container.bind<INotificationServices>("INotificationServices").to(NotificationService);


//..............................................................................


container.bind<IUserRepository>("IUserRepository").to(UserRepository);
container.bind<IAdminRepository>("IAdminRepository").to(AdminRepository);
container.bind<IDoctorRepository>("IDoctorRepository").to(DoctorRepository)
container.bind<IPaymentRepository>("IPaymentRepository").to(PaymentRepository);
// container.bind<IAppointmentRepository>("IAppointmentRepository").to(AppointmentRepository);
container.bind<IConversationRepository>("IConversationRepository").to(ConversationRepository);
container.bind<IMessageRepository>("IMessageRepository").to(MessageRepository);
container.bind<ISessionRepository>("ISessionRepository").to(SessionRepository);
container.bind<IAppointmentsRepository>("IAppointmentsRepository").to(AppointmentsRepository);
container.bind<IReportAnalysisRepository>("IReportAnalysisRepository").to(ReportAnalysisRepository);
container.bind<IAnalyticsRepository>("IAnalyticsRepository").to(AnalyticsRepository);
container.bind<ITransactionRepository>("ITransactionRepository").to(TransactionRepository);
container.bind<IBlogRepository>("IBlogRepository").to(BlogsRepository);
container.bind<IAdvertisementRepository>("IAdvertisementRepository").to(AdvertisementRepository);
container.bind<INotificationRepository>("INotificationRepository").to(NotificationRepository);
container.bind<IPrescriptionRepository>("IPrescriptionRepository").to(PrescriptionRepository);
container.bind<IPayoutRepository>("IPayoutRepository").to(PayoutRepository);
container.bind<IOtpRepository>("IOtpRepository").to(OtpRepository);
container.bind<IUnAvailableDayRepository>("IUnAvailableDayRepository").to(UnAvailableDayRepository);
container.bind<IUnAvailableSessionRepository>("IUnAvailableSessionRepository").to(UnAvailableSessionRepository)
container.bind<IProgressPaymentRepository>("IProgressPaymentRepository").to(ProgressPaymentRepository)


export default container;