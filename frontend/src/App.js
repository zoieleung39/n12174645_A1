import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Add this import
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Items from './pages/Items';

function App() {
  return (
    <AuthProvider> {/* Wrap everything with AuthProvider */}
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/items" element={<Items />} /> 
        </Routes>
      </Router>
    </AuthProvider> 
  );
}

export default App;