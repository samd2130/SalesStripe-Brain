export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const path = req.query.path;
  if (!path || typeof path !== "string") {
    return res.status(400).json({ error: "Missing or invalid path query parameter." });
  }

  const targetPath = path.startsWith("/") ? path : "/" + path;
  const targetUrl = "https://api.lemlist.com" + targetPath;

  try {
    const apiRes = await fetch(targetUrl, {
      headers: {
        Authorization: "Basic " + Buffer.from(":d704fee750fc91bf88a581be96392151").toString("base64"),
        Accept: "application/json"
      }
    });

    const responseBody = await apiRes.text();
    const contentType = apiRes.headers.get("content-type") || "application/json";

    res.status(apiRes.status);
    res.setHeader("Content-Type", contentType);
    return res.send(responseBody);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Proxy request failed." });
  }
}
