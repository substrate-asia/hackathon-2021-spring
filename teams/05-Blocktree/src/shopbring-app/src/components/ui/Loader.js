import React from "react";
import { Dimmer, Loader as SUILoader } from "semantic-ui-react";

const Loader = ({
  className,
  text = "Loading",
  timeout,
  timeoutText = "Process timeout",
}) => {
  return (
    <Dimmer inverted active className={className}>
      <SUILoader inverted>{text}</SUILoader>
    </Dimmer>
  );
};

export default Loader;
