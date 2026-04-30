import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { PropertyDAOABI } from '../abis';
import config from '../config.json';
import { Gavel, ThumbsUp, ThumbsDown, Send, RefreshCw } from 'lucide-react';

export default function Governance() {
  const { account, provider, signer } = useWeb3();
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(true);

  const fetchProposals = async () => {
    if (!provider || !account) return;
    setLoadingProposals(true);
    try {
      const dao = new ethers.Contract(config.PropertyDAO, PropertyDAOABI, provider);
      
      // Fetch all ProposalCreated events
      const filter = dao.filters.ProposalCreated();
      const events = await dao.queryFilter(filter, 0, "latest");
      
      const currentBlock = await provider.getBlockNumber();
      let currentQuorum = 0n;
      try {
        currentQuorum = await dao.quorum(currentBlock - 1);
      } catch (e) {
        console.warn("Could not fetch quorum", e);
      }

      const proposalData = await Promise.all(events.map(async (event) => {
        const { proposalId, description } = event.args;
        
        const stateStr = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"];
        let state = 0;
        let votes = { againstVotes: 0n, forVotes: 0n, abstainVotes: 0n };
        
        try {
           state = await dao.state(proposalId);
           votes = await dao.proposalVotes(proposalId);
        } catch (e) {
           console.warn("Error fetching state or votes for proposal", proposalId);
        }

        return {
          id: proposalId.toString(),
          desc: description,
          status: stateStr[state] || "Unknown",
          votesFor: parseFloat(ethers.formatEther(votes.forVotes)),
          votesAgainst: parseFloat(ethers.formatEther(votes.againstVotes)),
          quorum: parseFloat(ethers.formatEther(currentQuorum)),
          rawState: state
        };
      }));

      setProposals(proposalData.reverse()); // newest first
    } catch (err) {
      console.error("Error fetching proposals:", err);
    }
    setLoadingProposals(false);
  };

  useEffect(() => {
    fetchProposals();
  }, [provider, account]);

  const handlePropose = async (e) => {
    e.preventDefault();
    if (!description || !signer) return;
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
      fetchProposals(); // refresh UI
    } catch (err) {
      console.error(err);
      alert("Failed to submit proposal. Make sure you have delegated votes to yourself first.");
    }
    setIsSubmitting(false);
  };

  const handleVote = async (proposalId, support) => {
    if (!signer) return;
    try {
      const dao = new ethers.Contract(config.PropertyDAO, PropertyDAOABI, signer);
      const tx = await dao.castVote(proposalId, support);
      alert(`Voting transaction submitted. Please wait...`);
      await tx.wait();
      alert(`Vote cast successfully!`);
      fetchProposals(); // refresh UI
    } catch (err) {
      console.error(err);
      alert("Failed to cast vote. You might have already voted or the voting period is not active.");
    }
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
            Proposal
          </h1>
          <p className="text-slate-400 mt-2">Create execution proposals or vote on property decisions.</p>
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
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse border-0"></div>
              Live Proposals
            </h3>
            <button onClick={fetchProposals} className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-full">
               <RefreshCw size={16} className={loadingProposals ? "animate-spin" : ""} />
            </button>
          </div>

          {loadingProposals && proposals.length === 0 ? (
            <div className="text-center py-10 text-slate-500">Loading proposals...</div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-10 text-slate-500 border border-slate-800 rounded-2xl glass">
              No proposals found. Be the first to propose!
            </div>
          ) : (
            proposals.map(prop => {
              const totalVotes = prop.votesFor + prop.votesAgainst;
              const quorumPercent = prop.quorum > 0 ? Math.min((totalVotes / prop.quorum) * 100, 100) : 0;
              const isActive = prop.rawState === 1; // 1 is Active state

              return (
                <div key={prop.id} className="glass p-6 rounded-2xl transition-all border border-slate-700 hover:border-slate-500">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold">{prop.desc}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-300'}`}>
                      {prop.status}
                    </span>
                  </div>

                  <div className="space-y-4 mt-6">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Quorum Progress ({totalVotes} / {prop.quorum || "N/A"})</span>
                        <span>{Math.round(quorumPercent)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-teal-400 h-2 rounded-full"
                          style={{ width: `${quorumPercent}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>For: {prop.votesFor}</span>
                      <span>Against: {prop.votesAgainst}</span>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-slate-700/50">
                      <button 
                        onClick={() => handleVote(prop.id, 1)} 
                        disabled={!isActive}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-green-400 transition-colors"
                      >
                        <ThumbsUp size={18} /> For
                      </button>
                      <button 
                        onClick={() => handleVote(prop.id, 0)} 
                        disabled={!isActive}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-red-400 transition-colors"
                      >
                        <ThumbsDown size={18} /> Against
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
