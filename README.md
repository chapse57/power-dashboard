markdown# ⚡ 지금 한국 전기, 뭘로 돌아가나 / Korea Power Mix Dashboard

한국의 실시간 전력수급현황을 시각화하는 웹 대시보드입니다.
공공데이터포털(전력거래소 KPX) API에서 실시간 데이터를 받아 총수요·예비력·발전원별 비중을 한눈에 보여줍니다.

A web dashboard visualizing South Korea's real-time electricity supply and demand.
It fetches live data from the Korea Power Exchange (KPX) public API and shows total demand, reserve capacity, and the generation mix at a glance.

---

## 왜 만들었나 / Why I built this

AI 시대는 곧 전기 시대입니다. 데이터센터와 로봇이 늘어날수록 전력 수요는 폭발적으로 증가합니다.
저는 전력 인프라를 소프트웨어로 다루는 영역에 관심이 있어, 그 첫걸음으로 공공 전력 데이터를 직접 받아 시각화해 보았습니다.

The age of AI is the age of electricity. As data centers and robots multiply, power demand grows explosively.
I'm interested in the intersection of power infrastructure and software, and this is my first step — taking public electricity data and visualizing it myself.

---

## 기능 / Features

- 실시간 총수요 · 예비력 · 공급능력 표시 / Real-time total demand, reserve, and supply capacity
- 발전원별 비중 도넛 차트 / Generation mix donut chart
- 자동 새로고침 / Auto-refresh *(예정 / planned)*

---

## 기술 스택 / Tech Stack

- **Frontend:** React, Vite
- **Charts:** Recharts
- **Data:** 공공데이터포털 전력거래소(KPX) OpenAPI / Korea Public Data Portal (KPX) OpenAPI

---

## 개발 메모 / Dev Notes

브라우저에서 공공 API를 직접 호출하면 CORS 정책에 막힙니다.
Vite의 dev proxy를 두어 개발 서버가 대신 요청하도록 우회했습니다.

Calling the public API directly from the browser is blocked by CORS policy.
I worked around it with Vite's dev proxy, letting the dev server make the request on the client's behalf.

---

## 실행 방법 / Getting Started

```bash
npm install
npm run dev
```

`.env` 파일에 공공데이터포털 인증키를 넣어주세요 / Add your KPX API key to a `.env` file:
VITE_KPX_API_KEY=your_decoding_key_here

---

made by [chapse57](https://github.com/chapse57)