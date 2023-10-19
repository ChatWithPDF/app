import type { NextPage } from 'next';
import Head from 'next/head';
import { useLocalization } from '../hooks/useLocalization';
import dynamic from 'next/dynamic';
import LeftSide from '../components/LeftSide';
import MiddleSide from '../components/MiddleSide';
import { AppContext } from '../context';
import { useContext, useState, useEffect } from 'react';
import LaunchPage from '../components/LaunchPage';
import NavBar from '../components/NavBar';

const ChatUiWindow = dynamic(
  () => import('../components/ChatWindow/ChatUiWindow'),
  { ssr: false }
);

const Home: NextPage = () => {
  const t = useLocalization();
  const context = useContext(AppContext);
  const [showLaunchPage, setShowLaunchPage] = useState(true);
  const { collapsed } = context;

  useEffect(() => {
    setTimeout(() => {
      setShowLaunchPage(!showLaunchPage);
    }, 2200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (showLaunchPage) {
    return <LaunchPage />;
  } else {
    return (
      <>
        <Head>
          <title> {t('label.title')}</title>
        </Head>
        <div
          style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
          }}>
          <div
            style={{
              backgroundColor: 'rgb(0, 21, 41)',
              flex: collapsed ? '0.05' : '0.2',
              color: 'white',
              transition: 'all 0.2s ease',
            }}>
            <LeftSide />
          </div>
          <div
            style={{
              flex: 1,
              height: '100vh',
            }}>
            <NavBar />
            <div
              id="chatUI"
              style={{
                position: 'fixed',
                top: '90px',
                bottom: '1vh',
                width: '45vw',
              }}>
              <ChatUiWindow />
            </div>
          </div>
          <div
            style={{
              backgroundColor: '#0B1F3A',
              flex: 1,
            }}>
            <MiddleSide />
          </div>
        </div>

        {/* Mobile View */}
        <style jsx>{`
          @media (max-width: 767px) {
            #chatUI {
              width: 100% !important;
              display: block;
            }
            div {
              display: none;
            }
            div:nth-last-child(2) {
              display: block;
              height: 100vh;
            }
          }
        `}</style>
      </>
    );
  }
};
export default Home;
