import { shlokas } from './shlokas';
import { stories } from './stories';

// Emotion → shloka/story mapping for mock AI responses
const emotionMap = {
  anxiety: {
    primaryEmotion: 'anxiety',
    shlokaIds: [1, 4, 12],
    storyIds: [1],
    greeting: "I can sense the weight you're carrying. Let's breathe through this together.",
  },
  lost: {
    primaryEmotion: 'confusion',
    shlokaIds: [1, 3, 7],
    storyIds: [1],
    greeting: "Feeling lost is not a failure — it's the beginning of a genuine search.",
  },
  confused: {
    primaryEmotion: 'confusion',
    shlokaIds: [3, 6, 12],
    storyIds: [1, 4],
    greeting: "Confusion is the mind's way of saying it's ready to grow.",
  },
  angry: {
    primaryEmotion: 'anger',
    shlokaIds: [8, 5, 4],
    storyIds: [3],
    greeting: "Your anger is telling you something important. Let's listen to it with wisdom.",
  },
  sad: {
    primaryEmotion: 'grief',
    shlokaIds: [2, 4, 10],
    storyIds: [2, 6],
    greeting: "Grief is love with nowhere to go. The Gita holds space for this pain.",
  },
  afraid: {
    primaryEmotion: 'fear',
    shlokaIds: [9, 2, 7],
    storyIds: [4],
    greeting: "Fear is a messenger — not a verdict. Let's understand what it's saying.",
  },
  hopeless: {
    primaryEmotion: 'hopelessness',
    shlokaIds: [6, 10, 9],
    storyIds: [4, 2],
    greeting: "Even the darkest nights have preceded dawns throughout history.",
  },
  lonely: {
    primaryEmotion: 'loss',
    shlokaIds: [7, 9, 2],
    storyIds: [5, 8],
    greeting: "Loneliness can be a doorway to the deepest kind of self-knowing.",
  },
  overwhelmed: {
    primaryEmotion: 'anxiety',
    shlokaIds: [1, 11, 12],
    storyIds: [1],
    greeting: "One breath. One moment. The Gita was spoken in the middle of a battlefield.",
  },
  purpose: {
    primaryEmotion: 'purpose',
    shlokaIds: [6, 1, 7],
    storyIds: [7, 8],
    greeting: "The search for purpose is itself the most purposeful act.",
  },
  failure: {
    primaryEmotion: 'failure',
    shlokaIds: [1, 10, 12],
    storyIds: [8, 4],
    greeting: "Every great story has a chapter where the hero falls. You're in yours.",
  },
  betrayal: {
    primaryEmotion: 'injustice',
    shlokaIds: [6, 9, 5],
    storyIds: [5, 3],
    greeting: "When trust is broken, the Mahabharata speaks most clearly.",
  },
};

function detectEmotion(text) {
  const lower = text.toLowerCase();
  if (lower.includes('anxi') || lower.includes('stress') || lower.includes('nervous') || lower.includes('panic')) return 'anxiety';
  if (lower.includes('lost') || lower.includes('directionless') || lower.includes('aimless')) return 'lost';
  if (lower.includes('confus') || lower.includes("don't know") || lower.includes('unsure')) return 'confused';
  if (lower.includes('angry') || lower.includes('anger') || lower.includes('furious') || lower.includes('rage')) return 'angry';
  if (lower.includes('sad') || lower.includes('grief') || lower.includes('cry') || lower.includes('depress')) return 'sad';
  if (lower.includes('afraid') || lower.includes('fear') || lower.includes('scared') || lower.includes('terrified')) return 'afraid';
  if (lower.includes('hopeless') || lower.includes('no point') || lower.includes('give up') || lower.includes('pointless')) return 'hopeless';
  if (lower.includes('alone') || lower.includes('lonely') || lower.includes('isolated')) return 'lonely';
  if (lower.includes('overwhelm') || lower.includes('too much') || lower.includes('can\'t handle')) return 'overwhelmed';
  if (lower.includes('purpose') || lower.includes('meaning') || lower.includes('why am i')) return 'purpose';
  if (lower.includes('fail') || lower.includes('loser') || lower.includes('not good enough')) return 'failure';
  if (lower.includes('betray') || lower.includes('backstab') || lower.includes('hurt by')) return 'betrayal';
  return 'confused'; // default
}

