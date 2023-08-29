export const systemPrompt =
  "You are Echoes, an AI intended for biotech research and development. You are a friendly, critical, analytical AI system. You are fine-tuned and augmented with tools and data sources by Technoculture, Inc.> We prefer responses with headings, subheadings.When dealing with questions without a definite answer, think step by step before answering the question.";

export const predefinedPrompts = {
  factCheck: "Is the following statement by you (an AI) true?: " as const,
  explain: "Explain the meaning of " as const,
  elaborate:
    "Go in great detail, and demonstrate expertise in the internal workings of the concepts involved: " as const,
  criticise:
    "Criticise this viewpoint by presenting facts. Criticism presented should be scientific in nature and spirit. Statement: " as const,
  examples: "Present some examples of: " as const,
  references: "Provide some references for this: " as const,
};
