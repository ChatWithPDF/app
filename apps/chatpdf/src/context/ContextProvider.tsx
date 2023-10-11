'use client';
import {
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import { AppContext } from '.';
import _ from 'underscore';
import { v4 as uuidv4 } from 'uuid';
import { UserType } from '../types';
import { IntlProvider } from 'react-intl';
import { useLocalization } from '../hooks';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useCookies } from 'react-cookie';

function loadMessages(locale: string) {
  switch (locale) {
    case 'en':
      return import('../../lang/en.json');
    case 'hi':
      return import('../../lang/hi.json');
    default:
      return import('../../lang/en.json');
  }
}

const ContextProvider: FC<{
  locale: any;
  localeMsgs: any;
  setLocale: any;
  children: ReactElement;
}> = ({ locale, children, localeMsgs, setLocale }) => {
  const t = useLocalization();
  const [collapsed, setCollapsed] = useState(false); // LeftSide menu bar
  const [pdfList, setPdfList] = useState<any[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<any>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingPdf, setProcessingPdf] = useState(false); // Used to show spinner while API req is on pending
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType>();
  const [loading, setLoading] = useState(false);
  const [isMsgReceiving, setIsMsgReceiving] = useState(false);
  const [messages, setMessages] = useState<Array<any>>([]);
  const [conversationId, setConversationId] = useState<string | null>(
    sessionStorage.getItem('conversationId')
  );
  const [isDown, setIsDown] = useState(true);
  const [showDialerPopup, setShowDialerPopup] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const [cookie, setCookie, removeCookie] = useCookies();
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);
  const [currentPdfId, setCurrentPdfId] = useState('');
  const [keyword, setKeyword] = useState([]);

  console.log(messages);

  const updateMsgState = useCallback(
    ({
      user,
      msg,
      media,
    }: {
      user: { name: string; id: string };
      msg: {
        content: { title: string; choices: any; highlightText: any };
        messageId: string;
      };
      media: any;
    }) => {
      console.log('hie', msg);
      if (msg.content.title !== '') {
        const newMsg = {
          username: user?.name,
          text: msg.content.title,
          choices: msg.content.choices,
          position: 'left',
          id: user?.id,
          botUuid: user?.id,
          reaction: 0,
          messageId: msg?.messageId,
          //@ts-ignore
          conversationId: msg?.content?.conversationId,
          highlightText: msg?.content?.highlightText,
          sentTimestamp: Date.now(),
          ...media,
        };

        //@ts-ignore
        if (conversationId === msg?.content?.conversationId)
          setMessages((prev: any) => _.uniq([...prev, newMsg], ['messageId']));
      }
    },
    [conversationId]
  );

  console.log('erty:', { conversationId });

  const onMessageReceived = useCallback(
    async (msg: any) => {
      console.log('mssgs:', messages);
      console.log('#-debug:', { msg });
      setLoading(false);
      setIsMsgReceiving(false);
      //@ts-ignore
      const user = JSON.parse(localStorage.getItem('currentUser'));

      if (msg.content.msg_type.toUpperCase() === 'IMAGE') {
        updateMsgState({
          user,
          msg,
          media: { imageUrl: msg?.content?.media_url },
        });
      } else if (msg.content.msg_type.toUpperCase() === 'AUDIO') {
        updateMsgState({
          user,
          msg,
          media: { audioUrl: msg?.content?.media_url },
        });
      } else if (msg.content.msg_type.toUpperCase() === 'VIDEO') {
        updateMsgState({
          user,
          msg,
          media: { videoUrl: msg?.content?.media_url },
        });
      } else if (
        msg.content.msg_type.toUpperCase() === 'DOCUMENT' ||
        msg.content.msg_type.toUpperCase() === 'FILE'
      ) {
        updateMsgState({
          user,
          msg,
          media: { fileUrl: msg?.content?.media_url },
        });
      } else if (msg.content.msg_type.toUpperCase() === 'TEXT') {
        updateMsgState({ user, msg, media: {} });
      }
    },
    [messages, updateMsgState]
  );

  const onChangeCurrentUser = useCallback((newUser: UserType) => {
    setCurrentUser({ ...newUser, active: true });
    // setMessages([]);
  }, []);

  //@ts-ignore
  const sendMessage = useCallback(
    async (text: string, media: any) => {
      if (
        !localStorage.getItem('userID') ||
        !sessionStorage.getItem('conversationId')
      ) {
        removeCookie('access_token', { path: '/' });
        location?.reload();
        return;
      }
      // console.log('mssgs:', messages)
      setIsMsgReceiving(true);

      setLoading(true);

      //  console.log('mssgs:',messages)
      if (media) {
        if (media.mimeType.slice(0, 5) === 'image') {
        } else if (media.mimeType.slice(0, 5) === 'audio') {
        } else if (media.mimeType.slice(0, 5) === 'video') {
        } else if (media.mimeType.slice(0, 11) === 'application') {
        } else {
        }
      } else {
        //console.log('mssgs:',messages)
        //@ts-ignore
        setMessages((prev: any) => [
          ...prev.map((prevMsg: any) => ({ ...prevMsg })),
          {
            username: 'state.username',
            text: text,
            position: 'right',
            botUuid: currentUser?.id,
            payload: { text },
            time: Date.now(),
            disabled: true,
            messageId: uuidv4(),
            repliedTimestamp: Date.now(),
          },
        ]);
        // Send the user's message to API
        const data = {
          body: text,
          userId: localStorage.getItem('userID'),
          messageId: uuidv4(),
          conversationId: sessionStorage.getItem('conversationId'),
          // pdfId: selectedPdf?.id,
        };

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/prompt`,
            data,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          // Handle response here
          console.log('hie', response.data);
          onMessageReceived({
            content: {
              title: response.data.output,
              msg_type: 'TEXT',
              choices: null,
              conversationId: sessionStorage.getItem('conversationId'),
              highlightText: response?.data?.context,
            },
            messageId: response.data.id,
          });
        } catch (error) {
          // Handle error here
          onMessageReceived({
            content: {
              title: 'Something went wrong. Please try again later.',
              msg_type: 'TEXT',
              choices: null,
              conversationId: sessionStorage.getItem('conversationId'),
              highlightText: null,
            },
            messageId: uuidv4(),
          });
          setIsMsgReceiving(false);
          setLoading(false);
          console.log(error);
        }
      }
    },
    [removeCookie, currentUser?.id, onMessageReceived]
  );

  const fetchIsDown = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/health/20`
      );
      const status = res.data.status;
      console.log('hie', status);
      if (status === 'OK') {
        setIsDown(false);
      } else {
        setIsDown(true);
        console.log('Server status is not OK');
      }
    } catch (error) {
      console.error(error);
    }
  }, [setIsDown]);

  useEffect(() => {
    if (isDown) return;
    let secondTimer: any;
    const timer = setTimeout(() => {
      if (isMsgReceiving && loading) {
        toast.error(`${t('message.taking_longer')}`);
        secondTimer = setTimeout(() => {
          if (isMsgReceiving && loading) {
            toast.error(`${t('message.retry')}`);
            setIsMsgReceiving(false);
            setLoading(false);
            fetchIsDown();
          }
        }, 25000);
      }
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearTimeout(secondTimer);
    };
  }, [fetchIsDown, isDown, isMsgReceiving, loading, t]);

  const values = useMemo(
    () => ({
      currentUser,
      allUsers: users,
      toChangeCurrentUser: onChangeCurrentUser,
      sendMessage,
      messages,
      setMessages,
      loading,
      setLoading,
      isMsgReceiving,
      setIsMsgReceiving,
      locale,
      setLocale,
      localeMsgs,
      setConversationId,
      isDown,
      fetchIsDown,
      showDialerPopup,
      setShowDialerPopup,
      showPopUp,
      setShowPopUp,
      isAudioPlaying,
      setIsAudioPlaying,
      audioRef,
      pdfList,
      setPdfList,
      selectedPdf,
      setSelectedPdf,
      uploadingPdf,
      setUploadingPdf,
      uploadProgress,
      setUploadProgress,
      processingPdf,
      setProcessingPdf,
      collapsed,
      setCollapsed,
      currentPdfId,
      setCurrentPdfId,
      keyword,
      setKeyword,
    }),
    [
      locale,
      setLocale,
      localeMsgs,
      currentUser,
      users,
      onChangeCurrentUser,
      sendMessage,
      messages,
      loading,
      setLoading,
      isMsgReceiving,
      setIsMsgReceiving,
      setConversationId,
      isDown,
      fetchIsDown,
      showDialerPopup,
      setShowDialerPopup,
      showPopUp,
      setShowPopUp,
      isAudioPlaying,
      setIsAudioPlaying,
      audioRef,
      pdfList,
      setPdfList,
      selectedPdf,
      setSelectedPdf,
      uploadingPdf,
      setUploadingPdf,
      uploadProgress,
      setUploadProgress,
      processingPdf,
      setProcessingPdf,
      collapsed,
      setCollapsed,
      currentPdfId,
      setCurrentPdfId,
      keyword,
      setKeyword,
    ]
  );

  return (
    //@ts-ignore
    <AppContext.Provider value={values}>
      <IntlProvider locale={locale} messages={localeMsgs}>
        {children}
      </IntlProvider>
    </AppContext.Provider>
  );
};

const SSR: FC<{ children: ReactElement }> = ({ children }) => {
  const [locale, setLocale] = useState('');
  const [localeMsgs, setLocaleMsgs] =
    useState<Record<string, string> | null>(null);
  useEffect(() => {
    setLocale(localStorage.getItem('locale') || 'en');
  }, []);

  useEffect(() => {
    loadMessages(locale).then((res) => {
      //@ts-ignore
      setLocaleMsgs(res);
    });
  }, [locale]);

  if (typeof window === 'undefined') return null;
  return (
    //@ts-ignore
    <IntlProvider locale={locale} messages={localeMsgs}>
      <ContextProvider
        locale={locale}
        setLocale={setLocale}
        localeMsgs={localeMsgs}>
        {children}
      </ContextProvider>
    </IntlProvider>
  );
};
export default SSR;
