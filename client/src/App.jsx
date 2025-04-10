import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Story Pages
import StoryList from './pages/story/StoryList';
import StoryDetail from './pages/story/StoryDetail';
import StoryCreate from './pages/story/StoryCreate';
import StoryEdit from './pages/story/StoryEdit';
import StoryChapters from './pages/story/StoryChapters';
import Search from './pages/story/Search';

// Chapter Pages
import ChapterDetail from './pages/chapter/ChapterDetail';
import ChapterCreate from './pages/chapter/ChapterCreate';
import ChapterEdit from './pages/chapter/ChapterEdit';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminStories from './pages/admin/Stories';
import AdminUsers from './pages/admin/Users';
import AdminCategories from './pages/admin/Categories';

// User Pages
import UserProfile from './pages/user/Profile';
import UserBookmarks from './pages/user/Bookmarks';
import UserHistory from './pages/user/History';

// Protected Routes
import ProtectedRoute from './components/routing/ProtectedRoute';
import AdminRoute from './components/routing/AdminRoute';

// Auth Context
import { useAuth } from './context/AuthContext';

function App() {
  const { loading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for auth to be ready
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Main Layout Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* Story Routes */}
          <Route path="stories" element={<StoryList />} />
          <Route path="stories/:id" element={<StoryDetail />} />
          <Route path="chapters/:id" element={<ChapterDetail />} />
          
          {/* Filtered Story Lists */}
          <Route path="new" element={<StoryList initialFilter={{ sort: 'newest' }} />} />
          <Route path="trending" element={<StoryList initialFilter={{ sort: 'popular' }} />} />
          <Route path="completed" element={<StoryList initialFilter={{ status: 'completed' }} />} />
          <Route path="categories" element={<StoryList showCategoryFilter={true} />} />
          <Route path="categories/:categoryId" element={<StoryList />} />
          
          {/* Search Route */}
          <Route path="search" element={<Search />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<UserProfile />} />
            <Route path="bookmarks" element={<UserBookmarks />} />
            <Route path="history" element={<UserHistory />} />
          </Route>
          
          {/* Story Management Routes - Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="stories/create" element={<StoryCreate />} />
            <Route path="stories/:storyId/edit" element={<StoryEdit />} />
            <Route path="stories/:storyId/chapters" element={<StoryChapters />} />
            <Route path="stories/:storyId/chapters/create" element={<ChapterCreate />} />
            <Route path="stories/:storyId/chapters/:chapterId/edit" element={<ChapterEdit />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Route>
        
        {/* Admin Layout Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="stories" element={<AdminStories />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>
        </Route>
      </Routes>
      
      <ToastContainer position="bottom-right" />
    </>
  );
}

export default App; 