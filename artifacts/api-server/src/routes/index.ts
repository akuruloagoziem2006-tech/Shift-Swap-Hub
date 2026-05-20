import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profilesRouter from "./profiles";
import shiftsRouter from "./shifts";
import requestsRouter from "./requests";
import messagesRouter from "./messages";
import dashboardRouter from "./dashboard";
import checkoutRouter from "./checkout";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profilesRouter);
router.use(shiftsRouter);
router.use(requestsRouter);
router.use(messagesRouter);
router.use(dashboardRouter);
router.use(checkoutRouter);

export default router;
