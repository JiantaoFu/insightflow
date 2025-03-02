
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import GlassCard from "@/components/common/GlassCard";
import AnimatedButton from "@/components/common/AnimatedButton";
import PageTransition from "@/components/ui/PageTransition";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageTransition transition="fade" className="min-h-screen">
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full text-center p-8">
          <div className="mb-6">
            <span className="text-8xl font-light gradient-text">404</span>
          </div>
          <h1 className="text-2xl font-medium mb-4">Page not found</h1>
          <p className="text-muted-foreground mb-8">
            We couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
          <Link to="/">
            <AnimatedButton icon={<Home size={18} />} iconPosition="left">
              Return to Home
            </AnimatedButton>
          </Link>
        </GlassCard>
      </div>
    </PageTransition>
  );
};

export default NotFound;
