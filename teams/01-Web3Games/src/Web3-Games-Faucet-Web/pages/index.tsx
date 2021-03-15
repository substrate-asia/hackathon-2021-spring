import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Link from 'next/link'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Web3 Game SDK</title>
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Web3-Games-SDK!
        </h1>


        <div className={styles.grid}>
          <Link  href="/post/Faucet">
            <a className={styles.card}>
              <h3>Faucet &rarr;</h3>
              <p>Receive Substarte Game Chain【SGC】public testnet test coin.</p>
            </a>
          </Link>

          <Link  href="https://github.com/Web3-Substrate-Game-World">
            <a  className={styles.card}>
              <h3>Learn &rarr;</h3>
              <p>Learn how to develop blockchain games on Substarte Game Chain!</p>
            </a>
          </Link>

          <Link  href="https://github.com/Web3-Substrate-Game-World">
            <a  className={styles.card}>
              <h3>Developer &rarr;</h3>
              <p>Quickly access blockchain games through our SDK toolkit.</p>
            </a>
          </Link>

          <Link  href="https://github.com/Web3-Substrate-Game-World">
            <a  className={styles.card}>
              <h3>contact &rarr;</h3>
              <p> Welcome to contact us through this channel!</p>
            </a>
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://github.com/Web3-Substrate-Game-World"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/images/logo.svg" alt="SGC Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  )
}
