import {
  getWatchlist,
  addSymbolToWatchlist,
  removeSymbolFromWatchlist,
} from "../services/userService.js";

// GET
export async function getUserSymbols(req, res) {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const data = await getWatchlist(req.userId, token);

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching watchlist:", error);

    return res.status(500).json({
      error: "Failed to fetch watchlist",
    });
  }
}

// POST
export async function addUserSymbol(req, res) {
  try {
    const { symbol } = req.body ?? {};
    const token = req.headers.authorization.split(" ")[1];

    if (typeof symbol !== "string" || !symbol.trim()) {
      return res.status(400).json({
        error: "Valid symbol is required",
      });
    }

    const data = await addSymbolToWatchlist(req.userId, symbol, token);

    return res.status(201).json(data);
  } catch (error) {
    console.error("Error adding symbol:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "Symbol already exists in watchlist",
      });
    }

    return res.status(500).json({
      error: "Failed to add symbol",
    });
  }
}

// DELETE
export async function removeUserSymbol(req, res) {
  try {
    const { symbol } = req.params;
    const token = req.headers.authorization.split(" ")[1];

    const data = await removeSymbolFromWatchlist(req.userId, symbol, token);

    if (!data) {
      return res.status(404).json({
        error: "Symbol not found",
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Error removing symbol:", error);

    return res.status(500).json({
      error: "Failed to remove symbol",
    });
  }
}
