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
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import { Spinner } from '@chakra-ui/react';
import { isAndroid, isWindows, isMacOs } from 'react-device-detect';

const MiddleSide = () => {
  const context = useContext(AppContext);
  const { selectedPdf, uploadingPdf, uploadProgress, processingPdf, keyword } =
    context;
  const newPlugin = defaultLayoutPlugin({
    sidebarTabs(defaultTabs) {
      return [];
    },
  });
  const pageNavigationPluginInstance = pageNavigationPlugin();
  console.log('hie', selectedPdf);

  const searchPluginInstance = searchPlugin();
  const { highlight } = searchPluginInstance;
  const { jumpToPage } = pageNavigationPluginInstance;

  useEffect(() => {
    function splitStringsIntoChunks(stringsArray: string[]) {
      console.log('okie', stringsArray);
      if (!stringsArray[0] || stringsArray[0].length === 0) return [''];
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
    keyword &&
      keyword.content &&
      console.log(
        'keywordss',
        splitStringsIntoChunks([keyword?.content.replace(/\n/g, ' ')])
      );
    keyword && console.log('keywordss', keyword);
    keyword && console.log('keyword', keyword?.metaData?.startPage);
    keyword &&
      keyword.content &&
      highlight(splitStringsIntoChunks([keyword?.content.replace(/\n/g, ' ')]));
    keyword &&
      // keyword?.metaData?.startPage &&
      jumpToPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  return (
    <div className={`${styles.main} shadow-lg`}>
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
          <div
            style={{
              height: context?.showPdf ? '75vh' : '95vh',
              boxShadow:
                '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 23px -6px rgb(0 0 0 / 0.1)',
              padding: '10px',
              background: 'white',
            }}>
            <Viewer
              defaultScale={context?.showPdf ? SpecialZoomLevel.ActualSize : SpecialZoomLevel.PageWidth}
              plugins={[
                newPlugin,
                searchPluginInstance,
                pageNavigationPluginInstance,
              ]}
              fileUrl={selectedPdf.preview}
              initialPage={0}
              renderLoader={(percentages: number) => (
                <div style={{ width: '35vw' }}>
                  <ProgressBar progress={Math.round(percentages)} />
                </div>
              )}
            />
          </div>
        ) : (
          <div className={styles.noPdf}>No PDF</div>
        )}
      </Worker>
    </div>
  );
};

export default MiddleSide;
