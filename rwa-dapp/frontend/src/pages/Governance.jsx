import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { PropertyDAOABI, PropertyTokenABI } from '../abis';
import config from '../config.json';
import { Gavel, ThumbsUp, ThumbsDown, Send, RefreshCw, ShieldCheck, Zap, Clock, CheckCircle2, XCircle, Vote, Loader2 } from 'lucide-react';

const STATE_LABELS = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"];

const STATE_STYLES = {
  0: 'bg-yellow-500/20 text-yellow-400',    // Pending
  1: 'bg-teal-500/20 text-teal-400',        // Active
  2: 'bg-slate-500/20 text-slate-400',      // Canceled
  3: 'bg-red-500/20 text-red-400',          // Defeated
  4: 'bg-emerald-500/20 text-emerald-400',  // Succeeded
  5: 'bg-blue-500/20 text-blue-400',        // Queued
  6: 'bg-slate-500/20 text-slate-400',      // Expired
  7: 'bg-teal-500/20 text-teal-300',        // Executed
};

export default function Governance() {
  const { account, provider, signer } = useWeb3();
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Delegate state
  const [votingPower, setVotingPower] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [currentDelegate, setCurrentDelegate] = useState(null);
  const [isDelegating, setIsDelegating] = useState(false);
  const [currentBlock, setCurrentBlock] = useState(0);

  // Fetch voting power and delegate info
  const loadVotingInfo = useCallback(async () => {
    if (!provider || !account || !signer) return;
    try {
      const token = new ethers.Contract(config.PropertyToken, PropertyTokenABI, signer);
      const [votes, bal, delegate] = await Promise.all([
        token.getVotes(account),
        token.balanceOf(account),
        token.delegates(account)
      ]);
      setVotingPower(ethers.formatEther(votes));
      setTokenBalance(ethers.formatEther(bal));
      setCurrentDelegate(delegate);

      const block = await provider.getBlockNumber();
      setCurrentBlock(block);
    } catch (e) {
      console.error("Error loading voting info:", e);
    }
  }, [provider, account, signer]);

  const handleDelegate = async () => {
    if (!signer || !account) return;
    setIsDelegating(true);
    try {
      const token = new ethers.Contract(config.PropertyToken, PropertyTokenABI, signer);
      const tx = await token.delegate(account);
      await tx.wait();
      await loadVotingInfo();
    } catch (e) {
      console.error(e);
      alert("Gagal delegate. Pastikan kamu punya token PDAO.");
    }
    setIsDelegating(false);
  };

  const fetchProposals = useCallback(async () => {
    if (!provider || !account) return;
    setLoadingProposals(true);
    setFetchError(null);
    try {
      const dao = new ethers.Contract(config.PropertyDAO, PropertyDAOABI, provider);

      console.log("[DAO] Fetching ProposalCreated events...");
      console.log("[DAO] Contract address:", config.PropertyDAO);

      // Query all ProposalCreated events
      const events = await dao.queryFilter("ProposalCreated");
      console.log("[DAO] Events found:", events.length);

      const block = await provider.getBlockNumber();
      setCurrentBlock(block);
      console.log("[DAO] Current block:", block);

      let currentQuorum = 0n;
      try {
        currentQuorum = await dao.quorum(block > 0 ? block - 1 : 0);
      } catch (e) {
        console.warn("[DAO] Could not fetch quorum", e);
      }

      const proposalData = [];
      for (const event of events) {
        try {
          console.log("[DAO] Processing event:", event);
          const args = event.args;
          console.log("[DAO] Event args:", args);
          const proposalId = args[0]; // proposalId
          const desc = args[8]; // description (last field)
          const targets = args[2]; // targets
          const values = args[3]; // values
          const calldatas = args[5]; // calldatas
          const voteEnd = args[7]; // voteEnd

          console.log("[DAO] Proposal ID:", proposalId?.toString());
          console.log("[DAO] Description:", desc);

          let state = 0;
          let votes = { againstVotes: 0n, forVotes: 0n, abstainVotes: 0n };
          let userHasVoted = false;
          let deadline = 0n;

          try {
            [state, votes, userHasVoted, deadline] = await Promise.all([
              dao.state(proposalId),
              dao.proposalVotes(proposalId),
              dao.hasVoted(proposalId, account),
              dao.proposalDeadline(proposalId)
            ]);
          } catch (e) {
            console.warn("[DAO] Error fetching proposal state", e);
          }

          proposalData.push({
            id: proposalId.toString(),
            desc: desc,
            status: STATE_LABELS[state] || "Unknown",
            votesFor: parseFloat(ethers.formatEther(votes.forVotes)),
            votesAgainst: parseFloat(ethers.formatEther(votes.againstVotes)),
            votesAbstain: parseFloat(ethers.formatEther(votes.abstainVotes)),
            quorum: parseFloat(ethers.formatEther(currentQuorum)),
            rawState: Number(state),
            hasVoted: userHasVoted,
            deadline: Number(deadline),
            endBlock: voteEnd ? Number(voteEnd) : Number(deadline),
            targets: targets ? [...targets] : [],
            values: values ? [...values] : [],
            calldatas: calldatas ? [...calldatas] : [],
          });
        } catch (e) {
          console.error("[DAO] Error processing individual event:", e);
        }
      }

      console.log("[DAO] Total proposals processed:", proposalData.length);
      setProposals(proposalData.reverse());
    } catch (err) {
      console.error("[DAO] Error fetching proposals:", err);
      setFetchError(err.message || "Unknown error");
    }
    setLoadingProposals(false);
  }, [provider, account]);

  useEffect(() => {
    loadVotingInfo();
    fetchProposals();
  }, [loadVotingInfo, fetchProposals]);

  const handlePropose = async (e) => {
    e.preventDefault();
    if (!description || !signer) return;
    setIsSubmitting(true);

    try {
      const dao = new ethers.Contract(config.PropertyDAO, PropertyDAOABI, signer);
      const targets = [config.PropertyDAO];
      const values = [0];
      const calldatas = ["0x"];

      const tx = await dao.propose(targets, values, calldatas, description);
      await tx.wait();
      alert("Proposal berhasil disubmit!");
      setDescription('');
      fetchProposals();
    } catch (err) {
      console.error(err);
      alert("Gagal submit proposal. Pastikan kamu sudah delegate voting power ke diri sendiri terlebih dahulu.");
    }
    setIsSubmitting(false);
  };

  const handleVote = async (proposalId, support) => {
    if (!signer) return;
    try {
      const dao = new ethers.Contract(config.PropertyDAO, PropertyDAOABI, signer);
      const tx = await dao.castVote(proposalId, support);
      await tx.wait();
      alert("Vote berhasil dicatat!");
      fetchProposals();
    } catch (err) {
      console.error(err);
      alert("Gagal voting. Mungkin kamu sudah vote atau periode voting belum aktif.");
    }
  };

  const handleExecute = async (proposal) => {
    if (!signer) return;
    try {
      const dao = new ethers.Contract(config.PropertyDAO, PropertyDAOABI, signer);
      const descriptionHash = ethers.id(proposal.desc);
      const tx = await dao.execute(
        proposal.targets,
        proposal.values,
        proposal.calldatas,
        descriptionHash
      );
      await tx.wait();
      alert("Proposal berhasil dieksekusi!");
      fetchProposals();
    } catch (err) {
      console.error(err);
      alert("Gagal eksekusi proposal.");
    }
  };

  if (!account) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <h2 className="text-2xl font-semibold opacity-70">Please connect your wallet to view DAO Governance</h2>
      </div>
    );
  }

  const isDelegatedToSelf = currentDelegate && currentDelegate.toLowerCase() === account.toLowerCase();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">
            DAO Governance
          </h1>
          <p className="text-slate-400 mt-2">Buat proposal, berikan suara, dan eksekusi keputusan bersama.</p>
        </div>
        <Gavel className="text-teal-500 w-12 h-12 opacity-50" />
      </div>

      {/* Delegate Section */}
      <div className="glass p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-teal-500/20 rounded-full text-teal-400">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Voting Power</h3>
            <p className="text-sm text-slate-400">Kamu harus delegate token ke diri sendiri untuk mengaktifkan hak voting.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-400 mb-1">Token Balance</p>
            <p className="text-xl font-bold text-white">{parseFloat(tokenBalance).toLocaleString()} <span className="text-sm text-slate-400">PDAO</span></p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-400 mb-1">Voting Power</p>
            <p className="text-xl font-bold text-teal-400">{parseFloat(votingPower).toLocaleString()} <span className="text-sm text-slate-400">Votes</span></p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-400 mb-1">Status Delegasi</p>
            {isDelegatedToSelf ? (
              <p className="text-xl font-bold text-green-400 flex items-center justify-center gap-1"><CheckCircle2 size={18}/> Aktif</p>
            ) : (
              <p className="text-xl font-bold text-yellow-400 flex items-center justify-center gap-1"><XCircle size={18}/> Belum Aktif</p>
            )}
          </div>
        </div>

        {!isDelegatedToSelf && (
          <button
            onClick={handleDelegate}
            disabled={isDelegating || parseFloat(tokenBalance) === 0}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl font-semibold hover:from-teal-500 hover:to-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-teal-500/25"
          >
            {isDelegating ? (
              <><Loader2 size={18} className="animate-spin" /> Delegating...</>
            ) : (
              <><Zap size={18} /> Delegate</>
            )}
          </button>
        )}
      </div>

      {/* Main Grid: Form + Proposals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Proposal Form */}
        <div className="lg:col-span-1 glass p-6 rounded-2xl h-fit">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold">
              <Send size={16} />
            </span>
            Buat Proposal Baru
          </h3>
          <form onSubmit={handlePropose} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Deskripsi Proposal</label>
              <textarea
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all resize-none"
                rows="4"
                placeholder="Contoh: Upgrade sistem HVAC seharga 1 ETH..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !description || !isDelegatedToSelf}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl font-semibold hover:from-teal-500 hover:to-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-teal-500/25"
            >
              {isSubmitting ? (
                <><Loader2 size={18} className="animate-spin" /> Submitting...</>
              ) : (
                <><Send size={18} /> Submit Proposal</>
              )}
            </button>
            {!isDelegatedToSelf && (
              <p className="text-xs text-yellow-400 text-center">⚠ Delegate voting power terlebih dahulu untuk membuat proposal.</p>
            )}
          </form>
        </div>

        {/* Proposals List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse border-0"></div>
              Daftar Proposal
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Block: #{currentBlock}</span>
              <button onClick={() => { fetchProposals(); loadVotingInfo(); }} className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-full transition-colors">
                <RefreshCw size={16} className={loadingProposals ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {fetchError && (
            <div className="p-4 bg-red-900/30 border border-red-500/30 rounded-xl text-red-300 text-sm mb-4">
              <p className="font-bold mb-1">Error fetching proposals:</p>
              <p className="font-mono text-xs break-all">{fetchError}</p>
              <p className="text-xs text-slate-400 mt-2">Buka Browser Console (F12) untuk detail lebih lanjut.</p>
            </div>
          )}

          {loadingProposals && proposals.length === 0 ? (
            <div className="text-center py-10 text-slate-500 flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin" /> Memuat proposal...
            </div>
          ) : proposals.length === 0 && !fetchError ? (
            <div className="text-center py-10 text-slate-500 border border-slate-800 rounded-2xl glass">
              <Vote size={32} className="mx-auto mb-2 opacity-50" />
              Belum ada proposal. Jadilah yang pertama!
            </div>
          ) : (
            proposals.map(prop => {
              const totalVotes = prop.votesFor + prop.votesAgainst;
              const quorumPercent = prop.quorum > 0 ? Math.min((totalVotes / prop.quorum) * 100, 100) : 0;
              const isActive = prop.rawState === 1;
              const isSucceeded = prop.rawState === 4;
              const blocksLeft = prop.endBlock - currentBlock;
              const forPercent = totalVotes > 0 ? (prop.votesFor / totalVotes) * 100 : 0;

              return (
                <div key={prop.id} className="glass p-6 rounded-2xl transition-all border border-slate-700 hover:border-slate-500">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 mr-4">
                      <h4 className="text-lg font-semibold leading-snug">{prop.desc}</h4>
                      <p className="text-xs text-slate-500 mt-1 font-mono">ID: {prop.id.substring(0, 16)}...</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap ${STATE_STYLES[prop.rawState] || 'bg-slate-700 text-slate-300'}`}>
                      {prop.status}
                    </span>
                  </div>

                  {/* Block Info */}
                  {isActive && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 bg-slate-800/50 rounded-lg px-3 py-2">
                      <Clock size={14} />
                      <span>
                        {blocksLeft > 0
                          ? `Voting berakhir dalam ${blocksLeft} block lagi`
                          : 'Periode voting telah berakhir, silakan refresh'}
                      </span>
                    </div>
                  )}

                  {/* Vote Stats */}
                  <div className="space-y-3 mt-4">
                    {/* For/Against Bar */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                        <span className="text-green-400">For: {prop.votesFor.toLocaleString()}</span>
                        <span className="text-red-400">Against: {prop.votesAgainst.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden flex">
                        {totalVotes > 0 ? (
                          <>
                            <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-3 transition-all duration-500" style={{ width: `${forPercent}%` }}></div>
                            <div className="bg-gradient-to-r from-red-400 to-red-500 h-3 transition-all duration-500" style={{ width: `${100 - forPercent}%` }}></div>
                          </>
                        ) : (
                          <div className="w-full h-3 bg-slate-700"></div>
                        )}
                      </div>
                    </div>

                    {/* Quorum Progress */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Quorum ({totalVotes.toLocaleString()} / {prop.quorum ? prop.quorum.toLocaleString() : "N/A"})</span>
                        <span>{Math.round(quorumPercent)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-teal-600 to-blue-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${quorumPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 mt-4 border-t border-slate-700/50">
                    {isActive && !prop.hasVoted && (
                      <>
                        <button
                          onClick={() => handleVote(prop.id, 1)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 rounded-xl text-green-400 font-medium transition-all"
                        >
                          <ThumbsUp size={18} /> For
                        </button>
                        <button
                          onClick={() => handleVote(prop.id, 0)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-xl text-red-400 font-medium transition-all"
                        >
                          <ThumbsDown size={18} /> Against
                        </button>
                      </>
                    )}

                    {isActive && prop.hasVoted && (
                      <div className="flex-1 text-center py-2.5 bg-slate-800/50 rounded-xl text-slate-400 text-sm flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} className="text-teal-400" /> Kamu sudah memberikan suara
                      </div>
                    )}

                    {isSucceeded && (
                      <button
                        onClick={() => handleExecute(prop)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 rounded-xl font-semibold transition-all shadow-lg shadow-teal-500/25"
                      >
                        <Zap size={18} /> Execute Proposal
                      </button>
                    )}

                    {!isActive && !isSucceeded && (
                      <div className="flex-1 text-center py-2.5 bg-slate-800/30 rounded-xl text-slate-500 text-sm">
                        {prop.rawState === 7 ? 'Proposal telah dieksekusi' :
                         prop.rawState === 3 ? 'Proposal ditolak' :
                         prop.rawState === 0 ? '⏳ Menunggu periode voting dimulai' :
                         `Status: ${prop.status}`}
                      </div>
                    )}
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
