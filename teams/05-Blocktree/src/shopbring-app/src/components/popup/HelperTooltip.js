import React from "react";
import { Icon, Popup } from "semantic-ui-react";

class HelperTooltip extends React.Component {
  render() {
    const { content } = this.props;

    return (
      <Popup
        className="question-popup"
        trigger={
          <span>
            <Icon className="question-circle" name="question circle" />
          </span>
        }
        content={content}
        hoverable={true}
      />
    );
  }
}

export default HelperTooltip;
