import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { FloatingChatBox } from "../components/chat/FloatingChatBox";
import { Search } from 'lucide-react';

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const isHomePage = location.pathname === '/' || location.pathname === '/user/home';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{ background: 'var(--app-bg)' }}
    >
      <Navbar />

      {isHomePage && (
        <section className="py-5 text-center flex-grow-0" style={{ background: 'var(--hero-bg)' }}>
          <div className="container">
            <h1 className="fw-bold mb-3 display-5" style={{ color: 'var(--text-dark)' }}>
              Explore Diverse Study Resources
            </h1>
            <p className="lead mb-0" style={{ color: 'var(--text-muted)' }}>
              A vast library of study materials including PDFs, Word docs, and PowerPoint presentations
              <br />
              covering all school subjects to professional academic research.
            </p>
          </div>
        </section>
      )}

      <main className="flex-grow-1">
        <Outlet />
      </main>

      <Footer />
      <FloatingChatBox />
    </div>
  );
}