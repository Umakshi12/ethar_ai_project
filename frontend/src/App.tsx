import { Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "@/components/Layout";
import { DashboardPage } from "@/pages/DashboardPage";
import { EmployeesPage } from "@/pages/EmployeesPage";
import { AttendancePage } from "@/pages/AttendancePage";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;

