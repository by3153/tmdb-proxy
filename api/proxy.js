export default async function handler(req, res) {
  const { searchParams } = new URL(req.url, `https://${req.headers.host}`);
  const tmdbApiKey = process.env.TMDB_API_KEY;

  if (!tmdbApiKey) {
    return res.status(500).json({ error: "TMDB_API_KEY 环境变量未配置" });
  }
  const path = searchParams.get("path") || "/";
  const tmdbUrl = new URL(`https://api.themoviedb.org/3${path}`);
  tmdbUrl.searchParams.set("api_key", tmdbApiKey);

  // 携带其它查询参数
  for (const [k, v] of searchParams) {
    if (k !== "path") {
      tmdbUrl.searchParams.set(k, v);
    }
  }

  try {
    const resp = await fetch(tmdbUrl.toString());
    const data = await resp.json();
    return res.status(resp.status).json(data);
  } catch (err) {
    return res.status(500).json({
      error: "代理请求失败",
      detail: err.message
    });
  }
}
