import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import Image from 'next/image';
import logo from '../../assets/images/logo.png';

const LaunchPage = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const animationTimeout = setTimeout(() => {
      setAnimate(true);
    }, 500);

    const reverseAnimationTimeout = setTimeout(() => {
      setAnimate(false);
    }, 1500);

    return () => {
      clearTimeout(animationTimeout);
      clearTimeout(reverseAnimationTimeout);
    };
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.topSection}>
        <div className={styles.content}>
          <div className={styles.logo}>
            <Image src={logo} alt="Samagra logo" height={100} width={380} />
          </div>
          <div className={`${styles.title} ${animate ? styles.slideIn : styles.slideOut}`}>
            Samagra Bot
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchPage;
