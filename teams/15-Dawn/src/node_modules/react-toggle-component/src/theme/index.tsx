/**
 * Default theme provider.
 *
 */
import React, {FunctionComponent} from 'react';
import {ThemeProvider} from "styled-components";
import defaultTheme from "./theme";


interface Props {
  theme?:any;
  children?: React.ReactChild;
}

const ReactToggleThemeProvider: FunctionComponent<Props> = ({children,theme}) => <ThemeProvider theme={theme || defaultTheme}>
  {children}
</ThemeProvider>;

export default ReactToggleThemeProvider;