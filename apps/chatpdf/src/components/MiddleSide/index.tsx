import React, { useContext, useEffect } from 'react';
import styles from './index.module.css';
import { AppContext } from '../../context';
import {
  Worker,
  Viewer,
  ProgressBar,
  SpecialZoomLevel,
} from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { searchPlugin } from 'custom-pdf-search';
// import '@react-pdf-viewer/search_/lib/styles/index.css';
import { Spinner } from '@chakra-ui/react';

const MiddleSide = () => {
  const context = useContext(AppContext);
  const { selectedPdf, uploadingPdf, uploadProgress, processingPdf, keyword } =
    context;
  const newPlugin = defaultLayoutPlugin();
  console.log('hie', selectedPdf);

  const searchPluginInstance = searchPlugin();
  const { highlight } = searchPluginInstance;

  useEffect(() => {
    function splitStringsIntoChunks(stringsArray: string[]) {
      if(!stringsArray[0]) return [''];
      const result = [];

      for (let i = 0; i < stringsArray.length; i++) {
        const words = stringsArray[i].split(' ');
        let currentChunk: string[] = [];
        let upper_limit = 5;
        for (let j = 0; j < words.length - (words.length % upper_limit); j++) {
          if (currentChunk.length < upper_limit) {
            currentChunk.push(words[j].trim());
          } else {
            result.push(currentChunk.join(' '));
            currentChunk = [words[j].trim()];
          }
        }

        if (currentChunk.length > 0) {
          result.push(currentChunk.join(' '));
        }
      }

      return result;
    }
    console.log('keyword', splitStringsIntoChunks([keyword[0]]));
    console.log('keyword', keyword[0]);
    keyword &&
      highlight(splitStringsIntoChunks([keyword[0]]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  return (
    <div className={styles.main}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        {uploadingPdf ? (
          processingPdf ? (
            <div className={styles.noPdf}>
              {/* @ts-ignore */}
              <Spinner />
            </div>
          ) : (
            <div
              style={{
                width: '35vw',
                position: 'relative',
                top: '50%',
                margin: 'auto',
              }}>
              <ProgressBar progress={uploadProgress} />
            </div>
          )
        ) : selectedPdf && selectedPdf.preview ? (
          <>
            <Viewer
              defaultScale={SpecialZoomLevel.PageFit}
              plugins={[newPlugin, searchPluginInstance]}
              fileUrl={selectedPdf.preview}
              initialPage={0}
              renderLoader={(percentages: number) => (
                <div style={{ width: '35vw' }}>
                  <ProgressBar progress={Math.round(percentages)} />
                </div>
              )}
            />
          </>
        ) : (
          <div className={styles.noPdf}>No PDF</div>
        )}
      </Worker>
    </div>
  );
};

export default MiddleSide;
