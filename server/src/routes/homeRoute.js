import express from "express";
import { getIndexPrices, getNews } from "../contollers/homeController.js";

const router = express.Router();

router.get("/index-prices", getIndexPrices);
router.get("/news", getNews);

export default router;
