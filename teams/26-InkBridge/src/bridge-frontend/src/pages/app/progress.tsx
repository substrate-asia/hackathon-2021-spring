import React from 'react';

interface IProps {
  width: number;
  delay?: number;
}

export class Progress extends React.Component<IProps> {

  state = {
    active: 0,
  };
  timer: any;
  arr: boolean[];
  brickWidth = 6;

  constructor(props: IProps) {
    super(props);
    let { width, delay } = props;
    delay = delay || 100;
    const counts = Math.floor(width / (this.brickWidth * 2));
    this.arr = (new Array(counts)).fill(true);

    this.timer = setInterval(() => {
      let nextActive = this.state.active - 1;
      if (nextActive < 0) {
        nextActive = counts - 1;
      }
      this.setState({
        ...this.state,
        active: nextActive,
      });   
    }, delay);
  }

  componentWillUnmount() {
    this.timer && clearInterval(this.timer);
  }

  render() {
    return (
      <div style={{ textAlign: 'left' }}>
        {
          this.arr.map((t, index) =>
            <div key={index} style={{ backgroundColor: this.state.active === index ? 'rgb(247, 147, 26)' : 'rgb(231, 213, 192)', display: 'inline-block', marginRight: this.brickWidth, width: this.brickWidth, height: 4 }}></div>
          )
        }
      </div>
    );
  }
}
