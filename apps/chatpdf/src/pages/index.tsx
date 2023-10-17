import type { NextPage } from 'next';
import Head from 'next/head';
import { useLocalization } from '../hooks/useLocalization';
import dynamic from 'next/dynamic';
import LeftSide from '../components/LeftSide';
import MiddleSide from '../components/MiddleSide';
import { AppContext } from '../context';
import { useContext, useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import LaunchPage from '../components/LaunchPage';
import LoginPage from '../components/LoginPage';
import { useLogin } from '../hooks';

const ChatUiWindow = dynamic(
  () => import('../components/ChatWindow/ChatUiWindow'),
  { ssr: false }
);

const Home: NextPage = () => {
  const t = useLocalization();
  const context = useContext(AppContext);
  const { isAuthenticated, login } = useLogin();
  const { isLoggedIn } = context;
  const [showLaunchPage, setShowLaunchPage] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      login();
    }
  }, [isAuthenticated, login]);

  useEffect(() => {
    setTimeout(() => {
      setShowLaunchPage(!showLaunchPage);
    }, 2200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (showLaunchPage) {
    return <LaunchPage />;
  } else if (isLoggedIn) {
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
              backgroundColor: '#b99825',
              flex: '0.2',
              color: 'white',
              transition: 'all 0.2s ease',
            }}>
            <LeftSide />
          </div>
          <div
            style={{
              flex: 0.7,
              height: '100vh',
            }}>
            <NavBar />
            <div
              id="chatUI"
              style={{
                position: 'fixed',
                top: '90px',
                bottom: '1vh',
                width: '36.5vw',
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
  } else {
    return <LoginPage />;
  }
};
export default Home;
