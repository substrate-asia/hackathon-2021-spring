import React, { Component } from "react";
import { Header, Button } from "semantic-ui-react";

const propTypes = {
  data: PT.array,
  selected: PT.string,
  handleSelect: PT.func,
};

class ProductTag extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: "",
    };
    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(id) {
    this.setState({
      current: id,
    });
  }

  render() {
    const { onSelect } = this;
    const { current } = this.state;
    const { title, data, selected, handleSelect } = this.props;

    const itemsBtn = data.map(function (item, index) {
      return (
        <Button
          as="li"
          key={index}
          className={current === item.id ? "selected" : ""}
          style={{
            backgroundImage: `url(${item.img}) !important`,
            backgroundSize: "cover !important",
          }}
          onClick={() => {
            if (handleSelect) handleSelect(item.id);
            onSelect(item.id);
          }}
        >
          {item.name}
        </Button>
      );
    });

    return (
      <div class="product-color">
        <Header as="h4">
          {title}: <span>{selected}</span>
        </Header>
        <Button.Group as="ul">{itemsBtn}</Button.Group>
      </div>
    );
  }
}

ProductTag.propTypes = propTypes;

export default ProductTag;
