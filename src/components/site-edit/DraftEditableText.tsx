import { createElement, useLayoutEffect, useRef, type HTMLAttributes } from "react";

/** Input-time updates with an unmanaged text node: React must not move the caret. */
export function DraftEditableText({ as = "span", value, onChange, disabled, ...props }: Omit<HTMLAttributes<HTMLElement>, "onChange" | "children"> & {
  as?: "span" | "h1" | "p";
  value: string;
  onChange: (text: string) => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && el.innerText !== value) el.innerText = value;
  }, [value]);
  return createElement(as, { ...props, ref, role: "textbox", contentEditable: disabled ? false : "plaintext-only", suppressContentEditableWarning: true,
    onInput: (event: React.FormEvent<HTMLElement>) => onChange(event.currentTarget.innerText),
  });
}
