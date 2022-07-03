import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useWeb3 } from '../hooks/useWeb3'
import { SetStateAction, useEffect, useState } from 'react'
import QRCode from 'qrcode.react'
import dynamic from 'next/dynamic'
import { getTypedSignature } from '../utils/web3'
import { ethers } from 'ethers'
const QrReader = dynamic(() => import('react-qr-reader'), { ssr: false })

interface Window {
  ethereum: any;
}

declare const window: Window;

const Home: NextPage = () => {
  const {
    address,
    connectWeb3,
  } = useWeb3();

  let signer: ethers.providers.JsonRpcSigner

  const chainId = 80001
  const contractAddress ="0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47"

  const [isQR, setIsQR] = useState(false)
  const [qrvalue, setQrvalue] = useState("");
  const handleCreate = async () => {

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const sig = await getTypedSignature(
      chainId,
      contractAddress,
      20200222,
      provider.getSigner(),
    );
    console.log(JSON.stringify(sig));
    setQrvalue(JSON.stringify(sig));
    setIsQR(true);
  }

  const [data, setData] = useState('No result');
  const [isScan, setIsScan] = useState(false);

  const handleScanClick = () => {
    setIsScan(!isScan)
  }

  const handleScan = async (data:any) => {
    console.log(1)
    if(data) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const secSig = await getTypedSignature(
        chainId,
        contractAddress,
        20200222,
        provider.getSigner(),
      );
    }
    // const firstSig = JSON.parse(qrvalue)
    // console.log(firstSig)
    // const sigs = [firstSig, secSig]

    // setData(data.text)
  }

  const handleError = (err:any) => {
    console.error(err)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Proof of Meet</title>
        <meta name="description" content="Proof of Meet" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Proof of Meet
        </h1>

        { address ? (<>
          Your Address : {address}
        </>) : (<>
          <button onClick={connectWeb3}>
            Connect Wallet
          </button>
        </>)}

        <p className={styles.description}>
          Lets start PoM
        </p>

        <button onClick={async () => handleCreate()}>
          Create QR code
        </button>
        {
          isQR && <QRCode value={qrvalue} renderAs="canvas" />
        }

        <button onClick={async () => handleScanClick()}>
          Scan QR code
        </button>
        { isScan && <QrReader
            delay={500}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '50%' }}
          />
        }
        <p>{data}</p>

      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export default Home
