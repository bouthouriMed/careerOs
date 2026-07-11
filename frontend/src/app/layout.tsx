'use client';

import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { store } from '@/platform/api/rtk-query/store';
import { ThemeProvider } from '@/platform/design-system/theme/ThemeProvider';
import { i18n } from '@/platform/i18n/i18n';
import StyledComponentsRegistry from '@/platform/design-system/StyledComponentsRegistry';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={i18n.language} dir={dir} style={{ background: '#06080a' }}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, background: '#06080a', color: '#ffffff' }}>
        <StyledComponentsRegistry>
          <Provider store={store}>
            <ThemeProvider>
              <I18nextProvider i18n={i18n}>
                {children}
              </I18nextProvider>
            </ThemeProvider>
          </Provider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
