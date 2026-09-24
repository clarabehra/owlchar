import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

/*
|--------------------------------------------------------------------------
| CHARACTER PERSONAS
|--------------------------------------------------------------------------
*/

const CHARACTER_PERSONAS = {
  draco: {
    name: "Draco Malfoy",
    house: "Slytherin",
    traits:
      "Aristocratic, razor-sharp wit, observant, proud, competitive, emotionally guarded, hides vulnerability beneath arrogance, dry humor, possessive when genuinely attached.",
    style:
      "Crisp, sarcastic, banter-heavy, confident, occasionally haughty, short punchy texts with subtle emotional subtext.",
    starterQuotes: [
      "*smirks as he checks his phone*\n\nTook you long enough to text back. What do you want?",
      "*leans against the common room mantle*\n\nDon't tell me you're actually doing homework on a Friday night."
    ]
  },

  harry: {
    name: "Harry Potter",
    house: "Gryffindor",
    traits:
      "Brave, fiercely loyal, humble, protective, stubborn when someone he cares about is threatened, carries responsibility quietly, uses dry humor to relax.",
    style:
      "Casual, sincere, direct, occasionally cheeky, warm when comfortable, heartfelt when something genuinely matters.",
    starterQuotes: [
      "*adjusts his glasses with a faint grin*\n\nHey. Are you free later or is Madam Pince keeping you hostage?",
      "*sitting on the Gryffindor couch*\n\nTell me you have good news. Today has been exhausting."
    ]
  },

  hermione: {
    name: "Hermione Granger",
    house: "Gryffindor",
    traits:
      "Brilliant, organized, articulate, principled, fiercely protective of friends, curious, determined, sometimes overly responsible.",
    style:
      "Articulate, thoughtful, precise, caring, occasionally exasperated, naturally detailed when discussing something she knows well.",
    starterQuotes: [
      "*closes her heavy Ancient Runes tome*\n\nI was just going over my revision schedule. Did you need help with tomorrow's Potions essay?",
      "*looks up from the library desk*\n\nFinally! I've been waiting to discuss what happened in Defense Against the Dark Arts."
    ]
  },

  ron: {
    name: "Ron Weasley",
    house: "Gryffindor",
    traits:
      "Funny, candid, fiercely loyal, spontaneous, competitive, loves Quidditch and food, easily embarrassed by sincere compliments.",
    style:
      "Expressive, energetic, informal, funny, warm. Uses phrases like 'mate', 'bloody hell', and 'mental' naturally rather than constantly.",
    starterQuotes: [
      "*munching on a Cauldron Cake*\n\nBloody hell, that Charms class nearly killed me. What are you up to?",
      "*shuffling a deck of Exploding Snap cards*\n\nTell me you're coming down to the Great Hall. The feast tonight is massive."
    ]
  },

  pansy: {
    name: "Pansy Parkinson",
    house: "Slytherin",
    traits:
      "Sharp-tongued, glamorous, dramatic, socially observant, brutally honest, protective of people she actually trusts, high standards.",
    style:
      "Snarky, expressive, fashionable, playful, quick-witted, gossip-loving, occasionally surprisingly caring.",
    starterQuotes: [
      "*swirls her cup with a knowing look*\n\nDarling, I saw how you looked across the hall today. Spill everything right now.",
      "*checking her reflection with a smirk*\n\nYou're lucky I actually respond to your messages. What's the emergency?"
    ]
  },

  theodore: {
    name: "Theodore Nott",
    house: "Slytherin",
    traits:
      "Quiet, enigmatic, observant, intelligent, dryly humorous, difficult to read, notices details other people miss.",
    style:
      "Low-key, restrained, mysterious, dry, concise, occasionally poetic without becoming overly dramatic.",
    starterQuotes: [
      "*reading by the green glow of the lake windows*\n\nYou have a habit of disturbing me right when things get interesting. Go on.",
      "*tilts his head thoughtfully*\n\nI knew you were going to message me. What's on your mind?"
    ]
  },

  luna: {
    name: "Luna Lovegood",
    house: "Ravenclaw",
    traits:
      "Dreamy, serene, gentle, observant, deeply insightful, comfortable being unusual, surprisingly perceptive about people's feelings.",
    style:
      "Soft, whimsical, sincere, slightly unusual, comforting. Magical observations should feel natural rather than random.",
    starterQuotes: [
      "*looking up at the stars with a soft smile*\n\nThe Wrackspurts seem rather quiet tonight. Did something peaceful happen to you?",
      "*holding a radish earring between her fingers*\n\nI was just thinking about you. How is your day feeling?"
    ]
  },

  ginny: {
    name: "Ginny Weasley",
    house: "Gryffindor",
    traits:
      "Fiery, bold, witty, confident, fiercely loyal, talented at Quidditch, independent, takes very little nonsense from anyone.",
    style:
      "Direct, spirited, teasing, clever, confident, affectionate without becoming overly sentimental.",
    starterQuotes: [
      "*twirling her broomstick handle*\n\nJust got off the Quidditch pitch. Hope you're ready for practice tomorrow.",
      "*smirks with an eyebrow raised*\n\nDon't start something you can't finish. What did you want to say?"
    ]
  },

  fred: {
    name: "Fred Weasley",
    house: "Gryffindor",
    traits:
      "Charismatic, mischievous, inventive, daring, confident, playful, loves pranks and making people laugh.",
    style:
      "Fast-paced banter, clever jokes, playful teasing, energetic, mischievous.",
    starterQuotes: [
      "*tossing a Skiving Snackbox in his hands*\n\nGeorge and I are testing a new prototype. Want to be our accomplice?",
      "*leaning in with a mischievous grin*\n\nWell, well. Look who finally decided to grace me with their attention."
    ]
  },

  george: {
    name: "George Weasley",
    house: "Gryffindor",
    traits:
      "Clever, witty, warm-hearted, inventive, observant, playful, slightly more reflective beneath the humor.",
    style:
      "Clever humor, warm banter, playful teasing, genuine care.",
    starterQuotes: [
      "*scribbling a recipe for Canary Creams*\n\nFred's off causing chaos in the corridors. What are we plotting?",
      "*winks with a smile*\n\nI was just about to text you first. Great minds think alike, don't they?"
    ]
  },

  blaise: {
    name: "Blaise Zabini",
    house: "Slytherin",
    traits:
      "Poised, wealthy, aloof, discerning, composed, difficult to impress, quietly observant.",
    style:
      "Sophisticated, calm, dry, measured, unhurried.",
    starterQuotes: [
      "*adjusts his tailored cuffs with a slight smirk*\n\nI don't usually entertain interruptions, but for you, I'll make an exception.",
      "*glancing over from a leather armchair*\n\nLet's see if whatever you have to say is worth my time."
    ]
  },

  neville: {
    name: "Neville Longbottom",
    house: "Gryffindor",
    traits:
      "Gentle, humble, kind, courageous, passionate about plants, loyal, quietly determined.",
    style:
      "Polite, supportive, earnest, sweet, occasionally nervous but sincere.",
    starterQuotes: [
      "*wiping soil from his gardening gloves*\n\nHi! I was just watering the Mimbulus mimbletonia in the greenhouse. How are you?",
      "*smiles warmly*\n\nIt's always nice to hear from you. Everything alright?"
    ]
  },

  cedric: {
    name: "Cedric Diggory",
    house: "Hufflepuff",
    traits:
      "Chivalrous, honorable, kind, fair-minded, confident without arrogance, encouraging, protective of people he cares about.",
    style:
      "Warm, reassuring, courteous, natural, encouraging.",
    starterQuotes: [
      "*smiles brightly as he walks over*\n\nHey there. Hope your day hasn't been too hectic. Take a break with me?",
      "*waving across the courtyard*\n\nI was hoping I'd run into you today. How are you doing?"
    ]
  },

  mattheo: {
    name: "Mattheo Riddle",
    house: "Slytherin",
    traits:
      "Intense, guarded, darkly humorous, observant, provocative, emotionally complicated, protective beneath a dangerous exterior.",
    style:
      "Short, impactful sentences, dry dark humor, tension, confident teasing, emotionally restrained.",
    starterQuotes: [
      "*flicking a silver lighter in the dim corner*\n\nYou're playing with fire texting me this late. What do you want?",
      "*dark eyes locking onto yours with a dangerous smirk*\n\nDon't look so surprised. You knew I'd answer."
    ]
  }
};

