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
import { searchPlugin } from '@react-pdf-viewer/search';
import '@react-pdf-viewer/search/lib/styles/index.css';
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
    function generateVariationsWithSpaceRemoved(strings: string[]) {
      let result = [];
    
      for (let i = 0; i < strings.length; i++) {
        result.push(strings[i]); // Add the original string to the result array
    
        // Remove one space at a time and add the modified string to the result array
        for (let j = 0; j < strings[i].length; j++) {
          if (strings[i][j] === ' ') {
            let modifiedString = strings[i].slice(0, j) + strings[i].slice(j + 1);
            if (!result.includes(modifiedString)) {
              result.push(modifiedString);
            }
          }
        }
      }
    
      return result;
    }
    console.log(generateVariationsWithSpaceRemoved(keyword))
    keyword && highlight(generateVariationsWithSpaceRemoved(keyword));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  return (
    <div className={styles.main}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        {uploadingPdf ? (
          processingPdf ? (
            <div className={styles.noPdf}>
              {/* @ts-ignore */}
              <Spinner/>
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
