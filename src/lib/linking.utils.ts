import React from "react";
import { recordLinkClick } from "./linking-system.functions";

export interface AnchorMapping {
  keyword: string;
  target_url: string;
}

/**
 * Contextually injects internal links into raw text or HTML, avoiding already linked segments.
 */
export function injectInternalLinks(content: string, mappings: AnchorMapping[]): string {
  if (!content || !mappings || mappings.length === 0) return content;

  let result = content;

  // Sort keywords by length descending to match longer phrases first (e.g., "typing test" before "typing")
  const sortedMappings = [...mappings].sort((a, b) => b.keyword.length - a.keyword.length);

  for (const map of sortedMappings) {
    const escapedKeyword = map.keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    
    // Regex matches the keyword with word boundaries, making sure it isn't part of another word
    // and isn't already inside an HTML tag attribute or link tag
    // This is a robust positive lookahead/behind approximation in JS:
    // We check if the word is followed by an even number of quotes (meaning it's not inside an attribute)
    // and isn't already inside an <a> tag.
    const regex = new RegExp(`\\b(${escapedKeyword})\\b(?![^<]*>)(?![^<>]*<\\/a>)`, "gi");

    let matchCount = 0;
    result = result.replace(regex, (match) => {
      // Limit contextual links to max 2 occurrences per keyword to avoid excessive linking
      if (matchCount >= 2) return match;
      matchCount++;

      return `<a href="${map.target_url}" class="text-primary hover:underline font-medium transition-colors" data-internal-suggestion="true">${match}</a>`;
    });
  }

  return result;
}

/**
 * Utility to track clicks on any internal or external link.
 */
export async function trackClick(
  linkType: "internal" | "external",
  sourcePath: string,
  targetUrl: string,
  anchorText: string
) {
  try {
    await recordLinkClick({
      data: {
        link_type: linkType,
        source_path: sourcePath,
        target_url: targetUrl,
        anchor_text: anchorText.trim().slice(0, 100) || "link",
      }
    });
  } catch (e) {
    console.error("Failed to track link click:", e);
  }
}
