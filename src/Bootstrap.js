import ConnectDB from "./DB/connection.js";
import authRouter from "./modules/authModule/auth.controller.js";
import messageRouter from "./modules/messageModule/message.controller.js";
import userRouter from "./modules/userModule/user.controller.js";
import { sendEmail } from "./utils/sendEmail/sendEmail.js";

const Bootstrap = (app, express) => {
  ConnectDB();
  app.use(express.json());
  const port = process.env.PORT;

  app.use("/uploads", express.static("./src/uploads"));
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/message", messageRouter);

  app.use((err, req, res, next) => {
    res.status(err.cause || 500).json({
      status: err.cause || 500,
      error: err.message,
      stack: err.stack,
    });
  });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

export default Bootstrap;
