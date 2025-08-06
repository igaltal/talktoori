import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Navigation component with Hebrew RTL support
 * Provides main navigation between different sections of the app
 */
function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/words', label: 'מילים' },
    { path: '/games', label: 'משחקים' },
    { path: '/hotel-game', label: 'משחק מלון' },
    { path: '/story', label: 'סיפורים' },
    { path: '/statistics', label: 'סטטיסטיקות' }
  ];

  const isActivePath = (path) => {
    if (path === '/words') {
      return location.pathname === '/' || location.pathname === '/words';
    }
    return location.pathname === path;
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          Talk to Ori
        </Link>
        
        <ul className="nav-links">
          {navItems.map(item => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={`nav-link ${isActivePath(item.path) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;