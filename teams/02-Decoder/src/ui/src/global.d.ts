
declare module 'styled-components';
declare module 'react-router-dom';

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}