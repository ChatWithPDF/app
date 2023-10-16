import { useState, useContext, useCallback, useEffect } from 'react';
import styles from './index.module.css';
import { AppContext } from '../../context';
import { useLocalization } from '../../hooks';
import { Select, MenuItem } from '@material-ui/core';
import HamburgerIcon from '../../assets/icons/burger-menu';
import Image from 'next/image';
import LeftSide from '../LeftSide';
import { v4 as uuidv4 } from 'uuid';
import plusIcon from '../../assets/icons/plus.svg';
import toast from 'react-hot-toast';

function NavBar() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const context = useContext(AppContext);
  const t = useLocalization();

  useEffect(() => {
    const storedLanguage = localStorage.getItem('locale');
    if (storedLanguage) {
      setSelectedLanguage(storedLanguage);
    } else {
      localStorage.setItem('locale', 'en');
    }
  }, []);

  const toggleLanguage = useCallback(
    (event: any) => {
      const newLanguage = event.target.value;
      localStorage.setItem('locale', newLanguage);
      context?.setLocale(newLanguage);
      setSelectedLanguage(newLanguage);
    },
    [context]
  );

  function toggleMobileMenu() {
    context?.setCollapsed((prev: any) => !prev);
  }

  const newChatHandler = () => {
    context?.setMessages([]);
    sessionStorage.setItem('conversationId', uuidv4());
    toast.success('New chat started!');
  };

  return (
    <div className={styles.navbar}>
      {context?.collapsed && (
        <div className={styles.mobileView}>
          <LeftSide />
        </div>
      )}
      <div className={styles.hamburgerIcon} onClick={toggleMobileMenu}>
        <HamburgerIcon color={context?.collapsed ? 'white' : 'black'} />
      </div>
      <div className={styles.navbarHeading}>{t('label.title')}</div>
      <div className={styles.newChatContainer} onClick={newChatHandler}>
        <Image src={plusIcon} alt="" width={20} height={20} />
      </div>
    </div>
  );
}

export default NavBar;
