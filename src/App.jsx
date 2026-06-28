import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

// 가짜 데이터 (키 오면 진짜로 교체할 자리)
const mockData = {
  총수요: 72000,      // MW
  예비력: 11500,      // MW
  공급능력: 83500,    // MW
  발전원별: [
    { name: "원자력", value: 23000 },
    { name: "석탄", value: 18000 },
    { name: "LNG", value: 20000 },
    { name: "태양광", value: 7000 },
    { name: "기타", value: 4000 },
  ],
};

const COLORS = ["#4F46E5", "#64748B", "#F59E0B", "#10B981", "#94A3B8"];

function App() {
  const d = mockData;

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A", color: "#F1F5F9", padding: "32px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "4px" }}>⚡ 지금 한국 전기, 뭘로 돌아가나</h1>
      <p style={{ color: "#94A3B8", marginBottom: "32px" }}>실시간 전력수급현황 (현재 가짜 데이터)</p>

      {/* 큰 숫자들 */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "40px", flexWrap: "wrap" }}>
        <StatBox label="총수요" value={d.총수요} />
        <StatBox label="예비력" value={d.예비력} />
        <StatBox label="공급능력" value={d.공급능력} />
      </div>

      {/* 도넛차트 */}
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
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={{ background: "#1E293B", borderRadius: "12px", padding: "20px 28px", minWidth: "160px" }}>
      <div style={{ color: "#94A3B8", fontSize: "14px", marginBottom: "8px" }}>{label}</div>
      <div style={{ fontSize: "32px", fontWeight: "bold" }}>
        {value.toLocaleString()} <span style={{ fontSize: "16px", color: "#94A3B8" }}>MW</span>
      </div>
    </div>
  );
}

export default App;