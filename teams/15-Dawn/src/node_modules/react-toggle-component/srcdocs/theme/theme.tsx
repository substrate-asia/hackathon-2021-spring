import * as React from "react";
import styled from "styled-components";

export const DocsExample = styled.div`
  background-color: #fff;
  border: 1px solid #aaa;
  border-radius: 8px;
  margin: 16px auto;

  padding: 0 8px 8px;

  h1 {
    font-size: 20px;
    margin: 0 -8px;
    padding: 0 8px;
    border-radius: 7px 7px 0 0;
    background-color: #999;
    color: #fff;
  }

  button {
    padding: 8px 16px;
    border-radius: 3px;
    border: none;
    background-color: #80a5f4;
    color: #fff;
    margin: 0 8px;
    cursor: pointer;
    box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.69);

    &:active {
      background-color: #5e77bb;
      box-shadow: none;
    }
  }

  pre {
    font-size: 12px;
    display: block;
    background-color: #fff;
    color: #666;
    border-radius: 256px;
    padding: 3px 12px;
    margin: 16px 8px;
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.3);
  }
`;

export function CodeSandbox(id?: string) {
  const styles = {
    width: "100%",
    height: "500px",
    border: "0",
    borderRadius: "4px",
    overflow: "hidden",
  };

  return (
    <iframe
      src="https://codesandbox.io/embed/01nxypo6zl?fontsize=14"
      style={styles}
      sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
    ></iframe>
  );
}
