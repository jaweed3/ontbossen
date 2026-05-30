import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ui/ProtectedRoute";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { ClassDetail } from "./pages/ClassDetail";
import { CreateTopic } from "./pages/CreateTopic";
import { TopicResults } from "./pages/TopicResults";
import { StudentQuiz } from "./pages/StudentQuiz";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/class/:id"
        element={
          <ProtectedRoute>
            <ClassDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/class/:id/topics/new"
        element={
          <ProtectedRoute>
            <CreateTopic />
          </ProtectedRoute>
        }
      />
      <Route
        path="/class/:id/topic/:topicId"
        element={
          <ProtectedRoute>
            <TopicResults />
          </ProtectedRoute>
        }
      />
      <Route path="/q/:code" element={<StudentQuiz />} />
    </Routes>
  );
}
