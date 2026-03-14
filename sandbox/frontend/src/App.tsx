import { Routes, Route } from "react-router-dom";

function Placeholder({ label }: { label: string }) {
  return (
    <div style={{ padding: 32, fontFamily: "system-ui" }}>
      <h1>{label}</h1>
      <p>Placeholder — will be implemented in later tasks.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Placeholder label="Upload" />} />
      <Route path="/map/:id" element={<Placeholder label="Map" />} />
      <Route path="/expired/:id" element={<Placeholder label="Expired" />} />
    </Routes>
  );
}
