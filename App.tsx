import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { CoursesPage } from './pages/CoursesPage';
import { NotesPage } from './pages/NotesPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { NoteDetailsPage } from './pages/NoteDetailsPage';
import { VideoPlayerPage } from './pages/VideoPlayerPage';
import { NoteViewerPage } from './pages/NoteViewerPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { UploadCoursePage } from './pages/UploadCoursePage';
import { UploadNotesPage } from './pages/UploadNotesPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { InstructorProfilePage } from './pages/InstructorProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/courses" element={
            <ProtectedRoute requireStudent>
              <CoursesPage />
            </ProtectedRoute>
          } />
          <Route path="/notes" element={
            <ProtectedRoute requireStudent>
              <NotesPage />
            </ProtectedRoute>
          } />
          <Route path="/course/:id" element={
            <ProtectedRoute requireStudent>
              <CourseDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/note/:id" element={
            <ProtectedRoute requireStudent>
              <NoteDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/learn/:courseId" element={
            <ProtectedRoute requireStudent>
              <VideoPlayerPage />
            </ProtectedRoute>
          } />
          <Route path="/view/:noteId" element={
            <ProtectedRoute requireStudent>
              <NoteViewerPage />
            </ProtectedRoute>
          } />
          <Route path="/student/dashboard" element={
            <ProtectedRoute requireStudent>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/instructor/dashboard" element={
            <ProtectedRoute requireInstructor>
              <InstructorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/instructor/upload-course" element={
            <ProtectedRoute requireInstructor>
              <UploadCoursePage />
            </ProtectedRoute>
          } />
          <Route path="/instructor/upload-notes" element={
            <ProtectedRoute requireInstructor>
              <UploadNotesPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/checkout/:type/:id" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/instructor/:id" element={<InstructorProfilePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
