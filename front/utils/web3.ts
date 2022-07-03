import { BigNumber, ethers, Signer, Wallet } from "ethers";
import { Interface } from '@ethersproject/abi'
import { hexDataLength } from '@ethersproject/bytes'
import { pack } from '@ethersproject/solidity'
import { isAddress, parseEther } from "ethers/lib/utils";

interface Window {
  ethereum: any;
}

declare const window: Window;

const provider = () => {
  let provider;
  if (typeof window !== "undefined") {
    window.ethereum.request({method: 'eth_requestAccounts',}).then(
      provider = new ethers.providers.Web3Provider(window.ethereum)
    );
  }
  return provider;
};

const getTypedSignature = async (
  chainId: number,
  verifyingContract: string,
  nonce: number,
  signer: any,
) => {

  const domain = {
    name: "Proof Of Meet",
    version: "1",
    chainId: chainId,
    verifyingContract: verifyingContract,
    salt: "0x251543af6a222378665a76fe38dbceae4871a070b7fdaf5c6c30cf758dc33cc0"
  };

  const types = {
    MintWithSignature: [
      { name: "nonce", type: "uint256" }
    ]
  };

  const message = {
    nonce: nonce,
  };

  const signature = await signer._signTypedData(
    domain,
    types,
    message
  );

  return {
    r: "0x" + signature.substring(2).substring(0, 64),
    s: "0x" + signature.substring(2).substring(64, 128),
    v: signature.substring(2).substring(128, 130),
    address: await signer.getAddress(),
    nonce: String(nonce)
  }

}

export {
  provider,
  getTypedSignature,
}