export function getMockAIResponse(userInput, selectedEmotion) {
  const emotion = selectedEmotion || detectEmotion(userInput);
  const mapping = emotionMap[emotion] || emotionMap.confused;

  const primaryShloka = shlokas.find(s => s.id === mapping.shlokaIds[0]) || shlokas[0];
  const secondaryShloka = shlokas.find(s => s.id === mapping.shlokaIds[1]);
  const relatedStory = stories.find(s => s.id === mapping.storyIds[0]);

  return {
    greeting: mapping.greeting,
    detectedEmotion: mapping.primaryEmotion,
    shloka: primaryShloka,
    secondaryShloka: secondaryShloka,
    relatedStory: relatedStory,
    reflection: generateReflection(userInput, mapping.primaryEmotion),
    practicalSteps: [
      primaryShloka.practicalAdvice,
      `Take 5 minutes today to sit quietly and ask: "What do I actually need right now?" — not what you think you should feel, but what you genuinely need.`,
      "Write down one small, concrete action you can take today that aligns with what you know is right, regardless of how it turns out.",
    ],
  };
}

function generateReflection(input, emotion) {
  const reflections = {
    anxiety: "The Gita was literally delivered on a battlefield — to a man paralyzed by anxiety, in the middle of the most consequential moment of his life. You are in good company. The wisdom that helped Arjuna rise can help you find your ground.",
    confusion: "Confusion is not weakness — it's intellectual honesty. The Gita begins with Arjuna's honest admission that he doesn't know what to do. That admission was the doorway to 18 chapters of the deepest wisdom ever spoken.",
    anger: "The Gita doesn't tell you not to feel anger. It invites you to understand where anger comes from — attachment, expectation, the gap between what is and what you believed should be. Understanding the root changes everything.",
    grief: "The Gita speaks directly to Arjuna's grief — and validates it before it addresses it. Your grief is real. It honors something you loved. The question is whether you will let it be a passage or a permanent residence.",
    fear: "Fear protects you from genuine threats and tortures you about imagined ones. The Gita's medicine for fear is a clear understanding of what is actually true versus what the mind is projecting.",
    hopelessness: "Even in the darkest passages of the Mahabharata, the characters who endure are those who find one thing still worth doing. Not the whole answer — just the next right step.",
    loss: "Loneliness is the experience of feeling unseen. The Gita suggests that there is a witness to your life that is always present — call it consciousness, the divine, or simply your own deep self.",
    injustice: "The Mahabharata is, at its core, a story about a world where the wrong side has more power. And it doesn't pretend otherwise. But it also shows what it looks like to act with integrity anyway.",
    failure: "The Gita's most famous verse is about action without attachment to results. Not because results don't matter — but because they cannot be fully controlled. Your effort can.",
    purpose: "Purpose is not found — it is built, through consistent choices aligned with your deepest values. The Gita suggests: do your duty, wherever you are, as excellently as you can. Purpose follows that.",
  };
  return reflections[emotion] || reflections.confusion;
}

export function getMockJournalReflection(journalText) {
  const emotion = detectEmotion(journalText);
  const mapping = emotionMap[emotion] || emotionMap.confused;
  const shloka = shlokas.find(s => s.id === mapping.shlokaIds[0]) || shlokas[0];

  return {
    acknowledgment: `I've read what you've shared. There's ${mapping.primaryEmotion} woven through your words — and that's okay. This is a safe space for exactly this.`,
    shloka: shloka,
    reflection: generateReflection(journalText, mapping.primaryEmotion),
    question: generateJournalQuestion(mapping.primaryEmotion),
  };
}

function generateJournalQuestion(emotion) {
  const questions = {
    anxiety: "What is the worst realistic outcome you fear, and can you sit with it for one minute without trying to fix it?",
    confusion: "If you already knew the answer, what would you tell yourself?",
    anger: "What expectation was not met here, and was that expectation truly reasonable?",
    grief: "What does this loss say about what you love? How can you honor that love going forward?",
    fear: "What is the smallest step you could take that would reduce this fear by just 10%?",
    hopelessness: "Is there one person, place, or moment that still feels worth showing up for?",
    loss: "How would you treat a friend feeling exactly what you're feeling right now?",
    injustice: "What is within your control in this situation, even if it feels very small?",
    failure: "What did you learn that you couldn't have learned any other way?",
    purpose: "What activities make you lose track of time? What do those have in common?",
  };
  return questions[emotion] || questions.confusion;
}
