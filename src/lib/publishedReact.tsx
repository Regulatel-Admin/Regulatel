import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { localizePublishedText, publishedLanguage } from "@/lib/publishedContent";

/** Localizes public React copy without modifying handlers, identifiers or editor state. */
export function localizePublishedNode(node: ReactNode, language: string): ReactNode {
  if (publishedLanguage(language) === "es") return node;
  return Children.map(node, child => {
    if (typeof child === "string") return localizePublishedText(child, language);
    if (!isValidElement<Record<string, unknown>>(child)) return child;
    const props: Record<string, unknown> = {};
    for (const key of ["title", "alt", "aria-label", "placeholder"]) {
      if (typeof child.props[key] === "string") props[key] = localizePublishedText(child.props[key] as string, language);
    }
    if (child.props.children !== undefined) props.children = localizePublishedNode(child.props.children as ReactNode, language);
    return cloneElement(child, props);
  });
}
