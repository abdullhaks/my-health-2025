"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const socket_1 = require("./src/middlewares/common/socket");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRoutes_1 = __importDefault(require("./src/routes/user/userRoutes"));
const logger_1 = __importDefault(require("./src/utils/logs/logger"));
const connectDB_1 = __importDefault(require("./src/config/connectDB"));
const cors_1 = __importDefault(require("cors"));
const adminRoutes_1 = __importDefault(require("./src/routes/admin/adminRoutes"));
const doctorRoutes_1 = __importDefault(require("./src/routes/doctor/doctorRoutes"));
const inversify_1 = __importDefault(require("./src/config/inversify"));
const errorMiddleware_1 = require("./src/middlewares/common/errorMiddleware");
const paymentCtrl = inversify_1.default.get("IPaymentCtrl");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true
    }
});
(0, socket_1.setupSocket)(io, inversify_1.default);
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.get("/", (req, res) => {
    res.send("my health is running....");
});
(0, connectDB_1.default)();
app.post("/api/webhook", express_1.default.raw({ type: "application/json" }), (req, res) => paymentCtrl.stripeWebhookController(req, res));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(logger_1.default);
app.use("/api/user", userRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/doctor", doctorRoutes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    (0, errorMiddleware_1.errorHandler)(err, req, res, next);
});
server.listen(port, () => {
    console.log(`MyHealth is running on port 3000 http://localhost:${port}`);
});
