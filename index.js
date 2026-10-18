export default async function handler(req, res) {
  const { pathname, searchParams } = new URL(req.url, `https://${req.headers.host}`);
  const tmdbApiKey = process.env.TMDB_API_KEY;
  if (!tmdbApiKey) return res.status(500).json({error:"TMDB_API_KEY 环境变量未配置"});

  const tmdbPath = pathname.replace(/^\/api/, "");
  const tmdbUrl = new URL(`https://api.themoviedb.org/3${tmdbPath}`);
  tmdbUrl.searchParams.set("api_key", tmdbApiKey);

  for(const [k,v] of searchParams) {
    if(k !== "api_key") tmdbUrl.searchParams.set(k, v);
  }

  try {
    const resp = await fetch(tmdbUrl.toString());
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (e) {
    res.status(500).json({error:"代理请求失败", detail:e.message});
  }
}
