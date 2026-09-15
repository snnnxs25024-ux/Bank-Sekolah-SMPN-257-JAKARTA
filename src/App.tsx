/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PeriodSelection from './pages/PeriodSelection';
import ClassSelection from './pages/ClassSelection';
import Checklist from './pages/Checklist';
import RecapClass from './pages/RecapClass';
import RecapAll from './pages/RecapAll';
import MasterClass from './pages/MasterClass';
import MasterStudent from './pages/MasterStudent';
import Reports from './pages/Reports';
import Layout from './components/Layout';
import StudentHistory from './pages/StudentHistory';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = useStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="period" element={<PeriodSelection />} />
          <Route path="classes" element={<ClassSelection />} />
          <Route path="checklist/:classId" element={<Checklist />} />
          <Route path="recap-class/:classId" element={<RecapClass />} />
          <Route path="recap-all" element={<RecapAll />} />
          <Route path="master-class" element={<MasterClass />} />
          <Route path="master-student" element={<MasterStudent />} />
          <Route path="reports" element={<Reports />} />
          <Route path="student/:studentId" element={<StudentHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

