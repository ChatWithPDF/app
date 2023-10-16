import React, { useContext, useState, useEffect } from 'react';
import Dropzone from 'react-dropzone';
import styles from './index.module.css';
import messageIcon from '../../assets/icons/message.svg';
import BurgerIcon from '../../assets/icons/burger-menu';
import logo from '../../assets/images/logo.png';
import Image from 'next/image';
import { AppContext } from '../../context';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { useCookies } from 'react-cookie';
import { v4 as uuidv4 } from 'uuid';
import deleteIcon from '../../assets/icons/delete.svg';

const LeftSide = () => {
  const context = useContext(AppContext);
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [spinner, setSpinner] = useState(true);
  const {
    pdfList,
    setPdfList,
    selectedPdf,
    setSelectedPdf,
    setUploadingPdf,
    setUploadProgress,
    setProcessingPdf,
    messages,
    setMessages,
    collapsed,
    setCollapsed,
    currentPdfId,
    setCurrentPdfId,
  } = context;
  const [cookie, setCookie, removeCookie] = useCookies();
  const [conversations, setConversations] = useState([]);

  const getConversations = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/user/conversations`, {
        headers: {
          Authorization: `Bearer ${cookie['access_token']}`,
        },
      })
      .then((res) => {
        console.log('history', res.data);
        setConversations(res.data);
      })
      .catch((err) => {
        console.log(err);
        toast.error('Could not load your chat history!');
      });
  };

  useEffect(() => {
    getConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

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

  const handleToggleCollapse = () => {
    setCollapsed((prevCollapsed: any) => !prevCollapsed);
  };

  useEffect(() => {
    let pdfListTemp: any[] = [];
    const fetchPdf = async (path: string, name: string, id: any) => {
      try {
        const response = await fetch(path);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        pdfListTemp.push({
          file: new File([blob], name),
          preview: blobUrl,
          id: id,
        });
      } catch (error) {
        console.error('Error fetching PDF:', error);
      }
    };

    Promise.all([
      fetchPdf(
        '/pdfs/Combined_PDF.pdf',
        'Samagra Resources',
        'b8c4a434-e310-47df-adc8-0a3f1c553116'
      ),
    ])
      .then(() => {
        setPdfList(pdfListTemp);
        setSpinner(false);
        setSelectedPdf(pdfListTemp[0]);
        setCurrentPdfId(pdfListTemp[0].id);
      })
      .catch((error) => {
        toast.error('Error fetching PDFs');
        console.error('Error fetching PDFs:', error);
        setSpinner(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDrop = async (acceptedFiles: File[]) => {
    if (!localStorage.getItem('userID')) {
      toast.error('No userID found.');
      return;
    }
    setUploadingPdf(true);
    setSelectedPdf(null);
    let updatedPdfList = [...pdfList];
    toast.success('Uploading PDF...');
    console.log(`Uploading ${acceptedFiles.length} file(s)...`);

    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', localStorage.getItem('userID') || '');

      try {
        console.log(`Uploading file ${file.name}...`);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/pdf/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(percentCompleted);
                if (percentCompleted === 100) {
                  setProcessingPdf(true);
                }
              }
            },
          }
        );

        console.log(`Response for file ${file.name}:`, response.data);

        if (response.data) {
          toast.success('File Uploaded');
          const newPdf = {
            file,
            preview: URL.createObjectURL(file),
            id: response.data,
          };
          updatedPdfList.push(newPdf);
        } else {
          console.error(`No ID received for file ${file.name}`);
        }
      } catch (error) {
        toast.error('File Upload failed');
        console.error(`Upload error for file ${file.name}:`, error);
      }
    }

    console.log(`Updated PDF list after upload:`, updatedPdfList);

    // update the state outside the loop
    setPdfList(updatedPdfList);
    setSelectedPdf(updatedPdfList[updatedPdfList.length - 1]);
    setUploadingPdf(false);
    setProcessingPdf(false);
    setMessages([]);
  };

  // Method to select a PDF
  const selectPdf = (pdf: any, clearMsg?: boolean) => {
    if (!pdf) return;
    if (clearMsg === undefined) clearMsg = true;

    if (context?.loading) {
      toast.error('Please wait for response');
      return;
    }
    // Revoke the URL of the currently-selected PDF, if there is one and clear the messages
    if (selectedPdf) {
      if (pdf.id === currentPdfId) {
        // If current selected pdf is selected again, return
        toast.error('This PDF is already selected!');
        return;
      }
      URL.revokeObjectURL(selectedPdf.preview);
      clearMsg && setMessages([]);
    }

    // Create a new object URL for the selected PDF
    const newPreview = URL.createObjectURL(pdf.file);

    // Update the preview for the selected PDF and set it as selected
    const newPdf = { ...pdf, preview: newPreview };
    setSelectedPdf(newPdf);
    setCurrentPdfId(pdf.id);

    // Update the preview in the pdfList
    const newPdfList = pdfList.map((p: any) =>
      p.file.name === pdf.file.name ? newPdf : p
    );
    setPdfList(newPdfList);

    // Run only for mobile view
    window.innerWidth < 768 && setCollapsed((prev: any) => !prev);
  };

  useEffect(() => {
    if (selectedPdf && selectedPdf.id !== currentPdfId) {
      const pdf = pdfList.filter((p: any) => p.id === currentPdfId); // Select pdf whose context is latest
      selectPdf(pdf[0], false); // Pass false so that even if pdf changes, history remains
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPdfId]);

  const logoutHandler = () => {
    removeCookie('access_token', { path: '/' });
    localStorage.clear();
    sessionStorage.clear();
    context?.setMessages([]);
    context?.setIsLoggedIn(false);
  };

  const deleteConversation = () => {
    const conversationId = sessionStorage.getItem('conversationId');
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/conversations/delete/${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${cookie['access_token']}`,
          },
        }
      )
      .then((res) => {
        getConversations();
        const newConversationId = uuidv4();
        sessionStorage.setItem('conversationId', newConversationId);
        setMessages([]);
      })
      .catch((err) => {
        console.log(err);
        toast.error('Could not delete the conversation!');
      });
  };

  const convChangeHandler = (conv: any) => {
    sessionStorage.setItem('conversationId', conv?.conversationId);
    axios
      .get(
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/user/chathistory/${sessionStorage.getItem('conversationId')}`,
        {
          headers: {
            Authorization: `Bearer ${cookie['access_token']}`,
          },
        }
      )
      .then((res) => {
        console.log('chathistory', res.data);
        const conversationId = sessionStorage.getItem('conversationId');
        const history = res?.data
          .filter(
            (item: any) =>
              conversationId === 'null' ||
              item.conversationId === conversationId
          )
          .flatMap((item: any) =>
            [
              item.query?.length && {
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
            ].filter(Boolean)
          );
        setMessages(history);
      })
      .catch((err) => {
        console.log(err);
        toast.error('Failed to load chat!');
      });
  };

  return (
    <div className={styles.main}>
      <Toaster position="top-center" reverseOrder={false} />
      <div>
        {/* <div className={styles.dropzone}>
          <Dropzone onDrop={onDrop}>
            {({ getRootProps, getInputProps }) => (
              <section>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  {!collapsed ? (
                    <>
                      <p>+ New Chat</p>
                      <span>Drop PDF here</span>
                    </>
                  ) : (
                    <p>+</p>
                  )}
                </div>
              </section>
            )}
          </Dropzone>
        </div> */}

        {username && <div className={styles.username}>Hi {username}!</div>}

        <div className={styles.pdflist}>
          {pdfList.map((pdf: any, i: number) => (
            <div
              style={{ padding: collapsed ? '10px 0' : '5px 2px' }}
              className={styles.pdfElement}
              key={i}
              onClick={() => selectPdf(pdf)}>
              <div
                className={styles.imageContainer}
                style={{ width: collapsed ? '100%' : '20%' }}>
                <Image src={messageIcon} alt="" width={25} height={25} />
              </div>
              <div className={styles.mobileView}>{pdf.file.name}</div>
              {!collapsed && (
                <div className={styles.pdfName}>{pdf.file.name}</div>
              )}
            </div>
          ))}
        </div>
        <div className={styles.chatList}>
          {conversations.length > 0 && (
            <div className={styles.chatHistoryTitle}>Previous chats</div>
          )}
          {conversations.map((conv: any, index: number) => {
            return (
              <>
                {/* @ts-ignore */}
                <div
                  className={styles.chatItem}
                  onClick={() => convChangeHandler(conv)}>
                  <p
                    style={{
                      flex:
                        sessionStorage.getItem('conversationId') ===
                        conv?.conversationId
                          ? 0.9
                          : 1,
                    }}>
                    {conv.query}
                  </p>
                  {sessionStorage.getItem('conversationId') ===
                    conv?.conversationId && (
                    <Image
                      src={deleteIcon}
                      alt="deleteIcon"
                      width={15}
                      height={15}
                      onClick={deleteConversation}
                    />
                  )}
                </div>
              </>
            );
          })}
        </div>
      </div>
      <div>
        <button className={styles.logout} onClick={logoutHandler}>
          Logout
        </button>
        {mobile && (
          <div className={styles.burgerIcon} onClick={handleToggleCollapse}>
            <BurgerIcon color="white" />
          </div>
        )}
        <div className={styles.logo}>
          <Image src={logo} alt="Samagra logo" layout="responsive" />
        </div>
      </div>
    </div>
  );
};

export default LeftSide;
