import { fetchCompanyFinancials } from "../services/stockService.js";
async function getStockFinancials(req, res) {
  try {
    const { symbol } = req.params;
    const financials = await fetchCompanyFinancials(symbol);
    res.json(financials);
  } catch (error) {
    console.error("Error fetching stock financials:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export { getStockFinancials };
