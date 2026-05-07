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
      setLoading(false);
    }, []);

    const disconnectWallet = () => {
      setAccount(null);
      setSigner(null);
      setProvider(null);
    
      localStorage.clear();
      sessionStorage.clear();
    };

    return (
      <Web3Context.Provider value={{ account, provider, signer, connectWallet, disconnectWallet, loading }}>
        {children}
      </Web3Context.Provider>
    );
  };
