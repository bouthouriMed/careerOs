import 'styled-components';
import { Theme } from './theme/light-theme';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
