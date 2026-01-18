import { cloneElement, isValidElement, ReactElement, ReactNode } from "react";

const GITHUB_ALERT_REGEX = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i;

type CalloutType =
  | "note"
  | "tip"
  | "important"
  | "warning"
  | "caution"
  | "default";

function getFirstTextNode(node: ReactNode): string | null {
  if (typeof node === "string") {
    // Skip whitespace-only strings
    if (node.trim().length === 0) return null;
    return node;
  }
  if (typeof node === "number") return String(node);
  if (!node) return null;

  if (Array.isArray(node)) {
    for (const child of node) {
      const text = getFirstTextNode(child);
      if (text !== null) return text;
    }
    return null;
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getFirstTextNode(node.props.children);
  }

  return null;
}

function removeAlertMarker(node: ReactNode, marker: RegExp): ReactNode {
  if (typeof node === "string") {
    // Skip whitespace-only strings
    if (node.trim().length === 0) return node;
    const replaced = node.replace(marker, "");
    return replaced !== node ? replaced : node;
  }

  if (Array.isArray(node)) {
    let markerRemoved = false;
    return node.map((child, index) => {
      if (!markerRemoved) {
        const result = removeAlertMarker(child, marker);
        if (result !== child) {
          markerRemoved = true;
          // If the result is a React element without a key, clone it with a key
          if (isValidElement(result) && result.key === null) {
            return cloneElement(result as ReactElement, {
              key: `alert-child-${index}`,
            });
          }
          return result;
        }
      }
      // Ensure existing elements have keys
      if (isValidElement(child) && child.key === null) {
        return cloneElement(child as ReactElement, {
          key: `alert-child-${index}`,
        });
      }
      return child;
    });
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    const newChildren = removeAlertMarker(node.props.children, marker);
    if (newChildren !== node.props.children) {
      // Clone the element with new children using React.cloneElement
      return cloneElement(node as ReactElement, {}, newChildren);
    }
  }

  return node;
}

export function parseGitHubAlert(children: ReactNode): {
  type: CalloutType;
  content: ReactNode;
} | null {
  // Get the first text content to check for the alert pattern
  const firstText = getFirstTextNode(children);
  if (!firstText) return null;

  const match = firstText.match(GITHUB_ALERT_REGEX);
  if (!match?.[1]) return null;

  const alertType = match[1].toLowerCase() as CalloutType;

  // Remove the alert marker from the content
  const content = removeAlertMarker(children, GITHUB_ALERT_REGEX);

  return {
    type: alertType,
    content,
  };
}
