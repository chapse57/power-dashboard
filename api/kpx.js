// 공공데이터포털(apis.data.go.kr) 프록시 + 인메모리 캐싱
// KPX openapi.kpx.or.kr 장애(2026-07-02)로 apis.data.go.kr 대체 API로 이전.
//   - 발전원별: B552115/PwrAmountByGen/getPwrAmountByGen (계통기준, 5분, fuelPwr1~9)
//   - 현재수급: B552115/... (현재는 기존 KPX 유지, 추후 _GW 이전 검토)
// 캐싱: 접속자 수와 무관하게 KPX 호출량을 고정 → 일 100회 한도 방어.

// 경로별 캐시 { [path]: { at: epochMs, body: string, contentType: string } }
const cache = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5분 (데이터 갱신 주기와 동일)

// 프론트가 넘기는 path → 실제 upstream URL 매핑
const UPSTREAM = {
  // 발전원별 발전량(계통기준) — 대체 API
  fuel: "https://apis.data.go.kr/B552115/PwrAmountByGen/getPwrAmountByGen",
  // 현재수급 — 기존 KPX (지금 정상. 추후 _GW 대체 API로 이전 검토)
  sukub: "https://openapi.kpx.or.kr/openapi/sukub5mMaxDatetime/getSukub5mMaxDatetime",
};

export default async function handler(req, res) {
  const { path } = req.query;

  if (!path || !UPSTREAM[path]) {
    return res.status(400).json({ error: "path는 fuel 또는 sukub 여야 합니다" });
  }

  // 캐시 HIT면 즉시 반환 (upstream 호출 안 함)
  const cached = cache[path];
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    res.setHeader("Content-Type", cached.contentType);
    res.setHeader("X-Cache", "HIT");
    return res.status(200).send(cached.body);
  }

  const key = process.env.KPX_API_KEY;
  // 두 도메인 모두 인코딩된 키를 요구 (디코딩 키 원본 + encodeURIComponent)
  const serviceKey = encodeURIComponent(key);

  const base = UPSTREAM[path];
  const url =
    path === "fuel"
      ? `${base}?serviceKey=${serviceKey}&pageNo=1&numOfRows=10&dataType=XML`
      : `${base}?serviceKey=${serviceKey}`;

  // upstream이 간헐적으로 실패하므로 최대 3번 재시도
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
          Accept: "application/xml,text/xml,*/*;q=0.8",
        },
      });
      const text = await response.text();

      // 정상 XML만 통과 (에러는 HTML로 옴)
      if (text.includes("<?xml") && !text.includes("<!DOCTYPE html")) {
        const contentType = "text/xml; charset=utf-8";
        cache[path] = { at: Date.now(), body: text, contentType };
        res.setHeader("Content-Type", contentType);
        res.setHeader("X-Cache", "MISS");
        return res.status(200).send(text);
      }

      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  res.status(502).json({ error: "upstream 요청 3회 실패" });
}
