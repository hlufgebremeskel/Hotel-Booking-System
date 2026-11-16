import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import './styles.css';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Hotels from './pages/admin/Hotels';
import Rooms from './pages/admin/Rooms';
import Bookings from './pages/admin/Bookings';
import Users from './pages/admin/Users';

// Customer Pages
import Home from './pages/customer/Home';
import HotelDetails from './pages/customer/HotelDetails';
import Booking from './pages/customer/Booking';
import MyBookings from './pages/customer/MyBookings';
import Profile from './pages/customer/Profile';

// Auth
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/admin/AdminLogin';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/" element={<Home />} />
        <Route path="/hotel/:id" element={<HotelDetails />} />
        <Route path="/booking/:roomId" element={
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        } />
        <Route path="/my-bookings" element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin/hotels" element={
          <ProtectedRoute role="admin">
            <Hotels />
          </ProtectedRoute>
        } />

        <Route path="/admin/rooms" element={
          <ProtectedRoute role="admin">
            <Rooms />
          </ProtectedRoute>
        } />

        <Route path="/admin/bookings" element={
          <ProtectedRoute role="admin">
            <Bookings />
          </ProtectedRoute>
        } />

        <Route path="/admin/users" element={
          <ProtectedRoute role="admin">
            <Users />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
