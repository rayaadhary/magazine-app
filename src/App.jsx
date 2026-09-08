import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import Magazines from "./pages/Magazines";
import MagazineDetail from "./pages/MagazineDetail";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AdminNew from "./pages/AdminNew";
import AdminEdit from "./pages/AdminEdit";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/magazines" element={<Magazines />} />
            <Route path="/magazines/:id" element={<MagazineDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/new" element={<AdminNew />} />
            <Route path="/admin/:id/edit" element={<AdminEdit />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
