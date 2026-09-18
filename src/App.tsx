import { HashRouter, Route, Routes } from "react-router-dom";
import { GameProvider } from "./game/store";
import { Header } from "./components/Header";
import { WelcomePage } from "./pages/WelcomePage";
import { Dashboard } from "./pages/Dashboard";
import { TicketList } from "./pages/TicketList";
import { TicketDetail } from "./pages/TicketDetail";
import { KnowledgeBasePage } from "./pages/KnowledgeBasePage";
import { ProgressionPage } from "./pages/ProgressionPage";

export default function App() {
  return (
    <GameProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tickets" element={<TicketList />} />
              <Route path="/tickets/:id" element={<TicketDetail />} />
              <Route path="/kb" element={<KnowledgeBasePage />} />
              <Route path="/progression" element={<ProgressionPage />} />
            </Routes>
          </div>
        </div>
      </HashRouter>
    </GameProvider>
  );
}
