import React from "react";
import { Menu, Button, Icon } from "semantic-ui-react";

import PopupLogin from "../popup/PopupLogin";
import PopupCart from "../popup/PopupCart";

const dataToolBtnsRight = [
  {
    title: "language",
    icon: "language",
    text: "ENGLISH",
  },
  {
    title: "currency",
    icon: "dollar",
    text: "USD",
  },
];

// Tool Button 工具栏按钮
const ToolBtn = (index, title, text, icon) => (
  <Button className="tool-btn" floated="right" tabIndex={index}>
    <Button.Content as="span">
      <Icon name={icon} /> {text}
    </Button.Content>
  </Button>
);

const Locale = (props) => {
  let itemsToolRight = dataToolBtnsRight.map(function (item, index) {
    let title = item.title
      .replace(/\-/g, " ")
      .replace(/^[a-z]?/, function ($0) {
        return $0.toUpperCase();
      });

    let popupWrap = null;

    let btnTool = ToolBtn(index, title, item.text, item.icon);
    popupWrap = btnTool;

    return (
      <Menu.Item key={index} as="li">
        {popupWrap}
      </Menu.Item>
    );
  });

  return <Menu.Menu as="ul">{itemsToolRight}</Menu.Menu>;
};

export default Locale;
