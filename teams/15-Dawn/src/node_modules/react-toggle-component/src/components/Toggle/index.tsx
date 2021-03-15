import React, { forwardRef, FunctionComponent, useRef } from "react";
import styled from "styled-components";
import defaultTheme from "../../theme/theme";

interface Props {
  /**
   * Addition CSS classes
   */
  className?: string;
  /**
   * Name of checkbox. You should alway assign a name
   *
   * @requires true
   */
  name?: string;
  /**
   * Value used when you'll post data
   *
   * @default
   */
  value?: string;
  /**
   * State of checked
   *
   * @default false
   */
  checked?: boolean;
  /**
   * Controls whether the checked prop is controlled (passed to the `checked` prop on input) or not (passed to the `defautlChecked` prop on input)
   *
   * @default false
   */
  controlled?: boolean;
  /**
   * Disable the toogle
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Trigged when the toggle change
   *
   * @param {React.ChangeEvent} e
   */
  onToggle?: (e: React.ChangeEvent) => void;
  /**
   * Trigged when the toggle is on the left.
   */
  onRight?: (e: React.ChangeEvent) => void;
  /**
   * Trigged when the toggle is on the right.
   */
  onLeft?: (e: React.ChangeEvent) => void;

  // ---------------------------------------------------------------
  // Appearance
  // ---------------------------------------------------------------

  /**
   * Width of component
   */
  width?: string;
  /**
   * Height of component
   */
  height?: string;

  // ---------------------------------------------------------------
  // Border
  // ---------------------------------------------------------------

  /**
   * Border width
   */
  borderWidth?: string;
  /**
   * Border color for both knob position. This props will override leftBorderColor and rightBorderColor props
   */
  borderColor?: string;
  /**
   * Border color when the knob is on the left (usually off)
   */
  leftBorderColor?: string;
  /**
   * Border color when the knob is on the right (usually on)
   */
  rightBorderColor?: string;

  // ---------------------------------------------------------------
  // Background color
  // ---------------------------------------------------------------

  /**
   * Background color for both knob position. This props will override leftBackgroundColor and rightBackgroundColor props
   */
  backgroundColor?: string;
  /**
   * Background color when the knob is on the left (usually off)
   */
  leftBackgroundColor?: string;
  /**
   * Background color when the knob is on the right (usually on)
   */
  rightBackgroundColor?: string;

  /**
   * Background color when the toggle is disabled
   */
  backgroundColorDisabled?: string;

  // ---------------------------------------------------------------
  // Radius
  // ---------------------------------------------------------------

  /**
   * Radius of container
   *
   */
  radius?: string;
  /**
   * Radius of gap
   */
  radiusBackground?: string;
  /**
   * Border radius of knob
   */
  knobRadius?: string;

  // ---------------------------------------------------------------
  // Knob
  // ---------------------------------------------------------------

  /**
   * Knob width
   */
  knobWidth?: string;
  /**
   * Knob height
   */
  knobHeight?: string;
  /**
   * Knob gap. It's the distance from the border/background
   */
  knobGap?: string;
  /**
   * Knob color for both knob position. This props will override the leftKnobColor and rightKnobColor
   */
  knobColor?: string;
  /**
   * Knob color when it's on the left (usually off)
   */
  leftKnobColor?: string;
  /**
   * Knob color when it's on the right (usually on)
   */
  rightKnobColor?: string;
}

const ToggleContainer = styled.label``;

