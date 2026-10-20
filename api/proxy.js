export default async function handler(req, res) {
  // ==== 统一 CORS 头：所有响应（含错误）都带上 ====
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  // 处理浏览器 OPTIONS 预检请求（跨域请求前必发）
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { searchParams } = new URL(req.url, `https://${req.headers.host}`);
  const tmdbApiKey = process.env.TMDB_API_KEY;
  if (!tmdbApiKey) {
    return res.status(500).json({ error: "TMDB_API_KEY 环境变量未配置" });
  }
  const path = searchParams.get("path") || "/";
  const tmdbUrl = new URL(`https://api.themoviedb.org/3${path}`);
  for (const [k, v] of searchParams) {
    if (k !== "path") tmdbUrl.searchParams.set(k, v);
  }
  tmdbUrl.searchParams.set("api_key", tmdbApiKey);

  try {
    const resp = await fetch(tmdbUrl.toString());
    const data = await resp.json();
    return res.status(resp.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: "代理请求失败", detail: err.message });
  }
}