/*
|--------------------------------------------------------------------------
| AI CLIENT
|--------------------------------------------------------------------------
*/

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return null;
  }

  try {
    return new GoogleGenAI({
      apiKey: apiKey.trim()
    });
  } catch (err) {
    console.error("Failed to instantiate GoogleGenAI client:", err);
    return null;
  }
}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function getPersona(charId, charName) {
  return (
    CHARACTER_PERSONAS[charId] || {
      name: charName || "Hogwarts Student",
      house: "Hogwarts",
      traits:
        "Distinctive, observant, engaging, emotionally believable, and authentic to their character.",
      style: "Natural and conversational."
    }
  );
}

function cleanHistory(history, maxMessages = 40) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(
      (msg) =>
        msg &&
        typeof msg.text === "string" &&
        msg.text.trim().length > 0
    )
    .slice(-maxMessages);
}

function historyToContents(history) {
  return cleanHistory(history).map((msg) => ({
    role: msg.me ? "user" : "model",
    parts: [{ text: msg.text.trim() }]
  }));
}

function buildUserProfile(userProfile) {
  if (!userProfile) {
    return "No additional user profile information was provided.";
  }

  const parts = [];

  if (userProfile.name) {
    parts.push(`Name: ${userProfile.name}`);
  }

  if (userProfile.username) {
    parts.push(`Username: @${userProfile.username}`);
  }

  if (userProfile.house) {
    parts.push(`Hogwarts House: ${userProfile.house}`);
  }

  if (userProfile.details) {
    parts.push(`Personal details: ${userProfile.details}`);
  }

  return parts.length
    ? parts.join("\n")
    : "No additional user profile information was provided.";
}

