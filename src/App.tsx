import { BrowserRouter, Routes, Route } from "react-router-dom"
import EndlessModePage from "./pages/EndlessMode"
import DailyModePage from "./pages/DailyMode"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/endless" element={<EndlessModePage />} />
        <Route path="/" element={<DailyModePage />} />
      </Routes>
    </BrowserRouter>
  )
}