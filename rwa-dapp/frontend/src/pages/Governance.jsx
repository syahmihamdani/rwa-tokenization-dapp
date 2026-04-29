import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { PropertyDAOABI } from '../abis';
import config from '../config.json';
import { Gavel, ThumbsUp, ThumbsDown, Send } from 'lucide-react';

export default function Governance() {
  const { account, signer } = useWeb3();
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hardcoded for demo: we just show 1 dummy proposal state to illustrate
  const dummyProposals = [
    {
      id: 1,
      desc: "Fund roof repairs with 0.5 ETH from treasury",
      status: "Active",
      votesFor: 150000,
      votesAgainst: 20000,
      quorum: 400000
    }
  ];

  const handlePropose = async (e) => {
    e.preventDefault();
    if (!description) return;
    setIsSubmitting(true);

    try {
      const dao = new ethers.Contract(config.PropertyDAO, PropertyDAOABI, signer);
      // Dummy targets for a proposal: the DAO sends 0 eth to itself
      const targets = [config.PropertyDAO];
      const values = [0];
      const calldatas = ["0x"];

      const tx = await dao.propose(targets, values, calldatas, description);
      await tx.wait();
      alert("Proposal submitted successfully!");
      setDescription('');
    } catch (err) {
      console.error(err);
      alert("Failed to submit proposal (You might not have enough delegated tokens)");
    }
    setIsSubmitting(false);
  };

  const handleDummyVote = (support) => {
    alert(`In a live environment, this would call dao.castVote(proposalId, ${support}). Voting takes gas!`);
  };

  if (!account) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <h2 className="text-2xl font-semibold opacity-70">Please connect your wallet to view DAO Governance</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Voting
          </h1>
          <p className="text-slate-400 mt-2">Vote on property decisions or create your own execution proposals.</p>
        </div>
        <Gavel className="text-pink-500 w-12 h-12 opacity-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Create Proposal Form */}
        <div className="lg:col-span-1 glass p-6 rounded-2xl h-fit">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">1</span>
            New Proposal
          </h3>
          <form onSubmit={handlePropose} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Proposal Action / Description</label>
              <textarea
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                rows="4"
                placeholder="e.g. Upgrade HVAC system for 1 ETH..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !description}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/25"
            >
              <span>{isSubmitting ? 'Submitting...' : 'Submit Proposal'}</span>
              {!isSubmitting && <Send size={18} />}
            </button>
          </form>
        </div>

        {/* Active Proposals list */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse border-0"></div>
            Active Proposals (Demo)
          </h3>

          {dummyProposals.map(prop => (
            <div key={prop.id} className="glass p-6 rounded-2xl transition-all border hover:border-slate-600">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-semibold">{prop.desc}</h4>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">{prop.status}</span>
              </div>

              <div className="space-y-4 mt-6">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Quorum Progress ({prop.votesFor + prop.votesAgainst} / {prop.quorum})</span>
                    <span>{Math.round(((prop.votesFor + prop.votesAgainst) / prop.quorum) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-teal-400 h-2 rounded-full"
                      style={{ width: `${Math.min(((prop.votesFor + prop.votesAgainst) / prop.quorum) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-700/50">
                  <button onClick={() => handleDummyVote(1)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-green-400 transition-colors">
                    <ThumbsUp size={18} /> For
                  </button>
                  <button onClick={() => handleDummyVote(0)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-red-400 transition-colors">
                    <ThumbsDown size={18} /> Against
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
