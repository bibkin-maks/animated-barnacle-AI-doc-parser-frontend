import { Routes, Route, Navigate } from "react-router-dom";
import Main from "./pages/Main";
import Chat from "./pages/Chat";
import Login from "./pages/Login";

import { store } from "./store/store";
import { Provider } from "react-redux";

function App() {
  return (
    <Provider store={store}>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />

        {/* Chat (Protected) */}
        <Route path="/chat" element={<Chat />} />

        {/* Catch-all → redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Provider>
  );
}

export default App;
