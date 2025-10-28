import { Routes, Route } from 'react-router-dom'
import './App.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/layout/Layout.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Footer from './components/layout/Footer.jsx';
import OtpVerification from './pages/OtpVerification.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Feed from './pages/Feed.jsx';
import CreatePost from './pages/CreatePost.jsx';
import EditPost from './pages/EditPost.jsx';
import ErrorPage from './pages/ErrorPage.jsx';
import Friends from './pages/Friends.jsx';
import Chat from './pages/Chat.jsx';
import Discover from './pages/Discover.jsx';
import Profile from './pages/Profile.jsx';
import MyPosts from './pages/MyPosts.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

function App() {

  return (
    <SocketProvider>
     <Routes>
      <Route path='/' element={<LandingPage/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/otp-verification' element={<OtpVerification/>}/>
      
      {/* Routes that use Layout wrapper */}
      <Route element={<Layout />}>
        <Route path='/feed' element={<ProtectedRoute><Feed/></ProtectedRoute>}/>
        <Route path='/create-post' element={<ProtectedRoute><CreatePost/></ProtectedRoute>}/>
        <Route path='/edit-post/:postId' element={<ProtectedRoute><EditPost/></ProtectedRoute>}/>
        <Route path='/my-posts' element={<ProtectedRoute><MyPosts/></ProtectedRoute>}/>
        <Route path='/friends' element={<ProtectedRoute><Friends/></ProtectedRoute>}/>
        <Route path='/chat' element={<ProtectedRoute><Chat/></ProtectedRoute>}/>
        <Route path='/discover' element={<ProtectedRoute><Discover/></ProtectedRoute>}/>
        <Route path='/profile' element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
        
        {/* Catch-all route for 404 errors - must be last */}
        <Route path='*' element={<ErrorPage/>}/>
      </Route>
     </Routes>
     <Footer/>
     <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </SocketProvider>
  )
}

export default App;
