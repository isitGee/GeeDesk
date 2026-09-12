import { HashRouter, Route, Routes } from "react-router-dom";
import { GameProvider } from "./game/store";
import { Header } from "./components/Header";
import { Dashboard } from "./pages/Dashboard";
import { TicketList } from "./pages/TicketList";
import { TicketDetail } from "./pages/TicketDetail";

export default function App() {
  return (
    <GameProvider>
      <HashRouter>
        <div className="min-h-screen">
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tickets" element={<TicketList />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
          </Routes>
        </div>
      </HashRouter>
    </GameProvider>
  );
}
