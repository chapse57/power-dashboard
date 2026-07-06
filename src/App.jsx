import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useEffect, useState } from "react";
const mockData = {
  currPwrTot: 63213.2,      // 현재수요 (MW)
  suppReservePwr: 19024.8,  // 공급예비력 (MW)
  suppAbility: 82238.0,     // 공급능력 (MW)
  suppReserveRate: 30.096,  // 공급예비율 (%)
};
const COLORS = ["#4F46E5", "#64748B", "#F59E0B", "#10B981", "#94A3B8"];


// 키 오면 데이터 모양 확인용 (임시)
function App() {
  const [power, setPower] = useState(null);

  async function testFetch() {
    const key = import.meta.env.VITE_KPX_API_KEY;
    const url = `/kpx/openapi/sukub5mMaxDatetime/getSukub5mMaxDatetime?serviceKey=${key}`;
    try {
      const res = await fetch(url);
      const text = await res.text(); // XML이라 일단 text로 받음

      const parser = new DOMParser();

      const xml = parser.parseFromString(text, "text/xml");
      const currPwr = xml.querySelector("currPwrTot").textContent;
      const suppReservePwr = xml.querySelector("suppReservePwr").textContent;
      const suppAbility = xml.querySelector("suppAbility").textContent;
      const suppReserveRate = xml.querySelector("suppReserveRate").textContent;
      setPower({
        currPwr: currPwr,              // 파싱한 변수
        suppAbility: suppAbility,
        suppReservePwr: suppReservePwr,
        suppReserveRate: suppReserveRate,
      });
    } catch (e) {
      console.error("fetch 에러:", e);
    }
  }

// 가짜 데이터 (키 오면 진짜로 교체할 자리) - 공식 문서 필드명 기준

useEffect(() => {
  testFetch();
  const timer = setInterval(testFetch, 300000);
  return () => clearInterval(timer);
}, []);

  if (!power) {
    return <div style={{ padding: "32px", color: "#fff", background: "#0F172A", minHeight: "100vh" }}>불러오는 중...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A", color: "#F1F5F9", padding: "32px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "4px" }}>⚡ 지금 한국 전기, 뭘로 돌아가나</h1>
      <p style={{ color: "#94A3B8", marginBottom: "32px" }}>실시간 전력수급현황 </p>

      {/* 큰 숫자들 */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "40px", flexWrap: "wrap" }}>
        <StatBox label="현재수요" value={power.currPwr} />
        <StatBox label="공급예비력" value={power.suppReservePwr} />
        <StatBox label="공급능력" value={power.suppAbility} />
        <StatBox label="공급예비율" value={power.suppReserveRate} unit="%" />
      </div>

      {/* 도넛차트
      <div style={{ background: "#1E293B", borderRadius: "16px", padding: "24px", maxWidth: "500px" }}>
        <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>발전원별 비중</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={d.발전원별}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
            >
              {d.발전원별.map((entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${v.toLocaleString()} MW`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div> */}
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