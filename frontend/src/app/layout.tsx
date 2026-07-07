'use client';

import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { I18nextProvider } from 'react-i18next';
import { store } from '@/platform/api/rtk-query/store';
import { lightTheme } from '@/platform/design-system/theme/light-theme';
import { i18n } from '@/platform/i18n/i18n';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={i18n.language} dir={dir}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0 }}>
        <Provider store={store}>
          <ThemeProvider theme={lightTheme}>
            <I18nextProvider i18n={i18n}>
              {children}
            </I18nextProvider>
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}
