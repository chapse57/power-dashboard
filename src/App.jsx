import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useEffect, useState } from "react";

// 대체 API(발전원별 발전량 계통기준, B552115)의 매핑:
// fuelPwr1 수력, 2 유류, 3 유연탄, 4 원자력, 5 양수, 6 가스, 7 국내탄, 8 신재생, 9 태양광
// (기존 openapi.kpx.or.kr과 달리 9개이고 풍력 없음. 8·9 자리가 바뀜)
const COLORS = [
  "#38BDF8", // 수력   - 하늘색 (물)
  "#F87171", // 유류   - 빨강
  "#78716C", // 유연탄 - 갈회색 (석탄)
  "#A78BFA", // 원자력 - 보라
  "#22D3EE", // 양수   - 청록 (물)
  "#FB923C", // 가스   - 주황 (불꽃)
  "#57534E", // 국내탄 - 진갈색 (석탄)
  "#2DD4BF", // 신재생 - 민트
  "#FACC15", // 태양광 - 노랑 (햇빛)
];

const fuelNames = {
  fuelPwr1: "수력",
  fuelPwr2: "유류",
  fuelPwr3: "유연탄",
  fuelPwr4: "원자력",
  fuelPwr5: "양수",
  fuelPwr6: "가스",
  fuelPwr7: "국내탄",
  fuelPwr8: "신재생",
  fuelPwr9: "태양광",
};
// 발전원별 CO2 직접배출 계수 (gCO2/kWh)
// 화석연료: 황욱 외 2018 (한국 통계 기반, 가스=LNG 복합발전 374, 국내탄=무연탄 1109)
// 재생·원자력·양수: 직접배출 0 (연소 없음)
const emissionFactors = {
  fuelPwr1: 0,     // 수력
  fuelPwr2: 730,   // 유류 (중유)
  fuelPwr3: 871,   // 유연탄
  fuelPwr4: 0,     // 원자력
  fuelPwr5: 0,     // 양수
  fuelPwr6: 374,   // 가스 (LNG 복합)
  fuelPwr7: 1109,  // 국내탄 (무연탄)
  fuelPwr8: 0,     // 신재생
  fuelPwr9: 0,     // 태양광
};



function App() {

  const [sukub, setSukub] = useState(null);
  const [fuel , setFuel] = useState(null);

  async function testFetch() {
    const parser = new DOMParser();
  
    try {
      // ── 현재수급 ──
      const sukubUrl = `/api/kpx?path=sukub`;
      const sukubRes = await fetch(sukubUrl);
    const sukubText = await sukubRes.text();
    const sukubXml = parser.parseFromString(sukubText, "text/xml");

    const currPwr = sukubXml.querySelector("currPwrTot").textContent;
    const suppReservePwr = sukubXml.querySelector("suppReservePwr").textContent;
    const suppAbility = sukubXml.querySelector("suppAbility").textContent;
    const suppReserveRate = sukubXml.querySelector("suppReserveRate").textContent;

    

    setSukub({ currPwr, suppAbility, suppReservePwr, suppReserveRate });
  } catch (e) {
    console.error("현재수급 에러:", e);
  }

  // ── 발전원별 (try 2) ──
  try {
    const fuelUrl = `/api/kpx?path=fuel`;
    const fuelRes = await fetch(fuelUrl);
    const fuelText = await fuelRes.text();
    const fuelXml = parser.parseFromString(fuelText, "text/xml");

    const fuelData = [];
    for (const field in fuelNames) {
      const name = fuelNames[field];
      const value = fuelXml.querySelector(field).textContent;
      fuelData.push({ name: name, value: Number(value),factor: emissionFactors[field]});
    }

    setFuel(fuelData);
  } catch (e) {
    console.error("발전원별 에러:", e);
  }
}


useEffect(() => {
  testFetch();
  const timer = setInterval(testFetch, 300000);
  return () => clearInterval(timer);
}, []);

if (!sukub && !fuel) {
  return <div style={{ padding: "32px", color: "#fff", background: "#0F172A", minHeight: "100vh" }}>불러오는 중...</div>;
}
  // fuel이 있을 때만 계산 (없으면 null)
  const totalEmission = fuel
    ? fuel.reduce((sum, item) => sum + item.value * 1000 * item.factor, 0)
    : null;



return (
  <div style={{ minHeight: "100vh", background: "#0F172A", color: "#F1F5F9", padding: "32px", fontFamily: "sans-serif" }}>
    <h1 style={{ fontSize: "28px", marginBottom: "4px" }}>⚡ 지금 한국 전기, 뭘로 돌아가나</h1>
    <p style={{ color: "#94A3B8", marginBottom: "32px" }}>실시간 전력수급현황 </p>

    {/* 큰 숫자들 (sukub 있을 때만) */}
    {sukub && (
      <div style={{ display: "flex", gap: "24px", marginBottom: "40px", flexWrap: "wrap" }}>
        <StatBox label="현재수요" value={sukub.currPwr} />
        <StatBox label="공급예비력" value={sukub.suppReservePwr} />
        <StatBox label="공급능력" value={sukub.suppAbility} />
        <StatBox label="공급예비율" value={sukub.suppReserveRate} unit="%" />
      </div>
    )}

    {/* 실시간 탄소배출 (독립 카드) */}
    {totalEmission !== null && (
      <div style={{ background: "#1E293B", borderRadius: "16px", padding: "24px", maxWidth: "500px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>🌍 실시간 탄소배출률</h2>
        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "12px" }}>
          {(totalEmission / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}
          <span style={{ fontSize: "18px", color: "#94A3B8" }}> tCO₂/h</span>
        </div>
        <p style={{ color: "#94A3B8", fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
          발전원별 출력(MW) × 1,000 × 배출계수(gCO₂/kWh)의 총합.
          지금 출력이 1시간 유지될 때 나오는 CO₂량입니다.<br />
          직접배출 기준(재생·원자력·양수 = 0). 화석연료 계수: 황욱 외(2018),
          가스는 LNG 복합발전, 국내탄은 무연탄 기준.
        </p>
      </div>
    )}

    {/* 도넛 (fuel 있을 때만) */}
    {fuel && (
      <div style={{ background: "#1E293B", borderRadius: "16px", padding: "24px", maxWidth: "500px" }}>
        <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>발전원별 비중</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={fuel}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
            >
              {fuel.map((entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${v.toLocaleString()} MW`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);
}

function StatBox({ label, value, unit = "MW" }) {
  return (
    <div style={{ background: "#1E293B", borderRadius: "12px", padding: "20px 28px", minWidth: "160px" }}>
      <div style={{ color: "#94A3B8", fontSize: "14px", marginBottom: "8px" }}>{label}</div>
      <div style={{ fontSize: "32px", fontWeight: "bold" }}>
      {Number(value).toLocaleString()} <span style={{ fontSize: "16px", color: "#94A3B8" }}>{unit}</span>
      </div>
    </div>
  );
}

export default App;