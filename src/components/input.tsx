import clsx from "clsx"
import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  Input as AriaInput,
  type InputProps as AriaInputProps,
  composeRenderProps,
} from "react-aria-components"

interface TextFieldProps extends AriaTextFieldProps {}

export function TextField({ className, ...props }: TextFieldProps) {
  return (
    <AriaTextField
      className={composeRenderProps(className, (className) =>
        clsx("group flex flex-row gap-2", className)
      )}
      {...props}
    />
  )
}

interface InputProps extends AriaInputProps {}

export function Input({ className, ...props }: InputProps) {
  return (
    <AriaInput
      className={composeRenderProps(className, (className) =>
        clsx(
          "flex h-12 w-full border border-border bg-background px-3 py-2 text-sm ring-offset-background",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )
      )}
      {...props}
    />
  )
}