const ToggleBase = styled.span<Props>`
  position: relative;
  box-sizing: border-box;
  display: inline-grid;
  align-items: center;
  width: ${p => p.width || (p.theme && p.theme.width) || defaultTheme.width};
  height: ${p => p.height || (p.theme && p.theme.height) || defaultTheme.height};
  vertical-align: middle;
  margin: 0 4px;

  input[type="checkbox"] {
    position: absolute;
    margin-left: -9999px;
    visibility: hidden;

    // off state
    & + label {
      display: inline-grid;
      box-sizing: border-box;
      align-items: center;
      outline: none;
      user-select: none;
      width: ${p => p.width || (p.theme && p.theme.width) || defaultTheme.width};
      height: ${p => p.height || (p.theme && p.theme.height) || defaultTheme.height};
      background-color: ${p =>
        p.borderColor || p.leftBorderColor || (p.theme && p.theme.leftBorderColor) || defaultTheme.leftBorderColor};
      border-radius: ${p => p.radius || (p.theme && p.theme.radius) || defaultTheme.radius};
      cursor: pointer;
      transition: background ease-out 0.3s;

      &:before {
        content: "";
        display: block;
        position: absolute;
        border-radius: ${p =>
          p.radiusBackground || (p.theme && p.theme.radiusBackground) || defaultTheme.radiusBackground};
        width: calc(
          ${p => p.width || (p.theme && p.theme.width) || defaultTheme.width} - 2 *
            ${p => p.borderWidth || (p.theme && p.theme.borderWidth) || defaultTheme.borderWidth}
        );
        height: calc(
          ${p => p.height || (p.theme && p.theme.height) || defaultTheme.height} - 2 *
            ${p => p.borderWidth || (p.theme && p.theme.borderWidth) || defaultTheme.borderWidth}
        );
        background-color: ${p =>
          p.backgroundColor ||
          p.leftBackgroundColor ||
          (p.theme && p.theme.leftBackgroundColor) ||
          defaultTheme.leftBackgroundColor};
        left: ${p => p.borderWidth || (p.theme && p.theme.borderWidth) || defaultTheme.borderWidth};
      }

      &:after {
        display: block;
        position: absolute;
        content: "";
        width: ${p => p.knobWidth || (p.theme && p.theme.knobWidth) || defaultTheme.knobWidth};
        height: ${p => p.knobHeight || (p.theme && p.theme.knobHeight) || defaultTheme.knobHeight};
        border-radius: ${p => p.knobRadius || (p.theme && p.theme.knobRadius) || defaultTheme.knobRadius};
        background-color: ${p =>
          p.knobColor || p.leftKnobColor || (p.theme && p.theme.leftKnobColor) || defaultTheme.leftKnobColor};
        transition: all ease-out 0.4s;
        margin-left: ${p => p.knobGap || (p.theme && p.theme.knobGap) || defaultTheme.knobGap};
      }
    }

    // on state
    &:checked {
      & + label {
        background-color: ${p =>
          p.borderColor ||
          p.rightBorderColor ||
          (p.theme && p.theme.rightBorderColor) ||
          defaultTheme.rightBorderColor};

        &:before {
          background-color: ${p =>
            p.backgroundColor ||
            p.rightBackgroundColor ||
            (p.theme && p.theme.rightBackgroundColor) ||
            defaultTheme.rightBackgroundColor};
        }

        &:after {
          margin-left: calc(
            100% - ${p => p.knobWidth || (p.theme && p.theme.knobWidth) || defaultTheme.knobWidth} -
              ${p => p.knobGap || (p.theme && p.theme.knobGap) || defaultTheme.knobGap}
          );
          transition: all ease-out 0.2s;
          background-color: ${p =>
            p.knobColor || p.rightKnobColor || (p.theme && p.theme.rightKnobColor) || defaultTheme.rightKnobColor};
        }
      }

      &:disabled {
        & + label {
          background-color: ${p =>
            p.backgroundColorDisabled ||
            (p.theme && p.theme.backgroundColorDisabled) ||
            defaultTheme.backgroundColorDisabled};
          &:after {
            box-shadow: none;
          }
        }
      }
    }

    // disabled
    &:disabled {
      & + label {
        background-color: ${p =>
          p.backgroundColorDisabled ||
          (p.theme && p.theme.backgroundColorDisabled) ||
          defaultTheme.backgroundColorDisabled};
        cursor: default;
        &:after {
          box-shadow: none;
          background-color: ${p =>
            p.backgroundColorDisabled ||
            (p.theme && p.theme.backgroundColorDisabled) ||
            defaultTheme.backgroundColorDisabled};
        }
      }
    }
  }
`;

const Toggle: FunctionComponent<Props> = (props, ref) => {
  const {
    className,
    name,
    checked = false,
    controlled = false,
    disabled = false,
    value = "",
    onToggle = () => true,
    onRight = () => true,
    onLeft = () => true,
    ...others
  } = props;

  const cls = ["react-toggle", className || ""].join(" ");

  const onChangeHandler = (e: React.ChangeEvent) => {
    if (!!onToggle) {
      onToggle(e);

      const target = e.target as HTMLInputElement;

      if (target && target.checked) {
        onRight(e);
      } else {
        onLeft(e);
      }
    }
  };

  const checkedProp = (controlled: boolean) => {
    return controlled ? { checked } : { defaultChecked: checked };
  };

  return (
    <ToggleBase className={cls} {...others}>
      <input
        ref={ref}
        onChange={onChangeHandler}
        type={"checkbox"}
        id={name}
        name={name}
        value={value}
        disabled={disabled}
        {...checkedProp(controlled)}
      />
      <ToggleContainer htmlFor={name} />
    </ToggleBase>
  );
};

export { Toggle as ToggleProps };
export default forwardRef(Toggle);
