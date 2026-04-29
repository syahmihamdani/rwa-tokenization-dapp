import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { PropertyTokenABI, PropertyRegistryABI, DividendDistributorABI } from '../abis';
import config from '../config.json';
import { Building2, CircleDollarSign, Coins, ArrowRightLeft } from 'lucide-react';

export default function Dashboard() {
  const { account, signer } = useWeb3();
  const [propertyInfo, setPropertyInfo] = useState(null);
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
      const prop = await registry.properties(1);
      if (prop.isRegistered) {
        setPropertyInfo({
          location: prop.location,
          valuation: prop.valuation,
          cid: prop.legalDocumentCID
        });
      }

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
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
        Investor Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Token Balance */}
        <div className="glass p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 transition-transform hover:scale-105 h-full">
          <div className="p-4 bg-blue-500/20 rounded-full text-blue-400">
            <Coins size={36} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Your Tokens</p>
            <p className="text-3xl font-bold">{parseFloat(balance).toLocaleString()}</p>
          </div>
        </div>

        {/* Dividends */}
        <div className="glass p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 transition-transform hover:scale-105 h-full">
          <div className="p-4 bg-green-500/20 rounded-full text-green-400">
            <CircleDollarSign size={36} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Unclaimed Dividends</p>
            <p className="text-3xl font-bold text-green-400">{parseFloat(dividends).toFixed(4)} ETH</p>
          </div>
          <button
            onClick={claimDividends}
            disabled={parseFloat(dividends) === 0}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full font-semibold hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 transition-all shadow-lg shadow-green-500/25 w-full mt-auto"
          >
            Claim Now
          </button>
        </div>

        {/* Property Metadata */}
        <div className="glass p-6 rounded-2xl flex flex-col text-left h-full">
          <div className="flex items-center space-x-3 mb-4">
            <Building2 className="text-teal-400" />
            <h3 className="text-xl font-bold">Asset Details</h3>
          </div>
          {propertyInfo ? (
            <div className="flex flex-col gap-2 text-sm text-slate-300">
              <p><strong className="text-slate-100">Location:</strong> {propertyInfo.location}</p>
              <p><strong className="text-slate-100">Valuation:</strong> {propertyInfo.valuation}</p>
              <p className="w-full"><strong className="text-slate-100 block mb-1">Legal Docs:</strong> <span className="opacity-70 break-all block">{propertyInfo.cid}</span></p>
            </div>
          ) : (
            <p className="text-slate-400">No properties registered.</p>
          )}
        </div>
      </div>
    </div>
  );
}
