import { createGlobalStyle } from 'styled-components';
import theme from './theme';

const GlobalStyle = createGlobalStyle`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans&display=swap');

body {
    /* background: radial-gradient(57.44% 57.44% at 50% 42.56%, #BBA0AE 0%, #164034 0.01%, rgba(25, 32, 37, 0.9) 63.49%); */
    /* background: linear-gradient(#0A0B27, #061026); */
    /* background: radial-gradient(52.49% 88.67% at 53.54% 53.67%, ${theme.colors.primary} 0%, ${theme.colors.primaryBackground} 70%); */
    /* background: ${theme.colors.primaryBackground}; */
    background: radial-gradient(52.49% 88.67% at 53.54% 53.67%, #473964 0%, #1D2C3B 100%);
    font-family: DM Sans, sans-serif;
}

`;

export default GlobalStyle;
