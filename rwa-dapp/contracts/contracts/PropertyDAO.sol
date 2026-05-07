// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/*
    Smart contract ini digunakan sebagai sistem DAO (Decentralized Autonomous Organization)
    untuk pengambilan keputusan dalam pengelolaan properti berbasis blockchain.

    Pemegang token dapat membuat proposal dan melakukan voting terhadap
    keputusan tertentu. Hak voting ditentukan berdasarkan jumlah token
    yang dimiliki oleh masing-masing pengguna.
*/

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";

contract PropertyDAO is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction
{
    constructor(IVotes _token)
        Governor("PropertyDAO")

        // Delay voting = 0 block, durasi voting = 50400 block
        GovernorSettings(
            0,
            50400,
            0
        )

        // Menggunakan token sebagai hak voting
        GovernorVotes(_token)

        // Minimal quorum voting sebesar 4%
        GovernorVotesQuorumFraction(4)
    {}

    // Mengambil nilai delay sebelum voting dimulai
    function votingDelay()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    // Mengambil durasi voting
    function votingPeriod()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    // Menghitung minimal quorum voting
    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    // Mengambil minimal token untuk membuat proposal
    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }
}