import express from "express";
import {
  getUsersymbol,
  addUserSymbol,
  removeUserSymbol,
} from "../contollers/userController.js";
import { requireAuth } from "../middlewares/AuthMidlware.js";

const router = express.Router();

router.get("/watchlist", requireAuth, getUsersymbol);
router.post("/watchlist", requireAuth, addUserSymbol);
router.delete("/watchlist/:symbol", requireAuth, removeUserSymbol);
export default router;
