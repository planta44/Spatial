import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Training from './pages/Training';
import Resources from './pages/Resources';
import Policies from './pages/Policies';
import PolicyDetail from './pages/PolicyDetail';
import Admin from './pages/Admin';
import AdminResources from './pages/AdminResources';
import AdminPageContent from './pages/AdminPageContent';
import TeacherTraining from './pages/TeacherTraining';
import StudentPractice from './pages/StudentPractice';
import ResourceDetail from './pages/ResourceDetail';
import CourseDetail from './pages/CourseDetail';
import TeacherTrainingResourceDetail from './pages/TeacherTrainingResourceDetail';
import Profile from './pages/Profile';
import CourseModuleDetail from './pages/CourseModuleDetail';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Toaster position="top-right" />
      <Navbar />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/training" element={<Training />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/policies/:slug" element={<PolicyDetail />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/:id" element={<ResourceDetail />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/courses/:courseId/modules/:moduleId" element={<CourseModuleDetail />} />
          <Route path="/teacher-training/resources/:slug" element={<TeacherTrainingResourceDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/resources" element={<AdminResources />} />
          <Route path="/admin/pages" element={<AdminPageContent />} />
          <Route path="/teacher-training" element={<TeacherTraining />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/practice" element={<StudentPractice />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;