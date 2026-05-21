import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { PropertyTokenABI, PropertyRegistryABI, DividendDistributorABI } from '../abis';
import config from '../config.json';
import { uploadToIPFS, getIPFSUrl } from '../utils/pinata';
import { Shield, Building2, Coins, CircleDollarSign, Plus, Send, RefreshCw, FileEdit, Loader2, AlertTriangle, CheckCircle2, Upload, FileCheck, Trash2 } from 'lucide-react';

export default function Admin() {
  const { account, signer, provider } = useWeb3();
  const [isOwner, setIsOwner] = useState(false);
  const [loadingOwner, setLoadingOwner] = useState(true);

  // Property form
  const [propLocation, setPropLocation] = useState('');
  const [propValuation, setPropValuation] = useState('');
  const [propDocCID, setPropDocCID] = useState('');
  const [propFile, setPropFile] = useState(null);
  const [isUploadingPropFile, setIsUploadingPropFile] = useState(false);
  const [isRegisteringProp, setIsRegisteringProp] = useState(false);

  // Property Image states
  const [propImageFile, setPropImageFile] = useState(null);
  const [propImageCID, setPropImageCID] = useState('');
  const [isUploadingPropImage, setIsUploadingPropImage] = useState(false);

  // Properties list
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  // Update doc form
  const [updatePropId, setUpdatePropId] = useState('');
  const [updateDocCID, setUpdateDocCID] = useState('');
  const [updateFile, setUpdateFile] = useState(null);
  const [isUploadingUpdateFile, setIsUploadingUpdateFile] = useState(false);
  const [isUpdatingDoc, setIsUpdatingDoc] = useState(false);

  // Token transfer form
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [ownerBalance, setOwnerBalance] = useState('0');
  const [totalSupply, setTotalSupply] = useState('0');

  // Pay rent form
  const [rentAmount, setRentAmount] = useState('');
  const [isPayingRent, setIsPayingRent] = useState(false);
  const [totalDividends, setTotalDividends] = useState('0');

  // Toast / feedback
  const [toast, setToast] = useState(null);

  // Deleting property state
  const [deletingId, setDeletingId] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const checkOwnership = useCallback(async () => {
    if (!signer || !account) return;
    setLoadingOwner(true);
    try {
      const registry = new ethers.Contract(config.PropertyRegistry, PropertyRegistryABI, signer);
      const registryOwner = await registry.owner();
      setIsOwner(registryOwner.toLowerCase() === account.toLowerCase());
    } catch (e) {
      console.error("Error checking ownership:", e);
      setIsOwner(false);
    }
    setLoadingOwner(false);
  }, [signer, account]);

  const loadProperties = useCallback(async () => {
    if (!signer) return;
    setLoadingProperties(true);
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
    } catch (e) {
      console.error("Error loading properties:", e);
    }
    setLoadingProperties(false);
  }, [signer]);

  const loadTokenInfo = useCallback(async () => {
    if (!signer || !account) return;
    try {
      const token = new ethers.Contract(config.PropertyToken, PropertyTokenABI, signer);
      const [bal, supply] = await Promise.all([
        token.balanceOf(account),
        token.totalSupply()
      ]);
      setOwnerBalance(ethers.formatEther(bal));
      setTotalSupply(ethers.formatEther(supply));
    } catch (e) {
      console.error("Error loading token info:", e);
    }
  }, [signer, account]);

  const loadDividendInfo = useCallback(async () => {
    if (!signer) return;
    try {
      const dist = new ethers.Contract(config.DividendDistributor, DividendDistributorABI, signer);
      const total = await dist.totalDividends();
      setTotalDividends(ethers.formatEther(total));
    } catch (e) {
      console.error("Error loading dividend info:", e);
    }
  }, [signer]);

  useEffect(() => {
    checkOwnership();
    loadProperties();
    loadTokenInfo();
    loadDividendInfo();
  }, [checkOwnership, loadProperties, loadTokenInfo, loadDividendInfo]);

  // Upload file to IPFS for property registration
  const handlePropFileUpload = async (file) => {
    if (!file) return;
    setPropFile(file);
    setIsUploadingPropFile(true);
    try {
      const result = await uploadToIPFS(file, `property-doc-${Date.now()}`);
      setPropDocCID(result.cid);
      showToast(`File di-upload ke IPFS! CID: ${result.cid.substring(0, 12)}...`);
    } catch (e) {
      console.error(e);
      showToast("Gagal upload file ke IPFS: " + e.message, "error");
      setPropFile(null);
    }
    setIsUploadingPropFile(false);
  };

  // Upload image to IPFS for property registration
  const handlePropImageUpload = async (file) => {
    if (!file) return;
    setPropImageFile(file);
    setIsUploadingPropImage(true);
    try {
      const result = await uploadToIPFS(file, `property-img-${Date.now()}`);
      setPropImageCID(result.cid);
      showToast(`Foto di-upload ke IPFS! CID: ${result.cid.substring(0, 12)}...`);
    } catch (e) {
      console.error(e);
      showToast("Gagal upload foto ke IPFS: " + e.message, "error");
      setPropImageFile(null);
    }
    setIsUploadingPropImage(false);
  };

  // Register property
  const handleRegisterProperty = async (e) => {
    e.preventDefault();
    if (!signer || !propDocCID) return;
    setIsRegisteringProp(true);
    try {
      const finalCid = propImageCID
        ? JSON.stringify({ image: propImageCID, doc: propDocCID })
        : propDocCID;

      const registry = new ethers.Contract(config.PropertyRegistry, PropertyRegistryABI, signer);
      const tx = await registry.registerProperty(propLocation, propValuation, finalCid);
      await tx.wait();
      showToast("Properti berhasil didaftarkan!");
      setPropLocation('');
      setPropValuation('');
      setPropDocCID('');
      setPropFile(null);
      setPropImageFile(null);
      setPropImageCID('');
      loadProperties();
    } catch (e) {
      console.error(e);
      showToast("Gagal mendaftarkan properti.", "error");
    }
    setIsRegisteringProp(false);
  };

  // Upload file to IPFS for document update
  const handleUpdateFileUpload = async (file) => {
    if (!file) return;
    setUpdateFile(file);
    setIsUploadingUpdateFile(true);
    try {
      const result = await uploadToIPFS(file, `update-doc-${updatePropId}-${Date.now()}`);
      setUpdateDocCID(result.cid);
      showToast(`File di-upload ke IPFS! CID: ${result.cid.substring(0, 12)}...`);
    } catch (e) {
      console.error(e);
      showToast("Gagal upload file ke IPFS: " + e.message, "error");
      setUpdateFile(null);
    }
    setIsUploadingUpdateFile(false);
  };

  // Update document CID
  const handleUpdateDoc = async (e) => {
    e.preventDefault();
    if (!signer || !updateDocCID) return;
    setIsUpdatingDoc(true);
    try {
      const registry = new ethers.Contract(config.PropertyRegistry, PropertyRegistryABI, signer);
      const tx = await registry.updateDocumentCID(parseInt(updatePropId), updateDocCID);
      await tx.wait();
      showToast("Dokumen legal berhasil diperbarui!");
      setUpdatePropId('');
      setUpdateDocCID('');
      setUpdateFile(null);
      loadProperties();
    } catch (e) {
      console.error(e);
      showToast("Gagal memperbarui dokumen.", "error");
    }
    setIsUpdatingDoc(false);
  };

  // Delete property on-chain
  const handleDeleteProperty = async (propertyId) => {
    if (!signer) return;
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus Properti #${propertyId}? Tindakan ini bersifat permanen.`);
    if (!confirmDelete) return;

    setDeletingId(propertyId);
    try {
      const registry = new ethers.Contract(config.PropertyRegistry, PropertyRegistryABI, signer);
      const tx = await registry.deleteProperty(propertyId);
      await tx.wait();
      showToast(`Properti #${propertyId} berhasil dihapus!`);
      loadProperties();
    } catch (e) {
      console.error(e);
      showToast("Gagal menghapus properti.", "error");
    }
    setDeletingId(null);
  };

  // Transfer tokens
  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!signer) return;
    setIsTransferring(true);
    try {
      const token = new ethers.Contract(config.PropertyToken, PropertyTokenABI, signer);
      const amount = ethers.parseEther(transferAmount);
      const tx = await token.transfer(transferTo, amount);
      await tx.wait();
      showToast(`${transferAmount} PDAO berhasil dikirim!`);
      setTransferTo('');
      setTransferAmount('');
      loadTokenInfo();
    } catch (e) {
      console.error(e);
      showToast("Gagal transfer token.", "error");
    }
    setIsTransferring(false);
  };

  // Pay rent
  const handlePayRent = async (e) => {
    e.preventDefault();
    if (!signer) return;
    setIsPayingRent(true);
    try {
      const dist = new ethers.Contract(config.DividendDistributor, DividendDistributorABI, signer);
      const tx = await dist.payRent({ value: ethers.parseEther(rentAmount) });
      await tx.wait();
      showToast(`${rentAmount} ETH sewa berhasil dibayarkan!`);
      setRentAmount('');
      loadDividendInfo();
    } catch (e) {
      console.error(e);
      showToast("Gagal membayar sewa.", "error");
    }
    setIsPayingRent(false);
  };

  if (!account) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <h2 className="text-2xl font-semibold opacity-70">Hubungkan wallet untuk mengakses Admin Panel</h2>
      </div>
    );
  }

  if (loadingOwner) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] gap-2 text-slate-400">
        <Loader2 size={24} className="animate-spin" /> Memverifikasi akses admin...
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] gap-4">
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-center max-w-md">
          <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-2">Akses Ditolak</h2>
          <p className="text-slate-400">Wallet kamu bukan owner dari smart contract. Hanya owner yang bisa mengakses panel admin ini.</p>
          <p className="text-xs text-slate-500 mt-3 font-mono break-all">Wallet: {account}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-24 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl border flex items-center gap-2 text-sm font-medium animate-slide-in ${
          toast.type === 'error'
            ? 'bg-red-900/90 border-red-500/50 text-red-200'
            : 'bg-green-900/90 border-green-500/50 text-green-200'
        }`}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">
            Admin Panel
          </h1>
          <p className="text-slate-400 mt-2">Kelola properti, distribusi token, dan pembayaran sewa.</p>
        </div>
        <Shield className="text-teal-500 w-12 h-12 opacity-50" />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs text-slate-400 mb-1">Properti Terdaftar</p>
          <p className="text-2xl font-bold text-white">{properties.length}</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs text-slate-400 mb-1">Token Sisa (Admin)</p>
          <p className="text-2xl font-bold text-teal-400">{parseFloat(ownerBalance).toLocaleString()}</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs text-slate-400 mb-1">Total Supply</p>
          <p className="text-2xl font-bold text-blue-400">{parseFloat(totalSupply).toLocaleString()}</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs text-slate-400 mb-1">Total Sewa Masuk</p>
          <p className="text-2xl font-bold text-emerald-400">{parseFloat(totalDividends).toFixed(4)} ETH</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Register Property */}
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="p-2 bg-teal-500/20 rounded-full text-teal-400"><Building2 size={20} /></div>
            Daftarkan Properti Baru
          </h3>
          <form onSubmit={handleRegisterProperty} className="space-y-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Lokasi</label>
              <input
                type="text"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                placeholder="Jl. Sudirman No. 123, Jakarta"
                value={propLocation}
                onChange={(e) => setPropLocation(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Valuasi</label>
              <input
                type="text"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                placeholder="$1,000,000"
                value={propValuation}
                onChange={(e) => setPropValuation(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Foto Properti (Upload ke IPFS)</label>
                <div
                  className={`relative w-full border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer min-h-[140px] flex flex-col items-center justify-center
                    ${propImageFile
                      ? 'border-green-500/50 bg-green-900/10'
                      : 'border-slate-700 bg-slate-900/50 hover:border-teal-500/50 hover:bg-teal-900/10'
                    }`}
                  onClick={() => document.getElementById('prop-image-input').click()}
                >
                  <input
                    id="prop-image-input"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handlePropImageUpload(e.target.files[0])}
                  />
                  {isUploadingPropImage ? (
                    <div className="flex flex-col items-center gap-2 text-teal-400">
                      <Loader2 size={28} className="animate-spin" />
                      <span className="text-sm text-center">Mengupload foto...</span>
                    </div>
                  ) : propImageFile ? (
                    <div className="flex flex-col items-center gap-2 text-green-400">
                      <FileCheck size={28} />
                      <span className="text-sm font-medium truncate max-w-[150px]">{propImageFile.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">CID: {propImageCID.substring(0,10)}...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <Upload size={24} />
                      <span className="text-sm">Klik upload foto</span>
                      <span className="text-[10px]">JPG, PNG, WEBP</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Dokumen Legal (Upload ke IPFS)</label>
                <div
                  className={`relative w-full border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer min-h-[140px] flex flex-col items-center justify-center
                    ${propFile
                      ? 'border-green-500/50 bg-green-900/10'
                      : 'border-slate-700 bg-slate-900/50 hover:border-teal-500/50 hover:bg-teal-900/10'
                    }`}
                  onClick={() => document.getElementById('prop-file-input').click()}
                >
                  <input
                    id="prop-file-input"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handlePropFileUpload(e.target.files[0])}
                  />
                  {isUploadingPropFile ? (
                    <div className="flex flex-col items-center gap-2 text-teal-400">
                      <Loader2 size={28} className="animate-spin" />
                      <span className="text-sm text-center">Mengupload dokumen...</span>
                    </div>
                  ) : propFile ? (
                    <div className="flex flex-col items-center gap-2 text-green-400">
                      <FileCheck size={28} />
                      <span className="text-sm font-medium truncate max-w-[150px]">{propFile.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">CID: {propDocCID.substring(0,10)}...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <Upload size={24} />
                      <span className="text-sm">Klik upload dokumen</span>
                      <span className="text-[10px]">PDF, PNG, DOC</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={isRegisteringProp || isUploadingPropFile || !propDocCID}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl font-semibold hover:from-teal-500 hover:to-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-teal-500/25"
            >
              {isRegisteringProp ? <><Loader2 size={18} className="animate-spin" /> Mendaftarkan...</> : <><Plus size={18} /> Daftarkan Properti</>}
            </button>
          </form>
        </div>

        {/* Transfer Tokens */}
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 rounded-full text-blue-400"><Coins size={20} /></div>
            Transfer Token ke Investor
          </h3>
          <form onSubmit={handleTransfer} className="space-y-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Alamat Tujuan</label>
              <input
                type="text"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-mono text-sm"
                placeholder="0x..."
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Jumlah Token (PDAO)</label>
              <input
                type="number"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="10000"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                required
                min="0"
                step="any"
              />
              <p className="text-xs text-slate-500 mt-1">Sisa balance kamu: {parseFloat(ownerBalance).toLocaleString()} PDAO</p>
            </div>
            <button
              type="submit"
              disabled={isTransferring}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl font-semibold hover:from-blue-500 hover:to-teal-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25"
            >
              {isTransferring ? <><Loader2 size={18} className="animate-spin" /> Mengirim...</> : <><Send size={18} /> Transfer Token</>}
            </button>
          </form>
        </div>

        {/* Pay Rent */}
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-300"><CircleDollarSign size={20} /></div>
            Bayar Sewa (Distribusi Dividen)
          </h3>
          <form onSubmit={handlePayRent} className="space-y-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Jumlah ETH</label>
              <input
                type="number"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                placeholder="1.0"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                required
                min="0"
                step="any"
              />
              <p className="text-xs text-slate-500 mt-1">ETH yang dikirim akan didistribusikan ke seluruh pemegang token secara proporsional.</p>
            </div>
            <button
              type="submit"
              disabled={isPayingRent}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-semibold hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/25"
            >
              {isPayingRent ? <><Loader2 size={18} className="animate-spin" /> Membayar...</> : <><CircleDollarSign size={18} /> Bayar Sewa</>}
            </button>
          </form>
        </div>

        {/* Update Document */}
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 rounded-full text-blue-400"><FileEdit size={20} /></div>
            Perbarui Dokumen Legal
          </h3>
          <form onSubmit={handleUpdateDoc} className="space-y-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Property ID</label>
              <input
                type="number"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="1"
                value={updatePropId}
                onChange={(e) => setUpdatePropId(e.target.value)}
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Upload Dokumen Baru (IPFS)</label>
              <div
                className={`relative w-full border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer
                  ${updateFile
                    ? 'border-green-500/50 bg-green-900/10'
                    : 'border-slate-700 bg-slate-900/50 hover:border-blue-500/50 hover:bg-blue-900/10'
                  }`}
                onClick={() => document.getElementById('update-file-input').click()}
              >
                <input
                  id="update-file-input"
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => handleUpdateFileUpload(e.target.files[0])}
                />
                {isUploadingUpdateFile ? (
                  <div className="flex flex-col items-center gap-2 text-blue-400">
                    <Loader2 size={28} className="animate-spin" />
                    <span className="text-sm">Mengupload ke IPFS...</span>
                  </div>
                ) : updateFile ? (
                  <div className="flex flex-col items-center gap-2 text-green-400">
                    <FileCheck size={28} />
                    <span className="text-sm font-medium">{updateFile.name}</span>
                    <span className="text-xs text-slate-400 font-mono break-all">CID: {updateDocCID}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Upload size={28} />
                    <span className="text-sm">Klik untuk upload dokumen baru</span>
                    <span className="text-xs">PDF, JPG, PNG, DOC</span>
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isUpdatingDoc || isUploadingUpdateFile || !updateDocCID}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl font-semibold hover:from-blue-500 hover:to-teal-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25"
            >
              {isUpdatingDoc ? <><Loader2 size={18} className="animate-spin" /> Memperbarui...</> : <><FileEdit size={18} /> Update Dokumen</>}
            </button>
          </form>
        </div>
      </div>

      {/* Properties List */}
      <div className="glass p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Building2 className="text-teal-400" size={20} />
            Properti Terdaftar
          </h3>
          <button onClick={loadProperties} className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-full transition-colors">
            <RefreshCw size={16} className={loadingProperties ? "animate-spin" : ""} />
          </button>
        </div>

        {loadingProperties ? (
          <div className="text-center py-6 text-slate-500 flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin" /> Memuat properti...
          </div>
        ) : properties.length === 0 ? (
          <p className="text-center py-6 text-slate-500">Belum ada properti terdaftar.</p>
        ) : (
          <div className="space-y-3">
            {properties.map(prop => (
              <div key={prop.id} className="bg-slate-800/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 border border-slate-700/50 hover:border-slate-600 transition-all">
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-xs font-bold shrink-0">
                    #{prop.id}
                  </div>
                  {prop.imageCid ? (
                    <img
                      src={getIPFSUrl(prop.imageCid)}
                      alt="prop-preview"
                      className="w-14 h-14 rounded-lg object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500">
                      <Building2 size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{prop.location}</p>
                  <p className="text-sm text-slate-400">Valuasi: {prop.valuation}</p>
                  <p className="text-xs text-slate-500 font-mono truncate">Doc CID: {prop.cid}</p>
                </div>
                <div className="shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleDeleteProperty(prop.id)}
                    disabled={deletingId !== null}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold"
                  >
                    {deletingId === prop.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
