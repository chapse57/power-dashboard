import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useEffect, useState } from "react";
const mockData = {
  currPwrTot: 63213.2,      // 현재수요 (MW)
  suppReservePwr: 19024.8,  // 공급예비력 (MW)
  suppAbility: 82238.0,     // 공급능력 (MW)
  suppReserveRate: 30.096,  // 공급예비율 (%)
};
const COLORS = ["#4F46E5", "#64748B", "#F59E0B", "#10B981", "#94A3B8"];


const fuelNames = {
  fuelPwr1: "수력",
  fuelPwr2: "유류",
  fuelPwr3: "유연탄",
  fuelPwr4: "원자력",
  fuelPwr5: "양수",
  fuelPwr6: "가스",
  fuelPwr7: "국내탄",
  fuelPwr8: "태양광",
  fuelPwr9: "풍력",
  fuelPwr10: "신재생",
};



// 키 오면 데이터 모양 확인용 (임시)
function App() {

  const [sukub, setSukub] = useState(null);
  const [fuel , setFuel] = useState(null);

  async function testFetch() {
    const key = import.meta.env.VITE_KPX_API_KEY;
    const parser = new DOMParser();
  
    try {
      // ── 현재수급 ──
      const sukubUrl = `/kpx/openapi/sukub5mMaxDatetime/getSukub5mMaxDatetime?serviceKey=${encodeURIComponent(key)}`;
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
    const fuelUrl = `/kpx/openapi/sumperfuel5m/getSumperfuel5m?serviceKey=${encodeURIComponent(key)}`;
    const fuelRes = await fetch(fuelUrl);
    const fuelText = await fuelRes.text();
    const fuelXml = parser.parseFromString(fuelText, "text/xml");

    const fuelData = [];
    for (const field in fuelNames) {
      const name = fuelNames[field];
      const value = fuelXml.querySelector(field).textContent;
      fuelData.push({ name: name, value: Number(value) });
    }

    setFuel(fuelData);
  } catch (e) {
    console.error("발전원별 에러:", e);
  }
}

// 가짜 데이터 (키 오면 진짜로 교체할 자리) - 공식 문서 필드명 기준

useEffect(() => {
  testFetch();
  const timer = setInterval(testFetch, 300000);
  return () => clearInterval(timer);
}, []);

if (!sukub && !fuel) {
  return <div style={{ padding: "32px", color: "#fff", background: "#0F172A", minHeight: "100vh" }}>불러오는 중...</div>;
}

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