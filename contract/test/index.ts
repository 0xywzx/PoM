import { expect } from "chai";
import { Contract, Wallet } from "ethers";
import { ethers } from "hardhat";

describe("encodeMulti", () => {
  let AWallet: Wallet;
  let BWallet: Wallet;
  let CWallet: Wallet;
  let Aaddress: string;
  let Baddress: string;
  let Caddress: string;

  let pom: Contract;

  const chainId = 80001;

  before(async () => {
    const ownerAccounts = ethers.Wallet.createRandom();
    const mnemonic = ownerAccounts._mnemonic().phrase;
    AWallet = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/1");
    BWallet = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/2");
    CWallet = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/3");

    Aaddress = await AWallet.getAddress();
    Baddress = await BWallet.getAddress();
    Caddress = await CWallet.getAddress();

    const Pom = await ethers.getContractFactory("ProofOfMeet");
    pom = await Pom.deploy();
  });

  it("Should mint with multisig", async function () {
    const nonce = 20220222;

    const domain = {
      name: "Proof Of Meet",
      version: "1",
      chainId: chainId,
      verifyingContract: pom.address,
      salt: "0x251543af6a222378665a76fe38dbceae4871a070b7fdaf5c6c30cf758dc33cc0",
    };

    const types = {
      MintWithSignature: [{ name: "nonce", type: "uint256" }],
    };

    const message = {
      nonce: nonce,
    };

    const signature = await AWallet._signTypedData(domain, types, message);

    const sig = {
      address: Aaddress,
      r: "0x" + signature.substring(2).substring(0, 64),
      s: "0x" + signature.substring(2).substring(64, 128),
      v: parseInt(signature.substring(2).substring(128, 130), 16),
    };

    const signatureB = await BWallet._signTypedData(domain, types, message);

    const sigB = {
      address: Baddress,
      r: "0x" + signatureB.substring(2).substring(0, 64),
      s: "0x" + signatureB.substring(2).substring(64, 128),
      v: parseInt(signatureB.substring(2).substring(128, 130), 16),
    };

    const sigs = [sig, sigB];
    // // sigを順番に並べる
    // sigs.sort((a, b) => {
    //   if (a.address < b.address) return -1;
    //   else if (a.address > b.address) return 1;
    //   return 0;
    // });

    await pom.safeMultiMint(
      [sigs[0].v, sigs[1].v],
      [sigs[0].r, sigs[1].r],
      [sigs[0].s, sigs[1].s],
      "https://",
      nonce
    );

    expect(await pom.balanceOf(Aaddress)).to.equal(1);
    expect(await pom.balanceOf(Baddress)).to.equal(1);
  });
});
