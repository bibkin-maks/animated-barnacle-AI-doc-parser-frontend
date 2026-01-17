import { Routes, Route, Navigate } from "react-router-dom";
import Main from "./pages/Main";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Notes from "./pages/Notes";
import PurrAssist from "./pages/PurrAssist";
import Test from "./pages/Test";


import CatGridBackground from "./components/CatGridBackground";

import CalendarPage from "./pages/CalendarPage";

function App() {
  return (
    <>
      <CatGridBackground />
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<Test />} />

        {/* Chat (Protected) */}
        <Route path="/chat" element={<Chat />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/purr-assist" element={<PurrAssist />} />

        {/* Catch-all → redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
