
import {
    createGlobalStyle
} from 'styled-components';

interface Colors {
    primary: string,
    normalFont: string
}
export function colors(): Colors {
    return {
        primary: '#2BC2DB',
        normalFont: '#333333'
    }
}
export const GlobalStyle = createGlobalStyle`
body {
  margin: 0;
  padding: 0;
  background: linear-gradient(#e0e2e4, #f3f5f7 75%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
  
code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
  
 a {
   color: var(--normal-font-color); 
   text-decoration: none;
 }

* {
  box-sizing: border-box;
}

ul,li{
    margin:0;
    padding:0;
}
li{
    list-style:none;
}

button {
  user-select: none;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
input[type="number"]{
  -moz-appearance: textfield;
}


html {
  font-size: 16px;
  font-variant: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  font-feature-settings: 'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on;
  
}
`