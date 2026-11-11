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

  const getAnnual = (tag, unit = "USD", periodEnd = null) => {
    const entries = facts[tag]?.units?.[unit] ?? [];

    return (
      entries
        .filter((item) => {
          if (item.form !== "10-K" || !item.end) return false;

          if (periodEnd && item.end !== periodEnd) return false;

          // Balance Sheet: value at a specific date
          if (!item.start) return true;

          // Income Statement / Cash Flow: full fiscal year
          const days =
            (Date.parse(item.end) - Date.parse(item.start)) / 86400000;

          return days >= 330 && days <= 400;
        })
        .sort(
          (a, b) =>
            b.end.localeCompare(a.end) || b.filed.localeCompare(a.filed),
        )[0] ?? null
    );
  };
  const latestAnnual = getAnnual("NetIncomeLoss") ?? getAnnual("Assets");

  const periodEnd = latestAnnual?.end ?? null;

  const getValue = (tag, unit = "USD", end = periodEnd) => {
    if (!end) return null;

    return getAnnual(tag, unit, end)?.val ?? null;
  };

  const annualEntries = facts.NetIncomeLoss?.units?.USD ?? [];

  const annualPeriods = [
    ...new Set(
      annualEntries
        .filter((item) => {
          if (item.form !== "10-K" || !item.start || !item.end) {
            return false;
          }

          const days =
            (Date.parse(item.end) - Date.parse(item.start)) / 86400000;

          return days >= 330 && days <= 400;
        })
        .map((item) => item.end),
    ),
  ]
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 5);

  const annualHistory = annualPeriods.map((end) => ({
    periodEnd: end,

    revenue:
      getValue(
        "RevenueFromContractWithCustomerExcludingAssessedTax",
        "USD",
        end,
      ) ?? getValue("Revenues", "USD", end),

    grossProfit: getValue("GrossProfit", "USD", end),

    operatingIncome: getValue("OperatingIncomeLoss", "USD", end),

    netIncome: getValue("NetIncomeLoss", "USD", end),

    eps: getValue("EarningsPerShareDiluted", "USD/shares", end),

    operatingCashFlow: getValue(
      "NetCashProvidedByUsedInOperatingActivities",
      "USD",
      end,
    ),
  }));

  // 6. Return selected fields
  return {
    symbol: ticker,
    cik,
    companyName: data.entityName,

    period: {
      type: "annual",
      end: periodEnd,
      currency: "USD",
    },

    financials: {
      // Income Statement
      revenue:
        getValue("RevenueFromContractWithCustomerExcludingAssessedTax") ??
        getValue("Revenues"),

      grossProfit: getValue("GrossProfit"),
      operatingIncome: getValue("OperatingIncomeLoss"),
      netIncome: getValue("NetIncomeLoss"),
      eps: getValue("EarningsPerShareDiluted", "USD/shares"),
      researchAndDevelopment: getValue("ResearchAndDevelopmentExpense"),

      // Balance Sheet
      totalAssets: getValue("Assets"),
      totalLiabilities: getValue("Liabilities"),
      stockholdersEquity: getValue("StockholdersEquity"),
      cashAndCashEquivalents: getValue("CashAndCashEquivalentsAtCarryingValue"),

      // Cash Flow
      operatingCashFlow: getValue("NetCashProvidedByUsedInOperatingActivities"),
      capitalExpenditures: getValue(
        "PaymentsToAcquirePropertyPlantAndEquipment",
      ),
    },
    history: {
      annual: annualHistory,
    },
  };
};
export { fetchCompanyFinancials };
