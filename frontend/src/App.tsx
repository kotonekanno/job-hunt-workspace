import { Route, Routes } from "react-router-dom";
import { MainLayout } from "./app/layouts/MainLayout";
import { ProtectedLayout } from "./app/layouts/ProtectedLayout";
import CalendarPage from "./pages/calendar/CalendarPage";
import CompanyDetailPage from "./pages/companies/CompanyDetailPage";
import CompanyListPage from "./pages/companies/CompanyListPage";
import EssayListPage from "./pages/essays/EssayListPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import TasksPage from "./pages/tasks/TasksPage";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/companies" element={<CompanyListPage />} />
          <Route path="/companies/:companyId" element={<CompanyDetailPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/essays" element={<EssayListPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
