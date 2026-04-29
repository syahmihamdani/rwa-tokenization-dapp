import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import Dashboard from './pages/Dashboard';
import Governance from './pages/Governance';
import { Wallet, LayoutDashboard, Gavel, Home } from 'lucide-react';

function Navbar() {
  const { account, connectWallet } = useWeb3();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Vote', path: '/governance', icon: Gavel },
  ];

  return (
    <nav className="glass sticky top-0 z-50 mb-8 border-b border-slate-700 shadow-xl">
      <div className="container mx-auto px-4 max-w-6xl py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
          <Home className="text-blue-400" />
          <span>Property</span>
        </div>

        <div className="flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${isActive
                  ? 'bg-blue-500/20 text-blue-400 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        <button
          onClick={connectWallet}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 transition-all text-sm font-semibold shadow-lg"
        >
          <Wallet size={18} className="text-teal-400" />
          <span>
            {account
              ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
              : 'Connect Wallet'}
          </span>
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen relative text-slate-50 font-sans selection:bg-blue-500/30">
          {/* Background decoration */}
          <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]"></div>
            <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-teal-600/10 blur-[120px]"></div>
            <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]"></div>
          </div>

          <Navbar />

          <main className="container mx-auto px-4 max-w-6xl pb-12">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/governance" element={<Governance />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Web3Provider>
  );
}
