import { useState, useContext, useCallback, useEffect } from 'react';
import styles from './index.module.css';
import { AppContext } from '../../context';
import { useLocalization } from '../../hooks';
import HamburgerIcon from '../../assets/icons/burger-menu';
import crossIcon from '../../assets/icons/crossIcon.svg';
import Image from 'next/image';
import LeftSide from '../LeftSide';
import { v4 as uuidv4 } from 'uuid';
import plusIcon from '../../assets/icons/plus.svg';
import pdfIcon from '../../assets/icons/pdfIcon.svg';
import messageIcon from '../../assets/icons/message-menu.svg';
import toast from 'react-hot-toast';

function NavBar() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const context = useContext(AppContext);
  const t = useLocalization();
  const [mobile, setMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  const handleWindowSizeChange = () => {
    if (window.innerWidth < 768) {
      setMobile(true);
    } else setMobile(false);
  };


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
    if(context?.loading){
      toast.error('Please wait for a response!');
      return;
    }
    context?.setMessages([]);
    const newConversationId = uuidv4();
    sessionStorage.setItem('conversationId', newConversationId);
    context?.setConversationId(newConversationId);
    toast.success('New chat started!');
  };

  const showPdfHandler = () => {
    context?.setShowPdf((prev: boolean) => !prev);
  }

  return (
    <div className={styles.navbar}>
      <div className={styles.mobileView}>
        <LeftSide show={context?.collapsed} />
      </div>
      <div className={styles.hamburgerIcon} onClick={toggleMobileMenu}>
        {context?.collapsed ? (
          <Image src={crossIcon} alt="" height={25} width={25} />
        ) : (
          <HamburgerIcon color="#b99825" />
        )}
      </div>
      <div className={styles.navbarHeading}>{t('label.title')}</div>
      {mobile && <div className={styles.newChatContainer} onClick={showPdfHandler}>
        {context?.showPdf ? <Image src={messageIcon} alt=""  width={20} height={20}/> : <Image src={pdfIcon} alt="" width={20} height={20} />}
      </div>}
      <div className={styles.newChatContainer} onClick={newChatHandler}>
        <Image src={plusIcon} alt="" width={20} height={20} />
      </div>
    </div>
  );
}

export default NavBar;
