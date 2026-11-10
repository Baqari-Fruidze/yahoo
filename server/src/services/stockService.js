const SEC_HEADERS = {
  "User-Agent": process.env.SEC_USER_AGENT,
  Accept: "application/json",
};

let tickerMap = null;

const fetchSEC = async (url) => {
  const response = await fetch(url, {
    headers: SEC_HEADERS,
  });

  if (!response.ok) {
    throw new Error(`SEC API error: ${response.status}`);
  }

  return response.json();
};

const fetchCompanyFinancials = async (symbol) => {
  // 1. Load ticker -> CIK mapping
  if (!tickerMap) {
    tickerMap = await fetchSEC(
      "https://www.sec.gov/files/company_tickers.json",
    );
  }

  // 2. Find company by ticker
  const ticker = symbol.trim().toUpperCase();

  const company = Object.values(tickerMap).find(
    (item) => item.ticker.toUpperCase() === ticker,
  );

  if (!company) {
    throw new Error(`Ticker not found: ${ticker}`);
  }

  // 3. Format CIK to 10 digits
  const cik = String(company.cik_str).padStart(10, "0");

  // 4. Fetch company financials
  const data = await fetchSEC(
    `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`,
  );

  const facts = data.facts?.["us-gaap"] ?? {};

  // 5. Get latest annual value
  const getAnnual = (tag, unit = "USD") => {
    const entries = facts[tag]?.units?.[unit] ?? [];

    const annual = entries
      .filter((item) => {
        if (item.form !== "10-K") return false;
        if (!item.start) return true;

        const days = (Date.parse(item.end) - Date.parse(item.start)) / 86400000;

        return days >= 330 && days <= 400;
      })
      .sort(
        (a, b) => b.end.localeCompare(a.end) || b.filed.localeCompare(a.filed),
      );

    return annual[0]?.val ?? null;
  };

  // 6. Return selected fields
  return {
    symbol: ticker,
    cik,
    companyName: data.entityName,
    financials: {
      revenue: getAnnual("RevenueFromContractWithCustomerExcludingAssessedTax"),
      netIncome: getAnnual("NetIncomeLoss"),
      operatingIncome: getAnnual("OperatingIncomeLoss"),
      eps: getAnnual("EarningsPerShareDiluted", "USD/shares"),
      totalAssets: getAnnual("Assets"),
      totalLiabilities: getAnnual("Liabilities"),
    },
  };
};
export { fetchCompanyFinancials };
