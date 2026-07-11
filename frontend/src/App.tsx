import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import HomePage from "./pages/HomePage";
import CompanyListPage from "./pages/companies/CompanyListPage";
import CompanyDetailPage from "./pages/companies/CompanyDetailPage";
import CalendarPage from "./pages/calendar/CalendarPage";
import TasksPage from "./pages/tasks/TasksPage";
import EssayListPage from "./pages/essays/EssayListPage";

function App() {
  return (
    <>
      <Routes>
        {/*のちに全てMainLayoutで包む*/}
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/register" element={<RegisterPage />} />

        {/* ここより下のページはProtectedLayoutで包む */}
        <Route path="/" element={<HomePage />} />

        <Route path="/companies" element={<CompanyListPage />} />
        <Route path="/companies/:companyId" element={<CompanyDetailPage />} />

        <Route path="/calendar" element={<CalendarPage />} />

        <Route path="/tasks" element={<TasksPage />} />

        <Route path="/essays" element={<EssayListPage />} />
      </Routes>
    </>
  );
}

export default App;