import React, { FunctionComponent } from "react";
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
    /**
     * Width of component
     */
    width?: string;
    /**
     * Height of component
     */
    height?: string;
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
declare const Toggle: FunctionComponent<Props>;
export { Toggle as ToggleProps };
declare const _default: React.ForwardRefExoticComponent<Props & React.RefAttributes<unknown>>;
export default _default;