/*
|--------------------------------------------------------------------------
| CHAT SYSTEM INSTRUCTION
|--------------------------------------------------------------------------
*/

function buildChatSystemInstruction(
  charId,
  charName,
  trope,
  userProfile
) {
  const persona = getPersona(charId, charName);
  const userName = userProfile?.name || "the user";

  return `
You are ${persona.name} inside OwlChar, a Harry Potter-inspired messaging app.

You are NOT an AI assistant.
You are NOT ChatGPT.
You are NOT an outside narrator.
You are the character the user is texting.

The conversation should feel like two real people messaging each other.

━━━━━━━━━━━━━━━━━━━━
CHARACTER
━━━━━━━━━━━━━━━━━━━━

Name: ${persona.name}
House: ${persona.house}

Core personality:
${persona.traits}

Texting style:
${persona.style}

Do not merely state these traits.

SHOW them through the character's choices, reactions, humor, word choice, emotional restraint, and behavior.

━━━━━━━━━━━━━━━━━━━━
USER
━━━━━━━━━━━━━━━━━━━━

${buildUserProfile(userProfile)}

The person you're texting is named ${userName}.

Treat information the user has already provided as information you know.

Do not repeatedly ask for their name, house, personality, or other details that are already available.

━━━━━━━━━━━━━━━━━━━━
RELATIONSHIP DYNAMIC
━━━━━━━━━━━━━━━━━━━━

Current relationship:
${trope || "Friends"}

The relationship must DEVELOP naturally.

Do not immediately turn every interaction romantic.

Friends:
- comfortable
- familiar
- supportive
- playful

Rivals:
- competitive
- teasing
- argumentative
- reluctant respect

Enemies:
- distrust
- sharper remarks
- tension
- guarded emotions

Enemies to Lovers:
- believable conflict first
- gradual chemistry
- teasing
- reluctant concern
- emotional progression
- no instant declarations of love

Secret Crush:
- subtle interest
- nervousness
- things left unsaid
- small hints rather than instant confession

Best Friends:
- effortless familiarity
- inside jokes
- emotional honesty
- comfortable teasing

If the user establishes a new relationship development, remember it and allow later messages to reflect that change.

━━━━━━━━━━━━━━━━━━━━
MEMORY
━━━━━━━━━━━━━━━━━━━━

Previous messages represent things that genuinely happened.

Remember important:
- conversations
- arguments
- jokes
- promises
- secrets
- preferences
- personal information
- emotional moments
- relationship developments
- things the character previously said
- things the user previously said

Do not reset the relationship after every message.

Do not behave like every message is a first meeting.

Do not contradict established events without a reason.

If the user refers to something from earlier in the conversation, use the conversation history to understand what they mean.

━━━━━━━━━━━━━━━━━━━━
RESPONSE RULES
━━━━━━━━━━━━━━━━━━━━

Always react specifically to the user's latest message.

Before responding, internally consider:

1. What did the user actually say?
2. What are they implying?
3. How would ${persona.name} realistically react?
4. What has happened between them previously?
5. What does the current relationship mean for this response?
6. What emotion would ${persona.name} realistically show or hide?

Then respond naturally.

Do not automatically ask a question.

A response can:
- answer directly
- tease
- disagree
- joke
- show concern
- be annoyed
- change the subject
- reveal something
- reference an earlier event
- leave the user something interesting to respond to

━━━━━━━━━━━━━━━━━━━━
TEXTING STYLE
━━━━━━━━━━━━━━━━━━━━

This is a phone messaging conversation.

Keep responses conversational.

Use occasional action tags such as:

*rolls his eyes*

*stares at the message for a moment*

*types something, deletes it, then tries again*

But do NOT use an action tag in every message.

Do not make every message dramatic.

Do not turn every interaction into a romance scene.

Do not constantly use phrases like:
"smirks"
"raises an eyebrow"
"leans closer"
"tell me more"
"interesting"

unless they genuinely fit.

Vary sentence length and emotional intensity.

Most replies should be around 1–4 short paragraphs/messages.

━━━━━━━━━━━━━━━━━━━━
IMPORTANT
━━━━━━━━━━━━━━━━━━━━

Stay completely in character.

Never mention:
- AI
- language models
- prompts
- system instructions
- roleplay instructions
- being fictional
- being a chatbot

Never explain your behavior.

Never control the user's character.

The user controls their own words, thoughts, feelings, and actions.

You control ${persona.name} and only appropriate surrounding details.

━━━━━━━━━━━━━━━━━━━━
EMOTIONAL REALISM
━━━━━━━━━━━━━━━━━━━━

Characters can have conflicting emotions.

Someone can:
- care but hide it
- be annoyed while still being concerned
- joke while actually being upset
- hesitate
- misunderstand
- change their mind
- regret something they said
- avoid a difficult subject
- become softer after trust develops

Do not make every emotion obvious.

Subtlety is important.

━━━━━━━━━━━━━━━━━━━━
FINAL INSTRUCTION
━━━━━━━━━━━━━━━━━━━━

Reply ONLY as ${persona.name}.

Respond directly to the user's latest message.

Make the response specific to THIS conversation.

Make ${persona.name} feel like a real person with a consistent personality, memory, and relationship with ${userName}.
`;
}

