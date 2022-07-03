import { useEffect, useState } from 'react';
import abi from '../abis/ProofOfMeet.json';
import { ethers } from 'ethers';
import { parseEther, formatUnits, formatEther } from "ethers/lib/utils";

interface Window {
  ethereum: any;
}

declare const window: Window;

export const useWeb3 = () => {


  const [address, setAddress] = useState<string>('');
  const rpc_url = process.env.REACT_APP_RPC_URL;
  const [chainId, setChainId] = useState<string>('');

  const connectWeb3 = async () => {
    if (typeof window !== "undefined") {
      const { ethereum } = window;
      await ethereum.request({ method: 'eth_requestAccounts' })
      setAddress(ethereum.selectedAddress);
      setChainId(ethereum.chainId);
    }
  };

  const getJPYCBalance = async (address: string) => {
    const provider = new ethers.providers.JsonRpcProvider(rpc_url);
    const contract = new ethers.Contract(
      process.env.REACT_APP_JPYC_CONTRACT_ADDRESS as string,
      abi.abi as any,
      provider
    );
    const jpycBalanceInWei = await contract.balanceOf(address);
    const jpycBalance = formatUnits(jpycBalanceInWei, 18);
    return jpycBalance;
  };

  const getNativeTokenBalance = async () => {
    const provider = new ethers.providers.JsonRpcProvider(rpc_url);
    if (address) {
      return formatEther(await provider.getBalance(address));
    }
    return '';
  };

  let provider
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const { ethereum } = window;

      if (ethereum && ethereum.on) {
        if (ethereum.selectedAddress) {
          setAddress(ethereum.selectedAddress);
        }

        if (ethereum.chainId) {
          setChainId(ethereum.chainId);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
        provider = new ethers.providers.Web3Provider(window.ethereum)

        const handleChainChanged = (chainId: string) => {
          setChainId(chainId);
        };

        const handleAccountsChanged = (accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
          }
        };

        ethereum.on('chainChanged', handleChainChanged);
        ethereum.on('accountsChanged', handleAccountsChanged);
      }
    }, [address, chainId]);
  }

  return {
    address,
    chainId,
    provider,
    connectWeb3,
    getJPYCBalance,
    getNativeTokenBalance,
  };
};