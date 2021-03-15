import React from 'react';
import { FC, ReactElement, useEffect, useState } from 'react';

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
const ProgressR: FC<IProps> = ({ width, delay = 400 }): ReactElement => {
  const brickWidth = 6;
  const brickHeight = 4;
  const counts = Math.floor(width / (brickWidth * 2));
  const arr = (new Array(counts)).fill(true);
  // const active = useActiveFactory()(counts, delay);
  const [ active, setActive ] = useState<number>(0);

  useEffect(() => {
    console.log('set timer')
    const timer = setInterval(() => {
      let nextActive = active + 1;
      if (nextActive >= counts) {
        nextActive = 0;
      }
      console.log('active', active, 'next', nextActive, 'counts', counts)
      setActive(nextActive);
    }, delay);
    return () => {
      console.log('clear timer')
      clearInterval(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setActive, counts, delay]);

  return (
    <div style={{ textAlign: 'left' }}>
      {
        arr.map((t, index) =>
          <div key={index} style={{ backgroundColor: active === index ? 'rgb(247, 147, 26)' : 'rgb(231, 213, 192)', display: 'inline-block', marginRight: brickWidth, width: brickWidth, height: brickHeight }}></div>
        )
      }
    </div>
  )
}