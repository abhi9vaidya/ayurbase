import '../styles/globals.css'
import Header from '../components/Header'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Component {...pageProps} />
      </main>
    </>
  )
}
