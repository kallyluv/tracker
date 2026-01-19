import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import ListPage from "./pages/ListPage.js";
import NewPage from "./pages/NewPage.js";
import DetailPage from "./pages/DetailPage.js";
import EditPage from "./pages/EditPage.js";

function NavBar() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  return (
    <header className="header">
      <div className="container headerRow">
        <Link className="brand" to="/">Tracker</Link>
        <nav className="nav">
          <Link to="/">Items</Link>
          <Link to="/new" className="btn">New Item</Link>
          {isLoading ? null : isAuthenticated ? (
            <>
              <span className="subtle">{user?.name}</span>
              <button className="btn secondary" onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="btn secondary">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function AppRoutes() {
  return (
    <>
      <NavBar />

      <main className="container">
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/new" element={<NewPage />} />
          <Route path="/items/:id" element={<DetailPage />} />
          <Route path="/items/:id/edit" element={<EditPage />} />
          <Route path="/login" element={<div className="card">Login page coming soon.</div>} />
          <Route path="/register" element={<div className="card">Register page coming soon.</div>} />
          <Route path="*" element={<div className="card">Not found.</div>} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="container subtle">
          CIT 382 Starter • React + Express
        </div>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
