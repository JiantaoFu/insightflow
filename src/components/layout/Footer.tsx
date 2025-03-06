
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold branded-text">InsightFlow</h3>
            <p className="text-sm text-muted-foreground">
              Unlock product-market fit through research and customer insights.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/interview-builder" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Interview Builder
                </Link>
              </li>
              <li>
                <Link to="/interview-modes" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Interview Simulator
                </Link>
              </li>
              <li>
                <Link to="/insights" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Insights & Reports
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Guides
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center border-t border-border mt-8 pt-8">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} InsightFlow. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">
              Twitter
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">
              LinkedIn
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
