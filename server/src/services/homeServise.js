async function getHomePage() {
  return { message: "Welcome to the Home Page!" };
}
async function getNews() {
  const apiKey = process.env.GUARDIAN_API_KEY;
  const url = new URL("https://content.guardianapis.com/search");

  url.searchParams.set("section", "business");
  url.searchParams.set("order-by", "newest");
  url.searchParams.set("page-size", "10");
  url.searchParams.set("api-key", process.env.GUARDIAN_API_KEY);
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("News data:", data.response.results); // Log the entire response for debugging
    return data.response.results;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw new Error("Failed to fetch news");
  }
}

export { getHomePage, getNews };