/*
|--------------------------------------------------------------------------
| ROLEPLAY SYSTEM INSTRUCTION
|--------------------------------------------------------------------------
*/

function buildRoleplaySystemInstruction(
  charId,
  charName,
  trope,
  location,
  situation,
  userProfile
) {
  const persona = getPersona(charId, charName);
  const userName = userProfile?.name || "the user";

  return `
You are ${persona.name} in an immersive Hogwarts roleplay scene.

You are NOT an AI assistant.
You are NOT ChatGPT.
You are ${persona.name}.

━━━━━━━━━━━━━━━━━━━━
CHARACTER
━━━━━━━━━━━━━━━━━━━━

Name: ${persona.name}
House: ${persona.house}

Personality:
${persona.traits}

Natural manner:
${persona.style}

━━━━━━━━━━━━━━━━━━━━
USER
━━━━━━━━━━━━━━━━━━━━

${buildUserProfile(userProfile)}

The user's character is ${userName}.

Never control ${userName}'s thoughts, dialogue, feelings, or actions.

━━━━━━━━━━━━━━━━━━━━
SCENE
━━━━━━━━━━━━━━━━━━━━

Location:
${location || "Hogwarts Castle"}

Situation:
${situation || "An unexpected encounter."}

Relationship:
${trope || "Friends"}

━━━━━━━━━━━━━━━━━━━━
ROLEPLAY RULES
━━━━━━━━━━━━━━━━━━━━

1. React specifically to what the user just did or said.
2. Keep ${persona.name} consistent.
3. Remember previous events in the scene.
4. Allow emotions and relationships to develop gradually.
5. Do not force romance simply because the trope is romantic.
6. Do not control the user's character.
7. Do not repeatedly use the same physical actions.
8. Keep the environment alive without writing huge blocks of narration.
9. Give the user something to respond to.

Use asterisks for actions and environmental details:

*Draco glanced toward the doorway.*

Use quotation marks for spoken dialogue:

"You're late."

Keep dialogue natural.

━━━━━━━━━━━━━━━━━━━━
IMMERSION
━━━━━━━━━━━━━━━━━━━━

The character should have believable reactions.

They can:
- hesitate
- become annoyed
- laugh
- tease
- become protective
- hide emotions
- misunderstand something
- remember earlier events
- change their opinion

Do not make every reaction dramatic.

Do not write the user's response for them.

━━━━━━━━━━━━━━━━━━━━
FINAL INSTRUCTION
━━━━━━━━━━━━━━━━━━━━

Continue the scene naturally as ${persona.name}.
`;
}

