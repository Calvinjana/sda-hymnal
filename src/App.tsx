import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import EnglishPage from "./pages/EnglishPage";
import TeluguPage from "./pages/TeluguPage";
import SongPage from "./pages/SongPage";

function App() {
  return (
    <BrowserRouter>
      <div
        className="min-h-screen"
        style={{ background: "var(--cream)", color: "var(--text-dark)" }}
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/english" element={<EnglishPage />} />
          <Route path="/telugu" element={<TeluguPage />} />
          <Route path="/song/:id" element={<SongPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
