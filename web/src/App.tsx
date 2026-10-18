import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactElement } from "react";
import { AuthScreen } from "./screens/AuthScreen";
import { CampaignScreen } from "./screens/CampaignScreen";
import { CreateStudentScreen } from "./screens/CreateStudentScreen";
import { DuelScreen } from "./screens/DuelScreen";
import { getToken } from "./session";

function RequireAuth({ children }: { children: ReactElement }) {
  if (!getToken()) return <Navigate to="/" replace />;
  return children;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthScreen />} />
        <Route path="/student" element={<RequireAuth><CreateStudentScreen /></RequireAuth>} />
        <Route path="/campaign" element={<RequireAuth><CampaignScreen /></RequireAuth>} />
        <Route path="/duel" element={<RequireAuth><DuelScreen /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  );
}
