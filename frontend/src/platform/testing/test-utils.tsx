import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { I18nextProvider } from 'react-i18next';
import { store } from '@/platform/api/rtk-query/store';
import { lightTheme } from '@/platform/design-system/theme/light-theme';
import { i18n } from '@/platform/i18n/i18n';

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={lightTheme}>
        <I18nextProvider i18n={i18n}>
          {children}
        </I18nextProvider>
      </ThemeProvider>
    </Provider>
  );
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { customRender as render };
