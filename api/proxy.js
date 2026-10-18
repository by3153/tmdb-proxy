const TMDB_API_KEY = "ecb36f97893ed8c589fcedcc282dc15d";

export default async function handler(req, res) {
  const { type, path } = req.query;
  let targetUrl;

  if (type === "api") {
    // 代理 TMDB API
    targetUrl = `https://api.themoviedb.org/3/${path}?api_key=${TMDB_API_KEY}`;
    // 带上GET额外参数（FMovie查询时的query、language等）
    const originQuery = new URLSearchParams(req.url.split('?')[1]);
    originQuery.delete("type");
    originQuery.delete("path");
    const extra = originQuery.toString();
    if(extra) targetUrl += "&" + extra;
  } else if (type === "image") {
    // 代理海报图片 image.tmdb.org
    targetUrl = `https://image.tmdb.org/t/${path}`;
  } else {
    return res.status(400).send("Bad type");
  }

  try {
    const response = await fetch(targetUrl);
    const buf = await response.arrayBuffer();
    // 复制响应头
    for (const [k, v] of response.headers) {
      res.setHeader(k, v);
    }
    res.status(response.status).end(Buffer.from(buf));
  } catch (err) {
    res.status(500).send("Proxy Error:" + err.message);
  }
}