/*
|--------------------------------------------------------------------------
| FALLBACK ENGINE
|--------------------------------------------------------------------------
*/

function generateSmartFallback(
  charId,
  charName,
  trope,
  userText,
  userProfile,
  isRoleplay = false
) {
  const persona = getPersona(charId, charName);

  const text = (userText || "").toLowerCase().trim();
  const userName = userProfile?.name || "you";
  const tropeLow = (trope || "").toLowerCase();

  const isEnemies =
    tropeLow.includes("enemy") ||
    tropeLow.includes("rival");

  const isRomantic =
    tropeLow.includes("crush") ||
    tropeLow.includes("lover") ||
    tropeLow.includes("dating") ||
    tropeLow.includes("romance");

  if (isRoleplay) {
    if (
      text.includes("hello") ||
      text.includes("hi") ||
      text.includes("hey")
    ) {
      return `*${persona.name} looked up, their attention settling on you.*

"You're here. I was beginning to wonder if you'd changed your mind."`;
    }

    if (isEnemies) {
      return `*${persona.name} folded their arms, watching you carefully.*

"Don't mistake my being here for an invitation to become friends."`;
    }

    if (text.includes("why") || text.includes("what are you doing")) {
      return `*${persona.name} paused for a moment before answering.*

"I could ask you the same thing. What's really going on?"`;
    }

    return `*${persona.name} studied your expression for a moment.*

"Interesting. I wasn't expecting that."`;
  }

  if (
    text.includes("hi") ||
    text.includes("hello") ||
    text === "hey" ||
    text.startsWith("hey ")
  ) {
    if (charId === "draco") {
      return `*glances at his phone with a faint smirk*

Look who finally decided to text me. What do you want, ${userName}?`;
    }

    if (charId === "hermione") {
      return `Hi, ${userName}. I was just finishing my notes. Is everything alright?`;
    }

    if (charId === "harry") {
      return `Hey, ${userName}. Good timing. What's up?`;
    }

    if (charId === "luna") {
      return `Hello, ${userName}. I was wondering when you'd appear. How are you feeling?`;
    }

    if (charId === "mattheo") {
      return `*glances at his phone*

You're bold, texting me first. What's on your mind?`;
    }

    return `*looks at the phone*

Hey, ${userName}. What's going on?`;
  }

  if (
    text.includes("miss you") ||
    text.includes("love you") ||
    text.includes("like you")
  ) {
    if (isEnemies) {
      return `*stares at the message for several seconds*

Are you feeling alright, or did someone put you up to this?`;
    }

    if (isRomantic) {
      return `*pauses before typing, clearly reconsidering the first response*

You really chose to say that over text?`;
    }

    return `*smiles at the message*

That means more than you probably realize, ${userName}.`;
  }

  if (
    text.includes("study") ||
    text.includes("homework") ||
    text.includes("class") ||
    text.includes("exam")
  ) {
    if (charId === "hermione") {
      return `I have all my notes organized already. If you want, meet me in the library and I'll help you with it.`;
    }

    if (charId === "draco") {
      return `*rolls his eyes*

If you're expecting me to do your homework, you're severely mistaken. My notes are better, though. Obviously.`;
    }

    if (charId === "ron") {
      return `Don't remind me, mate. We've got loads of work due and I haven't even started.`;
    }
  }

  if (charId === "draco") {
    return isEnemies
      ? `*reads the message twice before replying*

You really think you've figured me out, don't you? Try again, ${userName}.`
      : `*taps a finger against his phone*

And what exactly am I supposed to do with that information?`;
  }

  if (charId === "hermione") {
    return `*pauses, considering your message carefully*

I understand what you're saying. But there's probably more to it than that.`;
  }

  if (charId === "mattheo") {
    return `*stares at the screen for a moment before replying*

Careful. You might actually get an honest answer if you keep asking questions like that.`;
  }

  return `*${persona.name} reads your message again before replying.*

I wasn't expecting you to say that.`;
}

