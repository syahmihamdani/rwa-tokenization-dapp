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
          let imageCid = null;
          let docCid = prop.legalDocumentCID;
          
          if (prop.legalDocumentCID && prop.legalDocumentCID.startsWith('{')) {
            try {
              const meta = JSON.parse(prop.legalDocumentCID);
              imageCid = meta.image;
              docCid = meta.doc;
            } catch (e) {
              console.error("Failed to parse property JSON CID", e);
            }
          }

          props.push({
            id: i,
            location: prop.location,
            valuation: prop.valuation,
            cid: docCid,
            imageCid: imageCid
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

      {/* Top Stats Cards Grid (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Token Balance */}
        <div className="glass p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 transition-transform hover:scale-105 h-full">
          <div className="p-4 bg-teal-500/20 rounded-full text-teal-400">
            <Coins size={36} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">PDAO</p>
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
      </div>

      {/* Properties Metadata Container */}
      <div className="glass p-6 rounded-2xl flex flex-col text-left w-full">
        <div className="flex items-center space-x-3 mb-6">
          <Building2 className="text-teal-400" />
          <h3 className="text-xl font-bold">Aset Properti Terdaftar</h3>
        </div>
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.map(prop => (
                <div key={prop.id} className="glass bg-slate-800/30 rounded-2xl overflow-hidden border border-slate-700 flex flex-col transition-all hover:scale-[1.02] hover:border-slate-600 shadow-xl group">
                  {/* Property Image Header */}
                  <div className="relative h-48 w-full bg-gradient-to-br from-slate-900 to-slate-950 overflow-hidden border-b border-slate-700">
                    {prop.imageCid ? (
                      <img
                        src={getIPFSUrl(prop.imageCid)}
                        alt={prop.location}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-teal-900/10 to-blue-900/10 text-teal-400 gap-2">
                        <Building2 size={48} className="opacity-40" />
                        <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Premium Real Estate Asset</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-full text-xs font-bold text-teal-400 border border-teal-500/30">
                      ID: #{prop.id}
                    </div>
                  </div>

                  {/* Property Content */}
                  <div className="p-5 flex flex-col flex-grow gap-3 text-sm text-slate-300">
                    <h4 className="font-bold text-white text-lg line-clamp-1">{prop.location}</h4>
                    
                    <div className="grid grid-cols-2 gap-4 my-2">
                      <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                        <span className="text-xs text-slate-500 block mb-1">Asset Valuation</span>
                        <strong className="text-teal-400 text-lg font-extrabold">{prop.valuation}</strong>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between border-t border-slate-700/50 pt-4">
                      <div>
                        <span className="text-xs text-slate-500 block">Dokumen Legal</span>
                        {prop.cid ? (
                          <a
                            href={getIPFSUrl(prop.cid)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                          >
                            <ExternalLink size={12} />
                            Lihat Sertifikat PDF
                          </a>
                        ) : (
                          <span className="text-slate-500 text-xs">Tidak tersedia</span>
                        )}
                      </div>
                      
                      <div className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider">
                        Active
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 p-4 text-center border border-slate-700/50 rounded-xl bg-slate-800/20">Belum ada properti terdaftar.</p>
          )}
        </div>
      </div>
  );
}
