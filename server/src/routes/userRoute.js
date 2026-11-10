import express from "express";
import {
  getUserSymbols,
  addUserSymbol,
  removeUserSymbol,
} from "../contollers/userController.js";
import { requireAuth } from "../middlewares/AuthMidlware.js";

const router = express.Router();

router.get("/watchlist", requireAuth, getUserSymbols);
router.post("/watchlist", requireAuth, addUserSymbol);
router.delete("/watchlist/:symbol", requireAuth, removeUserSymbol);
export default router;
