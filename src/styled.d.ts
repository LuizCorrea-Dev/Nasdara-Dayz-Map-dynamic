import 'styled-components';
import { AppTheme } from './theme/theme.types';

declare module 'styled-components' {
  export interface DefaultTheme extends AppTheme {}
}