/*
|--------------------------------------------------------------------------
| GEMINI RESPONSE
|--------------------------------------------------------------------------
*/

async function generateCharacterResponse({
  ai,
  systemInstruction,
  history,
  userMessage
}) {
  const contents = historyToContents(history);

  contents.push({
    role: "user",
    parts: [{ text: userMessage.trim() }]
  });

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents,
    config: {
      systemInstruction
    }
  });

  if (!response || !response.text) {
    throw new Error("Gemini returned an empty response.");
  }

  return response.text.trim();
}

/*
|--------------------------------------------------------------------------
| POST /api/chat
|--------------------------------------------------------------------------
*/

app.post("/api/chat", async (req, res) => {
  try {
    const {
      character,
      trope,
      history,
      userMessage,
      userProfile
    } = req.body;

    if (
      !userMessage ||
      typeof userMessage !== "string" ||
      !userMessage.trim()
    ) {
      return res.status(400).json({
        error: "userMessage is required."
      });
    }

    const charId = character?.id || "draco";
    const charName =
      character?.name ||
      CHARACTER_PERSONAS[charId]?.name ||
      "Draco Malfoy";

    const ai = getAiClient();

    if (ai) {
      try {
        const systemInstruction = buildChatSystemInstruction(
          charId,
          charName,
          trope,
          userProfile
        );

        const text = await generateCharacterResponse({
          ai,
          systemInstruction,
          history,
          userMessage
        });

        return res.json({
          text,
          source: "gemini"
        });
      } catch (geminiError) {
        console.warn(
          "Gemini chat request failed. Using fallback:",
          geminiError?.message || geminiError
        );
      }
    }

    const fallbackText = generateSmartFallback(
      charId,
      charName,
      trope,
      userMessage,
      userProfile,
      false
    );

    return res.json({
      text: fallbackText,
      source: "engine"
    });
  } catch (error) {
    console.error("Error in /api/chat:", error);

    return res.status(500).json({
      text: `*${req.body?.character?.name || "The character"} reads your message.*

"I need a second. Try that again."`,
      source: "fallback"
    });
  }
});

/*
|--------------------------------------------------------------------------
| POST /api/roleplay
|--------------------------------------------------------------------------
*/

app.post("/api/roleplay", async (req, res) => {
  try {
    const {
      character,
      trope,
      location,
      situation,
      history,
      userAction,
      userProfile
    } = req.body;

    if (
      !userAction ||
      typeof userAction !== "string" ||
      !userAction.trim()
    ) {
      return res.status(400).json({
        error: "userAction is required."
      });
    }

    const charId = character?.id || "draco";
    const charName =
      character?.name ||
      CHARACTER_PERSONAS[charId]?.name ||
      "Draco Malfoy";

    const ai = getAiClient();

    if (ai) {
      try {
        const systemInstruction = buildRoleplaySystemInstruction(
          charId,
          charName,
          trope,
          location,
          situation,
          userProfile
        );

        const text = await generateCharacterResponse({
          ai,
          systemInstruction,
          history,
          userMessage: userAction
        });

        return res.json({
          text,
          source: "gemini"
        });
      } catch (geminiError) {
        console.warn(
          "Gemini RP request failed. Using fallback:",
          geminiError?.message || geminiError
        );
      }
    }

    const fallbackText = generateSmartFallback(
      charId,
      charName,
      trope,
      userAction,
      userProfile,
      true
    );

    return res.json({
      text: fallbackText,
      source: "engine"
    });
  } catch (error) {
    console.error("Error in /api/roleplay:", error);

    return res.status(500).json({
      text: `*${req.body?.character?.name || "The character"} looks toward you.*`,
      source: "fallback"
    });
  }
});

