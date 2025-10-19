"use client"
import clsx from "clsx"
import {
  Button as AriaButton,
  composeRenderProps,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components"

interface ButtonProps
  extends AriaButtonProps {
  variant?:  "outline" | "ghost"
}

export function Button({ className, variant, ...props }: ButtonProps) {
  return (
    <AriaButton
      className={composeRenderProps(className, (className) =>
        clsx(
          "btn",
          /* Variants */
          {
            "border border-border bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
            "hover:bg-accent hover:text-accent-foreground": variant === "ghost"
          },
          className,
        )
      )}
      {...props}
    />
  )
}
