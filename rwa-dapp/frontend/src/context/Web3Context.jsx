import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [loading, setLoading] = useState(true);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const _provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await _provider.send("eth_requestAccounts", []);
        const _signer = await _provider.getSigner();
        
        setProvider(_provider);
        setSigner(_signer);
        setAccount(accounts[0]);
      } catch (error) {
        console.error("User rejected request", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const _provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await _provider.listAccounts();
        if (accounts.length > 0) {
          const _signer = await _provider.getSigner();
          setProvider(_provider);
          setSigner(_signer);
          setAccount(accounts[0].address);
        }
      }
      setLoading(false);
    };
    init();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
  };

  return (
    <Web3Context.Provider value={{ account, provider, signer, connectWallet, disconnectWallet, loading }}>
      {children}
    </Web3Context.Provider>
  );
};
