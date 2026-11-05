import { getHomePage, getNews as fetchNews } from "../services/homeServise.js";

async function getIndexPrices(req, res) {
  try {
    const response = await getHomePage();
    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the home page." });
  }
}

async function getNews(req, res) {
  try {
    const response = await fetchNews();
    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the news." });
  }
}

export { getIndexPrices, getNews };
