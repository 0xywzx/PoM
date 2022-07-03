// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ethers } from 'ethers';
import type { NextApiRequest, NextApiResponse } from 'next'
import abi from '../../abis/ProofOfMeet.json';

type Data = {
  txhash: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const rpc = process.env.RPC;
  const private_key = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY : '0x';
  const contractAddress = process.env.CONTRACT_ADDRESS ? process.env.CONTRACT_ADDRESS : '0x';;

  const signer = new ethers.Wallet(
    private_key,
    new ethers.providers.JsonRpcProvider(rpc)
  );
  const contract = new ethers.Contract(contractAddress, abi.abi).connect(signer);

  const tx = await contract.safeMultiMint(
    [req.body.sigs[0].v, req.body.sigs[1].v],
    [req.body.sigs[0].r, req.body.sigs[1].r],
    [req.body.sigs[0].s, req.body.sigs[1].s],
    req.body.uri,
    req.body.nonce
  );

  res.json({ txhash: tx.txhash });

}
