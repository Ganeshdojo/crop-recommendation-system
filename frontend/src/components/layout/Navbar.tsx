import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "../ui/Button";
import { ROUTES } from "../../utils/constants";
import { getTheme, setTheme } from "../../utils/helpers";

export const Navbar = () => {
  const { isSignedIn, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("dark");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setCurrentTheme(getTheme());
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 780);
      if (window.innerWidth >= 780) {
        setIsMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Check on initial load
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    setCurrentTheme(newTheme);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navItems = [
    { name: "Home", path: ROUTES.HOME },
    { name: "Training", path: ROUTES.TRAINING },
    { name: "Prediction", path: ROUTES.PREDICTION },
    { name: "About", path: ROUTES.ABOUT },
    // { name: "Dashboard", path: ROUTES.DASHBOARD },
    // { name: "Settings", path: ROUTES.SETTINGS },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 w-full bg-white/30 dark:bg-black/30 backdrop-blur-2xl border-b border-gray-200 dark:border-gray-800 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <NavLink to={ROUTES.HOME} className="flex items-center gap-2">
                <div className="text-green-500 mr-2">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.787 7.403a2.45 2.45 0 1 1-4.9 0 2.45 2.45 0 0 1 4.9 0zm-9.8 12.194h14.813v-3.272c0-2.38-1.93-4.31-4.31-4.31h-6.193c-2.38 0-4.31 1.93-4.31 4.31v3.272z"/>
                  </svg>
                </div>
                <span className="font-bold text-xl">
                  <span className="text-green-500">Crop</span>
                  <span className="text-gray-800 dark:text-white"> Recommendation</span>
                </span>
              </NavLink>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `text-base ${
                      isActive
                        ? "text-green-500"
                        : "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
            <div className="hidden sm:flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="theme-toggle-rotate rounded-full p-1 text-foreground/70 hover:text-foreground focus:outline-none"
                aria-label="Toggle theme"
              >
                {currentTheme === "dark" ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>

              {isSignedIn ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    signOut();
                    navigate(ROUTES.LOGIN);
                  }}
                >
                  Logout
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => navigate(ROUTES.LOGIN)}
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => navigate(ROUTES.REGISTER)}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
            <div className="flex md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
                onClick={toggleMenu}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-white/85 dark:bg-black/85 backdrop-blur-xl" onClick={toggleMenu}></div>
          
          <div className="relative h-full overflow-y-auto pt-16 pb-12 px-4">
            <div className="space-y-6 p-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `block py-3 px-4 rounded-md text-lg ${
                      isActive
                        ? "bg-gray-100 dark:bg-gray-900 text-green-600 dark:text-green-500"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                    }`
                  }
                  onClick={closeMenu}
                >
                  {item.name}
                </NavLink>
              ))}
              
              <div className="block py-3 px-4 text-lg text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-between">
                  <span>Theme:</span>
                  <button
                    onClick={toggleTheme}
                    className="theme-toggle-rotate p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {currentTheme === "dark" ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="pt-4 pb-3 border-t border-border">
                {isSignedIn ? (
                  <NavLink
                    to="/logout"
                    onClick={closeMenu}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-background/10"
                  >
                    Logout
                  </NavLink>
                ) : (
                  <>
                    <NavLink
                      to={ROUTES.LOGIN}
                      onClick={closeMenu}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-background/10"
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to={ROUTES.REGISTER}
                      onClick={closeMenu}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-primary/10"
                    >
                      Sign Up
                    </NavLink>
                  </>
                )}
              </div>
              
              <button
                onClick={closeMenu}
                className="mt-8 mx-auto flex items-center justify-center w-12 h-12 rounded-full border border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-gray-900"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
