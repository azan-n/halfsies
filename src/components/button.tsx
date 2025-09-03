"use client"
import clsx from "clsx"
import {
  Button as AriaButton,
  composeRenderProps,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components"

interface ButtonProps
  extends AriaButtonProps { }

export function Button({ className, ...props }: ButtonProps) {
  return (
    <AriaButton
      className={composeRenderProps(className, (className) =>
        clsx(
          "inline-flex items-center cursor-pointer justify-center whitespace-nowrap text-sm font-medium transition-colors",
          /* Disabled */
          "disabled-item",
          /* Focus Visible */
          "focusable-item",
          // 
          "hoverable-item",
          "border h-10 px-4 py-2",
          className,
        )
      )}
      {...props}
    />
  )
}