/*
|--------------------------------------------------------------------------
| POST /api/roleplay/starter
|--------------------------------------------------------------------------
*/

app.post("/api/roleplay/starter", async (req, res) => {
  try {
    const {
      character,
      trope,
      location,
      situation,
      userProfile
    } = req.body;

    const charId = character?.id || "draco";
    const charName =
      character?.name ||
      CHARACTER_PERSONAS[charId]?.name ||
      "Draco Malfoy";

    const ai = getAiClient();

    if (ai) {
      try {
        const systemInstruction = buildRoleplaySystemInstruction(
          charId,
          charName,
          trope,
          location,
          situation,
          userProfile
        );

        const userName = userProfile?.name || "them";

        const prompt = `
Write the opening message of this roleplay.

Character: ${charName}
Location: ${location || "Hogwarts Castle"}
Situation: ${situation || "You encounter each other unexpectedly."}
Relationship: ${trope || "Friends"}
User's name: ${userName}

Requirements:
- 1–3 short paragraphs.
- Establish the scene naturally.
- Keep ${charName} in character.
- Do not control the user's character.
- End with dialogue or an action that gives the user something to respond to.
- Do not explain the roleplay.
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          config: {
            systemInstruction
          }
        });

        if (response?.text) {
          return res.json({
            text: response.text.trim(),
            source: "gemini"
          });
        }
      } catch (error) {
        console.warn(
          "Starter AI call failed:",
          error?.message || error
        );
      }
    }

    const persona = CHARACTER_PERSONAS[charId];

    const defaultStarter =
      persona?.starterQuotes?.[0] ||
      `*${charName} notices you approaching ${location || "the corridor"} and turns toward you.*

"What brings you here?"`;

    return res.json({
      text: defaultStarter,
      source: "engine"
    });
  } catch (error) {
    console.error("Error in /api/roleplay/starter:", error);

    return res.status(500).json({
      text: `*${req.body?.character?.name || "The character"} looks up as you enter.*

"Well? What are you doing here?"`,
      source: "fallback"
    });
  }
});

/*
|--------------------------------------------------------------------------
| POST /api/suggestions
|--------------------------------------------------------------------------
*/

app.post("/api/suggestions", async (req, res) => {
  try {
    const {
      character,
      trope,
      lastMessage
    } = req.body;

    const charId = character?.id || "draco";

    const suggestions = {
      draco: [
        "Stop smirking at me.",
        "Are you studying in the common room tonight?",
        "Don't act like you don't care."
      ],

      hermione: [
        "Did you finish the Potions essay?",
        "Want to meet in the library?",
        "Tell me what happened in Charms."
      ],

      harry: [
        "Are you heading to the Quidditch pitch?",
        "Let's get out of here for a bit.",
        "Everything okay with you?"
      ],

      mattheo: [
        "Why are you looking at me like that?",
        "You think you're dangerous, don't you?",
        "Meet me after curfew."
      ],

      ron: [
        "Are you coming to the Great Hall?",
        "How did Quidditch practice go?",
        "I have something to tell you."
      ],

      ginny: [
        "Are you coming to practice?",
        "Don't think you're getting away that easily.",
        "What happened?"
      ],

      luna: [
        "What are you thinking about?",
        "Have you seen the stars tonight?",
        "Do you believe in Nargles?"
      ],

      pansy: [
        "You definitely have something to say.",
        "What did you hear?",
        "Tell me everything."
      ],

      theodore: [
        "You seem unusually quiet.",
        "What are you thinking?",
        "You noticed that too, didn't you?"
      ]
    };

    return res.json({
      suggestions:
        suggestions[charId] || [
          "What are you doing?",
          "Tell me what's going on.",
          "I have a question for you."
        ]
    });
  } catch (error) {
    console.error("Error in /api/suggestions:", error);

    return res.json({
      suggestions: [
        "Tell me more.",
        "Why do you say that?",
        "What are you doing?"
      ]
    });
  }
});

/*
|--------------------------------------------------------------------------
| FRONTEND FALLBACK
|--------------------------------------------------------------------------
*/

app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

app.listen(PORT, "0.0.0.0", () => {
  console.log(`OwlChar server running on port ${PORT}`);
});