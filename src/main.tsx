import { createTheme, MantineProvider, Popover, Text, Tooltip } from '@mantine/core';
import { StrictMode } from 'react';
// @ts-ignore TODO: Check why importing from react-dom/client is marked as error.
import { createRoot } from 'react-dom/client';
import { Provider } from "react-redux";
import { BrowserRouter } from 'react-router';

import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { ActiveElementProvider } from 'context/useActiveElement.tsx';
import { KeyboardProvider } from 'context/useKeyboard.tsx';
import 'i18n';
import ImportDocumentModal from 'pages/map-editor/modals/ImportDocument.tsx';
import App from './App.tsx';
import { store } from './state/store.ts';

//import '@fontsource/alegreya/400-italic.css';
import '@fontsource/alegreya/400.css';
//import '@fontsource/alegreya/600-italic.css';
import '@fontsource/alegreya/600.css';
import '@fontsource/alegreya/700.css';
import { APP_BUILD } from 'Constants.ts';
import Local from 'Local.ts';

Local.setBuild(APP_BUILD);
console.info("Starting Yerevan. Build:", APP_BUILD);

const mantineTheme = createTheme({
  colors: {
    blue: [
      "var(--color-primary-l3)",
      "var(--color-primary-l3)",
      "var(--color-primary-l3)",
      "var(--color-primary-l3)",
      "var(--color-primary-l2)",
      "var(--color-primary-l1)",
      "var(--color-primary)",
      "var(--color-primary-d1)",
      "var(--color-primary-d2)",
      "var(--color-primary-d2)",
    ],
    gray: [
      "var(--color-gray-50)",
      "var(--color-gray-100)",
      "var(--color-gray-200)",
      "var(--color-gray-300)",
      "var(--color-gray-400)",
      "var(--color-gray-500)",
      "var(--color-gray-600)",
      "var(--color-gray-700)",
      "var(--color-gray-800)",
      "var(--color-gray-900)",
      "var(--color-gray-950)",
    ],
  },
  defaultRadius: 0,
  components: {
    TooltipFloating: Tooltip.Floating.extend({
      defaultProps: {
        position: 'top',
        zIndex: 100_000_000,
      }
    }),
    Tooltip: Tooltip.extend({
      defaultProps: {
        zIndex: 100_000_000,
      }
    }),
    Popover: Popover.extend({
      defaultProps: {
        zIndex: 100_000_000
      }
    }),
    Text: Text.extend({
      styles: {
        root: {
          wordBreak: 'break-all', // By default, Mantine only breaks at word boundaries.
        }
      }
    }),
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider
      theme={mantineTheme}
    >
    <BrowserRouter>
        
      <Provider store={store}>

        <KeyboardProvider>
        <ActiveElementProvider>

          <ModalsProvider
            modalProps={{
              transitionProps: {
                transition: 'fade',
                duration: 50,
              },
              centered: true
            }}
            modals={{
              importDocument: ImportDocumentModal,
            }}
          >

            <Notifications />

            <App />

          </ModalsProvider>
        
        </ActiveElementProvider>
        </KeyboardProvider>

      </Provider>

    </BrowserRouter>
    </MantineProvider>
  </StrictMode>,
)
