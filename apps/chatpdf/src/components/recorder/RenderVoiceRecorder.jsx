import { useContext, useState, useEffect } from 'react';
import Image from 'next/image';
import stop from '../../assets/icons/stop.gif';
import start from '../../assets/icons/startIcon.svg';
import { Grid } from '@material-ui/core';
import styles from './styles.module.css';
import toast from 'react-hot-toast';
import { AppContext } from '../../context';
import { useLocalization } from '../../hooks';

const RenderVoiceRecorder = ({ setInputMsg }) => {
  const context = useContext(AppContext);
  const t = useLocalization();
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [apiCallStatus, setApiCallStatus] = useState('idle');

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          makeComputeAPICall(event.data);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
    } catch (error) {
      console.error(error);
      setApiCallStatus('error');
      toast.error(`${t('message.recorder_error')}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  };

  useEffect(() => {
    return () => {
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

  async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
  
      reader.onerror = (error) => {
        reject(error);
      };
  
      reader.readAsDataURL(blob);
    });
  }

  const makeComputeAPICall = async (blob) => {
    try {
      const base64 = await blobToBase64(blob);
      setApiCallStatus('processing');
      console.log('base', base64);
      toast.success(`${t('message.recorder_wait')}`);

      // Define the API endpoint
      const apiEndpoint = process.env.NEXT_PUBLIC_ASR_URL;
      const authorizationToken = process.env.NEXT_PUBLIC_ASR_AUTH_TOKEN;
      const locale = localStorage.getItem('locale');
      let language = 'en';

      if (locale === 'en') {
        language = 'en';
      } else if (locale === 'hi') {
        language = 'hi';
      }

      const requestData = {
        pipelineTasks: [
          {
            taskType: 'asr',
            config: {
              language: {
                sourceLanguage: language
              },
              serviceId: language === 'en' ? 'ai4bharat/whisper-medium-en--gpu--t4' : 'ai4bharat/conformer-hi-gpu--t4'
            }
          }
        ],
        inputData: {
          audio: [
            {
              audioContent: base64
            }
          ]
        }
      };

      // Send the WAV data to the API
      const resp = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': authorizationToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (resp.ok) {
        const rsp_data = await resp.json();
        console.log('hi', rsp_data);
        if (rsp_data.text === '')
          throw new Error('Unexpected end of JSON input');
        setInputMsg(rsp_data.text);
      } else {
        toast.error(`${t('message.recorder_error')}`);
        console.log(resp);
      }
      setApiCallStatus('idle');
    } catch (error) {
      console.error(error);
      setApiCallStatus('error');
      toast.error(`${t('message.recorder_error')}`);
    }
  };

  return (
    <div>
      <div>
        {mediaRecorder && mediaRecorder.state === 'recording' ? (
          <div className={styles.center}>
            <Image
              src={stop}
              alt="stopIcon"
              onClick={() => {
                stopRecording();
              }}
              style={{ cursor: 'pointer' }}
              layout="responsive"
            />
          </div>
        ) : (
          <div className={styles.center}>
            <Image
              src={start}
              alt="startIcon"
              onClick={() => startRecording()}
              style={{ cursor: 'pointer' }}
              layout="responsive"
            />
          </div>
        )}
      </div>
      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
        <Grid container spacing={1}>
          <Grid
            item
            xs={4}
            sm={12}
            md={2}
            lg={2}
            xl={2}
            className={styles.flexEndStyle}></Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default RenderVoiceRecorder;
