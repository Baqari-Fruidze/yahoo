import express from "express";
import { getStockFinancials } from "../contollers/stockContoller.js";

const router = express.Router();

router.get("/financials/:symbol", getStockFinancials);
export default router;
