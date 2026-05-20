import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import { ethers } from 'ethers';
import config from './config.json';
import { PropertyRegistryABI } from './abis';
import Dashboard from './pages/Dashboard';
import Governance from './pages/Governance';
import Admin from './pages/Admin';
import { Wallet, LayoutDashboard, Gavel, Home, LogOut, Shield } from 'lucide-react';

function Navbar() {
  const { account, provider, connectWallet, disconnectWallet } = useWeb3();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (account && provider) {
        try {
          const registry = new ethers.Contract(config.PropertyRegistry, PropertyRegistryABI, provider);
          const owner = await registry.owner();
          setIsAdmin(owner.toLowerCase() === account.toLowerCase());
        } catch (e) {
          console.error("Error checking admin status", e);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [account, provider]);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Governance', path: '/governance', icon: Gavel },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Admin', path: '/admin', icon: Shield });
  }

  return (
    <nav className="glass sticky top-0 z-50 mb-8 border-b border-slate-700 shadow-xl">
      <div className="container mx-auto px-4 max-w-6xl py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">
          <Home className="text-teal-400" />
          <span>PropDAO</span>
        </div>

        {account && (
          <div className="flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${isActive
                    ? 'bg-teal-500/20 text-teal-400 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                >
                  <Icon size={18} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex items-center space-x-4">
          {account ? (
            <>
              <div className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-sm font-semibold text-teal-300 flex items-center gap-2">
                <Wallet size={16} />
                {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
              </div>
              <button
                onClick={disconnectWallet}
                className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all border border-transparent hover:border-red-500/50"
                title="Disconnect/Change Wallet"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={connectWallet}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 transition-all text-sm font-bold shadow-lg shadow-teal-500/25"
            >
              <Wallet size={18} />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function MainApp() {
  const { account, connectWallet } = useWeb3();

  // Landing Page if not connected
  if (!account) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 mb-8 rounded-full bg-gradient-to-tr from-teal-600 to-blue-400 p-1 animate-pulse shadow-2xl shadow-teal-500/20">
          <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
            <Home className="w-10 h-10 text-teal-400" />
          </div>
        </div>
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-12">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">Prop</span>
          <span className="text-white">DAO</span>
        </h1>
        
        <button
          onClick={connectWallet}
          className="group relative flex items-center space-x-3 px-8 py-4 rounded-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 transition-all text-lg font-bold shadow-xl shadow-teal-500/20 hover:scale-105"
        >
          <Wallet size={24} className="group-hover:animate-bounce" />
          <span>Connect Wallet</span>
        </button>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/governance" element={<Governance />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen relative text-slate-50 font-sans selection:bg-teal-500/30">
          {/* Background decoration */}
          <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-600/15 blur-[120px]"></div>
            <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]"></div>
            <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px]"></div>
          </div>

          <Navbar />

          <main className="container mx-auto px-4 max-w-6xl pb-12">
            <MainApp />
          </main>
        </div>
      </Router>
    </Web3Provider>
  );
}
