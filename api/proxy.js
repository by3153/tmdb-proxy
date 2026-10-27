export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
    const resp = await fetch(tmdbUrl.toString(), {
      // 缓存 TMDB 响应，减少重复请求和冷启动
      cf: { cacheTtl: 3600, cacheEverything: true }
    });

    // 先拿文本，再尝试解析JSON，避免非JSON响应崩溃
    const text = await resp.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      // TMDB返回了非JSON（错误页/限流页），原样透传
      res.setHeader("Content-Type", resp.headers.get("content-type") || "text/plain");
      return res.status(resp.status).send(text);
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(resp.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: "代理请求失败", detail: err.message });
  }
}
