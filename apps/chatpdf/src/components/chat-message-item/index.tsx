import {
  Bubble,
  Image as Img,
  ScrollView,
  List,
  ListItem,
  FileCard,
  Video,
  Typing,
  RichText,
  //@ts-ignore
} from 'chatui';
import axios from 'axios';
import React, {
  FC,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { toast } from 'react-hot-toast';

import styles from './index.module.css';
import RightIcon from '../../assets/icons/right.jsx';
import CopyText from '../../assets/icons/copy-text.svg';
import MsgThumbsUp from '../../assets/icons/msg-thumbs-up.jsx';
import MsgThumbsDown from '../../assets/icons/msg-thumbs-down.jsx';
import { AppContext } from '../../context';
import { ChatMessageItemPropType } from '../../types';
import { getFormatedTime } from '../../utils/getUtcTime';
import { useLocalization } from '../../hooks/useLocalization';
import { getReactionUrl } from '../../utils/getUrls';
import Image from 'next/image';
import { Button } from '@chakra-ui/react';
import { useCookies } from 'react-cookie';

const getToastMessage = (t: any, reaction: number): string => {
  if (reaction === 1) return t('toast.reaction_like');
  return t('toast.reaction_reset');
};
const ChatMessageItem: FC<ChatMessageItemPropType> = ({
  currentUser,
  message,
  onSend,
}) => {
  const t = useLocalization();
  const context = useContext(AppContext);
  const [reaction, setReaction] = useState(message?.content?.data?.reaction);
  const [cookies, setCookie, removeCookie] = useCookies(['access_token']);

  useEffect(() => {
    setReaction(message?.content?.data?.reaction);
  }, [message?.content?.data?.reaction]);

  const onLikeDislike = useCallback(
    ({ value, msgId }: { value: 0 | 1 | -1; msgId: string }) => {
      let url = getReactionUrl({ msgId, reaction: value });

      axios
        .get(url, {
          headers: {
            authorization: `Bearer ${cookies.access_token}`,
          },
        })
        .then((res: any) => {
          if (value === -1) {
            context?.setShowDialerPopup(true);
          } else {
            toast.success(`${getToastMessage(t, value)}`);
          }
        })
        .catch((error: any) => {
          console.error(error);
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t]
  );

  async function copyTextToClipboard(text: string) {
    console.log('here');
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand('copy', true, text);
    }
  }
  const feedbackHandler = useCallback(
    ({ like, msgId }: { like: 0 | 1 | -1; msgId: string }) => {
      console.log('vbnm:', { reaction, like, msgId });
      if (reaction === 0) {
        setReaction(like);
        return onLikeDislike({ value: like, msgId });
      }
      if (reaction === 1 && like === -1) {
        console.log('vbnm triggered 1');
        setReaction(-1);
        return onLikeDislike({ value: -1, msgId });
      }
      if (reaction === -1 && like === 1) {
        console.log('vbnm triggered 2');
        setReaction(1);
        return onLikeDislike({ value: 1, msgId });
      }

      console.log('vbnm triggered');
      onLikeDislike({ value: 0, msgId });
      setReaction(0);
    },
    [onLikeDislike, reaction]
  );

  const getLists = useCallback(
    ({ choices, isDisabled }: { choices: any; isDisabled: boolean }) => {
      console.log('qwer12:', { choices, isDisabled });
      return (
        <List className={`${styles.list}`}>
          {choices?.map((choice: any, index: string) => (
            // {_.map(choices ?? [], (choice, index) => (
            <ListItem
              key={`${index}_${choice?.key}`}
              className={`${styles.onHover} ${styles.listItem}`}
              onClick={(e: any): void => {
                e.preventDefault();
                console.log('qwer12 trig', { key: choice.key, isDisabled });
                if (isDisabled) {
                  toast.error(`${t('message.cannot_answer_again')}`);
                } else {
                  if (context?.messages?.[0]?.exampleOptions) {
                    console.log('clearing chat');
                    context?.setMessages([]);
                  }
                  // context?.sendMessage(choice.text);
                }
              }}>
              <div className="onHover" style={{ display: 'flex' }}>
                <div>{choice.text}</div>
                <div style={{ marginLeft: 'auto' }}>
                  <RightIcon width="5.5vh" color="var(--secondary)" />
                </div>
              </div>
            </ListItem>
          ))}
        </List>
      );
    },
    [context, t]
  );

  useEffect(() => {
    // Add event listeners to the buttons
    const buttons = document.querySelectorAll('.reference');
    console.log('i ran', buttons);
    buttons.forEach((button, index) => {
      button.addEventListener('click', () =>
        textHighlighter(content, button?.classList?.[1])
      );
    });

    return () => {
      buttons.forEach((button, index) => {
        button.removeEventListener('click', () =>
          textHighlighter(content, button?.classList?.[1])
        );
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.messages]);

  const textHighlighter = (content: any, id: any) => {
    context?.setShowPdf(true);
    console.log('here', content, id);
    if (!id) return;
    let desiredItem = null;
    if (content?.data?.highlightText) {
      for (const item of content.data.highlightText) {
        console.log('okie', item.documentId, id, item.content);
        if (item.documentId == id) {
          console.log('okie here');
          desiredItem = item;
          break;
        }
      }
      console.log('okie', desiredItem);
      if (!desiredItem) {
        context?.setKeyword(content?.data?.highlightText?.[0]);
      } else {
        if (
          content?.data?.position === 'left' &&
          content?.data?.highlightText
        ) {
          if (context?.keyword && context?.keyword?.id !== desiredItem?.id) {
            context?.setKeyword(desiredItem);
          } else if (!context?.keyword) {
            context?.setKeyword(desiredItem);
          }
        }
      }
    }
  };

  const createLinkIfUrl = (text: any) => {
    const urlPattern = /(https:\/\/[^\s\])]+)/g;
    return text.replace(urlPattern, (url: any) => {
      const lastCharacter = url[url.length - 1];
      const punctuation = /[)\]]/;

      if (punctuation.test(lastCharacter)) {
        const urlWithoutPunctuation = url.slice(0, -1);
        return `<a href="${urlWithoutPunctuation}" target="_blank" style="text-decoration: underline; color: #0000ffb7">${urlWithoutPunctuation}</a>${lastCharacter}`;
      }

      return `<a href="${url}" style="text-decoration: underline; color: #0000ffb7">${url}</a>`;
    });
  };

  const addMarkup = (word: any) => {
    return (
      createLinkIfUrl(word) ||
      word.replace(
        /\[(\d+)\]/g,
        (match: any, p1: any) =>
          `<sup class="reference ${p1}" style="margin-right: 2px; color: var(--secondary)"><button>${p1}</button></sup>`
      )
    );
  };

  const { content, type } = message;
  const sanitizedText = content?.text.replace(/\n/g, '\n ');

  const formattedContent = sanitizedText
    ?.split(' ')
    ?.map((word: any, index: number) => addMarkup(word))
    ?.join(' ');

  switch (type) {
    case 'loader':
      return <Typing />;
    case 'text':
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            maxWidth: '90vw',
          }}>
          {/* <div
            className={
              content?.data?.position === 'right'
                ? styles.messageTriangleRight
                : styles.messageTriangleLeft
            }></div> */}
          <Bubble type="text">
            <span
              className="onHover"
              style={{
                fontWeight: 600,
                fontSize: '1.2rem',
                color:
                  content?.data?.position === 'right' ? 'white' : 'var(--font)',
              }}>
              <RichText content={formattedContent} />
            </span>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
              }}>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color:
                    content?.data?.position === 'right'
                      ? 'white'
                      : 'var(--font)',
                  fontSize: '12px',
                }}
                className="font-regular">
                {getFormatedTime(
                  content?.data?.sentTimestamp ||
                    content?.data?.repliedTimestamp
                )}
              </span>
            </div>
          </Bubble>
          {content?.data?.position === 'left' && (
            <div className={styles.msgFeedback}>
              <div className={styles.msgFeedbackIcons}>
                <div
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    feedbackHandler({
                      like: 1,
                      msgId: content?.data?.messageId,
                    })
                  }>
                  <MsgThumbsUp
                    fill={reaction === 1}
                    width="20px"
                    color="var(--secondary)"
                  />
                </div>
                <div
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    feedbackHandler({
                      like: -1,
                      msgId: content?.data?.messageId,
                    })
                  }>
                  <MsgThumbsDown
                    fill={reaction === -1}
                    width="20px"
                    color="var(--secondary)"
                  />
                </div>
              </div>
              &nbsp;
              <p>{t('message.helpful')}</p>
            </div>
          )}
        </div>
      );

    case 'image': {
      const url = content?.data?.payload?.media?.url || content?.data?.imageUrl;
      return (
        <>
          {content?.data?.position === 'left' && (
            <div
              style={{
                width: '40px',
                marginRight: '4px',
                textAlign: 'center',
              }}></div>
          )}
          <Bubble type="image">
            <div style={{ padding: '7px' }}>
              <Img src={url} width="299" height="200" alt="image" lazy fluid />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'self-end',
                }}>
                <span style={{ color: 'var(--font)', fontSize: '10px' }}>
                  {getFormatedTime(
                    content?.data?.sentTimestamp ||
                      content?.data?.repliedTimestamp
                  )}
                </span>
              </div>
            </div>
          </Bubble>
        </>
      );
    }

    case 'file': {
      const url = content?.data?.payload?.media?.url || content?.data?.fileUrl;
      return (
        <>
          {content?.data?.position === 'left' && (
            <div
              style={{
                width: '40px',
                marginRight: '4px',
                textAlign: 'center',
              }}></div>
          )}
          <Bubble type="image">
            <div style={{ padding: '7px' }}>
              <FileCard file={url} extension="pdf" />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'self-end',
                }}>
                <span style={{ color: 'var(--font)', fontSize: '10px' }}>
                  {getFormatedTime(
                    content?.data?.sentTimestamp ||
                      content?.data?.repliedTimestamp
                  )}
                </span>
              </div>
            </div>
          </Bubble>
        </>
      );
    }

    case 'video': {
      const url = content?.data?.payload?.media?.url || content?.data?.videoUrl;
      return (
        <>
          {content?.data?.position === 'left' && (
            <div
              style={{
                width: '40px',
                marginRight: '4px',
                textAlign: 'center',
              }}></div>
          )}
          <Bubble type="image">
            <div style={{ padding: '7px' }}>
              <Video
                cover="https://uxwing.com/wp-content/themes/uxwing/download/video-photography-multimedia/video-icon.png"
                src={url}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'self-end',
                }}>
                <span style={{ color: 'var(--font)', fontSize: '10px' }}>
                  {getFormatedTime(
                    content?.data?.sentTimestamp ||
                      content?.data?.repliedTimestamp
                  )}
                </span>
              </div>
            </div>
          </Bubble>
        </>
      );
    }
    case 'options': {
      console.log('qwe12:', { content });
      return (
        <>
          {/* <div
            style={{ width: "95px", marginRight: "4px", textAlign: "center" }}
          ></div> */}
          <Bubble type="text" className={styles.textBubble}>
            <div style={{ display: 'flex' }}>
              <span className={styles.optionsText}>
                {content?.data?.payload?.text}
              </span>
            </div>
            {getLists({
              choices:
                content?.data?.payload?.buttonChoices ?? content?.data?.choices,
              isDisabled: false,
            })}
          </Bubble>
        </>
      );
    }
    default:
      return (
        <ScrollView
          data={[]}
          // @ts-ignore
          renderItem={(item): ReactElement => <Button label={item.text} />}
        />
      );
  }
};

export default ChatMessageItem;
