import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Header from "./components/Header";
import PublicFooter from "./components/PublicFooter";
import Home from "./pages/Home";
import Archive from "./pages/Archive";
import Reader from "./pages/Reader";
import Login from "./pages/Login";
import Admin, { AdminDashboard } from "./pages/Admin";
import AdminNew from "./pages/AdminNew";
import AdminEdit from "./pages/AdminEdit";
import "./App.css";

function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/archive" element={<PublicLayout><Archive /></PublicLayout>} />
          <Route path="/read/:id" element={<PublicLayout><Reader /></PublicLayout>} />
          <Route path="/login" element={<Login />} />

          {/* Legacy redirects */}
          <Route path="/magazines" element={<PublicLayout><Archive /></PublicLayout>} />
          <Route path="/magazines/:id" element={<PublicLayout><Reader /></PublicLayout>} />

          {/* Admin routes */}
          <Route path="/admin" element={<Admin />}>
            <Route index element={<AdminDashboard />} />
            <Route path="new" element={<AdminNew />} />
            <Route path=":id/edit" element={<AdminEdit />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
