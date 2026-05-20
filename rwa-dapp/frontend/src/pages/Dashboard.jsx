import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { PropertyTokenABI, PropertyRegistryABI, DividendDistributorABI } from '../abis';
import config from '../config.json';
import { getIPFSUrl } from '../utils/pinata';
import { Building2, CircleDollarSign, Coins, ArrowRightLeft, ExternalLink } from 'lucide-react';

export default function Dashboard() {
  const { account, signer } = useWeb3();
  const [properties, setProperties] = useState([]);
  const [balance, setBalance] = useState('0');
  const [dividends, setDividends] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account && signer) {
      loadData();
    }
  }, [account, signer]);

  const loadData = async () => {
    try {
      const registry = new ethers.Contract(config.PropertyRegistry, PropertyRegistryABI, signer);
      const nextId = await registry.nextPropertyId();
      const props = [];
      for (let i = 1; i < Number(nextId); i++) {
        const prop = await registry.properties(i);
        if (prop.isRegistered) {
          props.push({
            id: i,
            location: prop.location,
            valuation: prop.valuation,
            cid: prop.legalDocumentCID
          });
        }
      }
      setProperties(props);

      const token = new ethers.Contract(config.PropertyToken, PropertyTokenABI, signer);
      const bal = await token.balanceOf(account);
      setBalance(ethers.formatEther(bal));

      const distributor = new ethers.Contract(config.DividendDistributor, DividendDistributorABI, signer);
      const divs = await distributor.earned(account);
      setDividends(ethers.formatEther(divs));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const claimDividends = async () => {
    try {
      const distributor = new ethers.Contract(config.DividendDistributor, DividendDistributorABI, signer);
      const tx = await distributor.claimDividend();
      await tx.wait();
      alert("Dividends Claimed!");
      loadData();
    } catch (e) {
      console.error(e);
      alert("Error claiming dividends");
    }
  };

  if (!account) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <h2 className="text-2xl font-semibold opacity-70">Please connect your wallet to view the dashboard</h2>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center animate-pulse">Loading Asset Data...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">
        Investor Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Token Balance */}
        <div className="glass p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 transition-transform hover:scale-105 h-full">
          <div className="p-4 bg-teal-500/20 rounded-full text-teal-400">
            <Coins size={36} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Your Tokens</p>
            <p className="text-3xl font-bold">{parseFloat(balance).toLocaleString()}</p>
          </div>
        </div>

        {/* Dividends */}
        <div className="glass p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 transition-transform hover:scale-105 h-full">
          <div className="p-4 bg-blue-500/10 rounded-full text-blue-300">
            <CircleDollarSign size={36} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Unclaimed Dividends</p>
            <p className="text-3xl font-bold text-blue-400">{parseFloat(dividends).toFixed(4)} ETH</p>
          </div>
          <button
            onClick={claimDividends}
            disabled={parseFloat(dividends) === 0}
            className="px-6 py-2 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full font-semibold hover:from-teal-500 hover:to-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-teal-500/25 w-full mt-auto"
          >
            Claim Now
          </button>
        </div>

        {/* Properties Metadata */}
        <div className="glass p-6 rounded-2xl flex flex-col text-left h-full md:col-span-3">
          <div className="flex items-center space-x-3 mb-4">
            <Building2 className="text-teal-400" />
            <h3 className="text-xl font-bold">Aset Properti Anda</h3>
          </div>
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.map(prop => (
                <div key={prop.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex flex-col gap-2 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-400 text-lg">Property #{prop.id}</span>
                  </div>
                  <p><strong className="text-slate-100">Location:</strong> {prop.location}</p>
                  <p><strong className="text-slate-100">Valuation:</strong> {prop.valuation}</p>
                  <div className="w-full">
                    <strong className="text-slate-100 block mb-1">Legal Docs:</strong>
                    {prop.cid ? (
                      <a
                        href={getIPFSUrl(prop.cid)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-400 hover:bg-teal-500/20 hover:text-teal-300 transition-all text-xs font-mono"
                      >
                        <ExternalLink size={12} />
                        {prop.cid.length > 20 ? prop.cid.substring(0, 10) + '...' + prop.cid.substring(prop.cid.length - 8) : prop.cid}
                      </a>
                    ) : (
                      <span className="text-slate-500 text-xs">Tidak tersedia</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 p-4 text-center border border-slate-700/50 rounded-xl bg-slate-800/20">Belum ada properti terdaftar.</p>
          )}
        </div>
      </div>
    </div>
  );
}
