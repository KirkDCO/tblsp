import { tagMappings } from './tagMappings.js';
import { TagModel } from '../models/Tag.js';
import type { TagSuggestion } from '../../../shared/types/tag.js';

export function suggestTags(
  title: string,
  ingredientsRaw: string,
  instructions: string
): TagSuggestion[] {
  const suggestions = new Map<string, { confidence: number; sources: string[] }>();

  // Combine all text for searching
  const titleLower = title.toLowerCase();
  const ingredientsLower = ingredientsRaw.toLowerCase();
  const instructionsLower = instructions.toLowerCase();
  const allText = `${titleLower} ${ingredientsLower} ${instructionsLower}`;

  // Search for keyword matches
  for (const [keyword, tagNames] of Object.entries(tagMappings)) {
    const keywordLower = keyword.toLowerCase();

    // Check where the keyword appears
    const inTitle = titleLower.includes(keywordLower);
    const inIngredients = ingredientsLower.includes(keywordLower);
    const inInstructions = instructionsLower.includes(keywordLower);

    if (inTitle || inIngredients || inInstructions) {
      for (const tagName of tagNames) {
        const existing = suggestions.get(tagName);
        const sources: string[] = [];

        if (inTitle) sources.push('title');
        if (inIngredients) sources.push('ingredients');
        if (inInstructions) sources.push('instructions');

        // Calculate confidence based on where it was found
        // Title matches are most confident, then ingredients, then instructions
        let confidence = 0;
        if (inTitle) confidence += 0.5;
        if (inIngredients) confidence += 0.3;
        if (inInstructions) confidence += 0.2;

        if (existing) {
          // Boost confidence if found in multiple places
          suggestions.set(tagName, {
            confidence: Math.min(1, existing.confidence + confidence * 0.5),
            sources: [...new Set([...existing.sources, ...sources])],
          });
        } else {
          suggestions.set(tagName, { confidence, sources });
        }
      }
    }
  }

  // Convert to array and sort by confidence
  const sortedSuggestions = Array.from(suggestions.entries())
    .sort((a, b) => b[1].confidence - a[1].confidence)
    .slice(0, 10); // Limit to top 10 suggestions

  // Look up existing tags
  const allTags = TagModel.findAll();
  const tagNameToId = new Map(allTags.map((t) => [t.name.toLowerCase(), t.id]));

  return sortedSuggestions.map(([name, { confidence }]) => ({
    name,
    confidence,
    existingTagId: tagNameToId.get(name.toLowerCase()) ?? null,
  }));
}
