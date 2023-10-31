import axios from 'axios';
//@ts-ignore
import Chat from 'chatui';
import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppContext } from '../../context';
import { useLocalization } from '../../hooks';
import { getMsgType } from '../../utils/getMsgType';
import ChatMessageItem from '../chat-message-item';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import RenderVoiceRecorder from '../recorder/RenderVoiceRecorder';
import NavBar from '../NavBar';
import { logEvent, setUserProperties } from 'firebase/analytics';
import { analytics } from '../../utils/firebase';
import { useFlags } from 'flagsmith/react';

const ChatUiWindow: React.FC = () => {
  const t = useLocalization();
  const context = useContext(AppContext);
  const [divHeight, setDivHeight] = useState<any>('88%');
  const flags = useFlags([
    'example_ques_one',
    'example_ques_two',
    'example_ques_three',
  ]);

  const updateDivHeight = () => {
    const newHeight = window.innerWidth < 768 ? window.innerHeight - 80 : '88%';
    setDivHeight(newHeight);
  };

  useEffect(() => {
    updateDivHeight();
    window.addEventListener('resize', updateDivHeight);
    return () => {
      window.removeEventListener('resize', updateDivHeight);
    };
  }, []);

  useEffect(() => {
    // should be logged in, should have phone number, should not trigger again in one session and should have username
    if (
      context?.isLoggedIn &&
      localStorage.getItem('phoneNumber') &&
      !sessionStorage.getItem('triggered') &&
      localStorage.getItem('username')
    ) {
      //@ts-ignore
      setUserProperties(analytics, { name: localStorage.getItem('username') });
      //@ts-ignore
      logEvent(analytics, localStorage.getItem('phoneNumber'), {
        username: localStorage.getItem('username'),
      });
      sessionStorage.setItem('triggered', 'true');
    }
  }, [context?.isLoggedIn]);

  const normalizedChat = (chats: any): any => {
    console.log('in normalized');
    const conversationId = sessionStorage.getItem('conversationId');
    const history = chats
      .filter(
        (item: any) =>
          conversationId === 'null' || item.conversationId === conversationId
      )
      .flatMap((item: any) => [
        {
          text: item.query,
          position: 'right',
          repliedTimestamp: item.createdAt,
          messageId: uuidv4(),
        },
        {
          text: item.response,
          position: 'left',
          sentTimestamp: item.createdAt,
          reaction: item.reaction,
          msgId: item.id,
          messageId: item.id,
        },
      ]);

    console.log('historyyy', history);
    console.log('history length:', history.length);

    return history;
  };

  useEffect(() => {
    if (!sessionStorage.getItem('conversationId')) {
      const newConversationId = uuidv4();
      sessionStorage.setItem('conversationId', newConversationId);
      context?.setConversationId(newConversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = useCallback(
    async (type: string, msg: any) => {
      if (msg.length === 0) {
        toast.error(t('error.empty_msg'));
        return;
      }
      console.log('mssgs:', context?.messages);
      if (type === 'text' && msg.trim()) {
        context?.sendMessage(msg.trim());
      }
    },
    [context, t]
  );
  const normalizeMsgs = useMemo(
    () =>
      context?.messages?.map((msg: any) => ({
        type: getMsgType(msg),
        content: { text: msg?.text, data: { ...msg } },
        position: msg?.position ?? 'right',
        messageId: msg?.messageId,
      })),
    [context?.messages]
  );
  console.log('fghj:', { messages: context?.messages });
  const msgToRender = useMemo(() => {
    return context?.isMsgReceiving
      ? [
          ...normalizeMsgs,
          {
            type: 'loader',
            position: 'left',
            botUuid: '1',
          },
        ]
      : normalizeMsgs;
  }, [context?.isMsgReceiving, normalizeMsgs]);

  console.log('debug:', { msgToRender });

  const placeholder = useMemo(() => t('message.ask_ur_question'), [t]);

  return (
    <>
      {/* sidebar backdrop div */}
      <div
        style={{
          background: context?.collapsed ? 'rgba(0, 0, 0, 0.6)' : '',
          position: context?.collapsed ? 'absolute' : 'static',
          top: '0',
          bottom: '0',
          left: '0',
          right: '0',
          zIndex: context?.collapsed ? '111' : '0',
        }}></div>
      <div style={{ height: divHeight, width: '100%' }}>
        <Chat
          quickReplies={[
            {
              name:
                flags?.example_ques_one?.value || 'When is the next holiday?',
            },
            {
              name:
                flags?.example_ques_two?.value ||
                'How can I create a good one-pager?',
            },
            {
              name:
                flags?.example_ques_three?.value ||
                'What is a Samagra case study?',
            }
          ]}
          onQuickReplyClick={(e: any) => handleSend('text', e.name)}
          btnColor="var(--secondary)"
          background="var(--bg-color)"
          disableSend={context?.loading}
          //@ts-ignore
          messages={msgToRender}
          // voiceToText={RenderVoiceRecorder}
          //@ts-ignore
          renderMessageContent={(props): ReactElement => (
            <ChatMessageItem
              key={props}
              message={props}
              currentUser={context?.currentUser}
              onSend={handleSend}
            />
          )}
          onSend={handleSend}
          locale="en-US"
          placeholder={placeholder}
        />
      </div>
    </>
  );
};

export default ChatUiWindow;
