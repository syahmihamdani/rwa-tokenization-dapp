import { ethers } from "ethers";

// 1. Data Proposal Awal
const deskripsiProposal = "Proposal Perbaikan Atap Gedung Senilai 0.5 ETH";
const hashProposal = ethers.id(deskripsiProposal);

console.log("Teks :", deskripsiProposal);
console.log("Hash :", hashProposal);
console.log("\n------------------------------------------------------\n");

// 2. Modifikasi Data (Mengganti huruf kapital A menjadi a)
const deskripsiManipulasi = "Proposal Perbaikan atap Gedung Senilai 0.5 ETH";
const hashManipulasi = ethers.id(deskripsiManipulasi);

console.log("Teks :", deskripsiManipulasi);
console.log("Hash :", hashManipulasi);

