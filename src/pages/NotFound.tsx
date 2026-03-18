import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-black text-[#0F172A] dark:text-[#E8E4DC]">404</h1>
        <p className="mb-4 text-xl text-[#64748B] dark:text-[#8A8577]">Page not found</p>
        <a href="/" className="text-[#22C55E] font-semibold underline hover:opacity-80">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
