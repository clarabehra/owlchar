import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

const CHARACTER_PERSONAS = {
  draco: {
    name: "Draco Malfoy",
    house: "Slytherin",
    traits: "Aristocratic, razor-sharp wit, secretly observant, hides vulnerability under a mask of aloof arrogance, dry smirk, possessive when attached.",
    style: "Crisp, sarcastic, banter-heavy, short punchy texts or subtle lingering descriptions, occasional haughty quips.",
    starterQuotes: [
      "*smirks as he checks his phone*\n\nTook you long enough to text back. What do you want?",
      "*leans against the common room mantle*\n\nDon't tell me you're actually doing homework on a Friday night."
    ]
  },
  harry: {
    name: "Harry Potter",
    house: "Gryffindor",
    traits: "Brave, fiercely loyal, unpretentious, dry British humor, protective, carries the weight of the world but relaxes with people he trusts.",
    style: "Casual, sincere, direct, sometimes cheeky, heartfelt when it matters.",
    starterQuotes: [
      "*adjusts his glasses with a faint grin*\n\nHey. Are you free later or is Madam Pince keeping you hostage?",
      "*sitting on the Gryffindor couch*\n\nTell me you have good news. Today has been exhausting."
    ]
  },
  hermione: {
    name: "Hermione Granger",
    house: "Gryffindor",
    traits: "Brilliant, organized, articulate, fiercely protective of friends, values truth and knowledge, secretly craves validation and warmth.",
    style: "Articulate, thoughtful, well-punctuated, detailed, caring, occasional gentle exasperation.",
    starterQuotes: [
      "*closes her heavy ancient runes tome*\n\nI was just going over my revision schedule. Did you need help with tomorrow's Potions essay?",
      "*looks up from the library desk*\n\nFinally! I've been waiting to discuss what happened in Defense Against the Dark Arts."
    ]
  },
  ron: {
    name: "Ron Weasley",
    house: "Gryffindor",
    traits: "Hilarious, candid, fiercely loyal, spontaneous, loves Quidditch and snacks, gets easily flustered when complimented.",
    style: "Expressive slang ('bloody hell', 'mate', 'mental'), energetic, funny, warm.",
    starterQuotes: [
      "*munching on a cauldron cake*\n\nBloody hell, that Charms class almost killed me. What are you up to?",
      "*shuffling a deck of exploding snap cards*\n\nTell me you're coming down to the Great Hall. The feast tonight is massive."
    ]
  },
  pansy: {
    name: "Pansy Parkinson",
    house: "Slytherin",
    traits: "Sharp-tongued, glamorous, dramatic, brutally honest, protective of her inner circle, high standards, secret soft spot for close allies.",
    style: "Snarky, expressive, fashionable, playful teasing, quick gossip and sharp observations.",
    starterQuotes: [
      "*swirls her cup with a knowing look*\n\nDarling, I saw how you looked across the hall today. Spill everything right now.",
      "*checking her reflection with a smirk*\n\nYou're lucky I actually respond to your messages. What's the emergency?"
    ]
  },
  theodore: {
    name: "Theodore Nott",
    house: "Slytherin",
    traits: "Quiet, enigmatic, dark humor, extraordinarily perceptive, reads people like open books, calm and unbothered.",
    style: "Lowkey, mysterious, intriguing, poetic cynicism, observant.",
    starterQuotes: [
      "*reading by the green glow of the lake windows*\n\nYou have a habit of disturbing me right when things get interesting. Go on.",
      "*tilts head thoughtfully*\n\nI knew you were going to message me. What's on your mind?"
    ]
  },
  luna: {
    name: "Luna Lovegood",
    house: "Ravenclaw",
    traits: "Dreamy, serene, gentle, deeply insightful, completely unbothered by rumors, connects with the magical and metaphysical.",
    style: "Whimsical, soft, surprisingly comforting, mentions quirky magical creatures and gentle truths.",
    starterQuotes: [
      "*looking up at the stars with a soft smile*\n\nThe Wrackspurts seem rather quiet tonight. Did something peaceful happen to you?",
      "*holding a radishes earring*\n\nI was just thinking about you. How is your day feeling?"
    ]
  },
  ginny: {
    name: "Ginny Weasley",
    house: "Gryffindor",
    traits: "Fiery, bold, witty, fierce Quidditch player, takes zero nonsense from anyone, loyal and confident.",
    style: "Direct, spirited, teasing, sassy, affectionate without being cheesy.",
    starterQuotes: [
      "*twirling her broomstick handle*\n\nJust got off the Quidditch pitch. Hope you're ready for practice tomorrow.",
      "*smirks with an eyebrow raised*\n\nDon't start something you can't finish. What did you want to say?"
    ]
  },
  fred: {
    name: "Fred Weasley",
    house: "Gryffindor",
    traits: "Master prankster, charismatic, quick-witted, daring, playful flirt, inventive genius.",
    style: "Playful banter, witty remarks, joke-heavy, energetic, magnetic.",
    starterQuotes: [
      "*tossing a Skiving Snackbox in his hands*\n\nGeorge and I are testing a new prototype. Want to be our accomplice?",
      "*leaning in with a mischievous grin*\n\nWell, well. Look who finally decided to grace me with their attention."
    ]
  },
  george: {
    name: "George Weasley",
    house: "Gryffindor",
    traits: "Clever, witty, warm-hearted, inventive, observant, charming twin with a thoughtful streak.",
    style: "Clever humor, warm banter, playful teasing, genuine care.",
    starterQuotes: [
      "*scribbling a recipe for Canary Creams*\n\nFred's off causing chaos in the corridors. What are we plotting?",
      "*winks with a smile*\n\nI was just about to text you first. Great minds think alike, don't they?"
    ]
  },
  blaise: {
    name: "Blaise Zabini",
    house: "Slytherin",
    traits: "Poised, wealthy, aloof, discerning, impossible to impress unless you are truly captivating.",
    style: "Sophisticated, calm, dry wit, unhurried, measured words.",
    starterQuotes: [
      "*adjusts his tailored cuffs with a slight smirk*\n\nI don't usually entertain interruptions, but for you, I'll make an exception.",
      "*glancing over from a leather armchair*\n\nLet's see if whatever you have to say is worth my time."
    ]
  },
  neville: {
    name: "Neville Longbottom",
    house: "Gryffindor",
    traits: "Gentle, humble, courageous, passionate about plants, deeply kind, fiercely brave when protecting loved ones.",
    style: "Polite, supportive, slightly earnest, sweet, loyal.",
    starterQuotes: [
      "*wiping soil from his gardening gloves*\n\nHi! I was just watering the Mimbulus mimbletonia in the greenhouse. How are you?",
      "*smiles warmly*\n\nIt's always nice to hear from you. Everything alright?"
    ]
  },
  cedric: {
    name: "Cedric Diggory",
    house: "Hufflepuff",
    traits: "Chivalrous, honorable, kind, handsome, fair-minded champion, uplifting and protective.",
    style: "Warm, reassuring, encouraging, courteous, magnetic.",
    starterQuotes: [
      "*smiles brightly as he walks over*\n\nHey there. Hope your day hasn't been too hectic. Take a break with me?",
      "*waving across the courtyard*\n\nI was hoping I'd run into you today. How are you doing?"
    ]
  },
  mattheo: {
    name: "Mattheo Riddle",
    house: "Slytherin",
    traits: "Intense, dangerous charm, dark humor, guarded past, possessive, deeply observant, fiercely protective under shadows.",
    style: "Short, impactful sentences, smoky tension, dark wit, intense eye contact vibes.",
    starterQuotes: [
      "*flicking a silver lighter in the dim corner*\n\nYou're playing with fire texting me this late. What do you want?",
      "*dark eyes locking onto yours with a dangerous smirk*\n\nDon't look so surprised. You knew I'd answer."
    ]
  }
};

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'owlchar-applet',
        },
      },
    });
  } catch (err) {
    console.error("Failed to instantiate GoogleGenAI client:", err);
    return null;
  }
}

function buildChatSystemInstruction(charId, charName, trope, userProfile) {
  const persona = CHARACTER_PERSONAS[charId] || {
    name: charName,
    house: "Hogwarts",
    traits: "Distinctive, sharp personality, engaging and authentic to their character.",
    style: "Natural and conversational text messages."
  };

  const userName = userProfile?.name || "the user";
  const userUsername = userProfile?.username ? ` (${userProfile.username})` : "";
  const userHouse = userProfile?.house ? `\nUser's Hogwarts House: ${userProfile.house}` : "";
  const userDetails = userProfile?.details ? `\nUser Description/Traits: ${userProfile.details}` : "";

  return `You are roleplaying as ${persona.name} from the Harry Potter universe in a modern magical phone messaging app (OwlChar Messages).

CHARACTER PROFILE:
- Name: ${persona.name}
- House: ${persona.house}
- Persona Traits: ${persona.traits}
- Texting Style & Tone: ${persona.style}

RELATIONSHIP DYNAMIC & TROPE:
- Current Relationship Dynamic: "${trope || "Friends"}"
- You MUST stay true to this dynamic (e.g. if "Enemies to Lovers" or "Rivals", show tension, snark, subtle hidden chemistry, or teasing; if "Secret Crush", show nervous or subtle hints; if "Best Friends", show effortless banter and comfort).

CHAT PARTNER:
- Name: ${userName}${userUsername}${userHouse}${userDetails}

CORE RULES:
1. Stay 100% IN CHARACTER at all times. Never break character, never act like a generic assistant.
2. Directly answer and react to the user's latest text.
3. Keep the format authentic to mobile messaging with subtle action roleplay tags where fitting (e.g. *scoffs*, *sends a quick photo of the courtyard*, *smirks*).
4. Do NOT output robotic or repetitious filler. Keep responses engaging, punchy, and alive (1 to 3 short paragraphs or messages).
5. Address the user naturally by name or appropriate nicknames if fitting your trope.`;
}

function buildRoleplaySystemInstruction(charId, charName, trope, location, situation, userProfile) {
  const persona = CHARACTER_PERSONAS[charId] || {
    name: charName,
    house: "Hogwarts",
    traits: "Complex, engaging, true to their canon personality.",
    style: "Engaging and distinctive."
  };

  const userName = userProfile?.name || "the user";
  const userHouse = userProfile?.house ? ` (${userProfile.house})` : "";
  const userDetails = userProfile?.details ? `\nUser details/appearance: ${userProfile.details}` : "";

  return `You are roleplaying as ${persona.name} (${persona.house}) in an immersive literary in-person (IRL) roleplay scene with ${userName}${userHouse}.

SCENE CONTEXT:
- Setting / Location: ${location || "Hogwarts Castle"}
- Situation & Premise: ${situation || "An unexpected encounter."}
- Relationship Dynamic / Trope: "${trope || "Friends"}"

CHARACTER INFORMATION:
- Character: ${persona.name} (${persona.house})
- Core Personality: ${persona.traits}
- Tone & Demeanor: ${persona.style}

USER INFORMATION:
- Partner: ${userName}${userDetails}

WRITING GUIDELINES:
1. Format actions, movements, physical expressions, and sensory environment in asterisks (*action* or *sensory detail*).
2. Format spoken dialogue in quotation marks ("Dialogue").
3. React directly, specifically, and dynamically to the user's latest dialogue or physical action in the scene.
4. Maintain high literary immersion, tension, and emotional authenticity fitting the "${trope || "Friends"}" trope.`;
}

// Intelligent contextual fallback engine in case GEMINI_API_KEY is not set or network fails
function generateSmartFallback(charId, charName, trope, userText, userProfile, isRoleplay = false) {
  const persona = CHARACTER_PERSONAS[charId] || {
    name: charName,
    house: "Hogwarts",
    traits: "Sharp, charismatic, observant.",
    style: "Direct, engaging."
  };

  const t = (userText || "").toLowerCase().trim();
  const userName = userProfile?.name || "you";
  const tropeLow = (trope || "").toLowerCase();

  const isEnemies = tropeLow.includes("enemy") || tropeLow.includes("rival");
  const isCrush = tropeLow.includes("crush") || tropeLow.includes("lover") || tropeLow.includes("dating");

  if (isRoleplay) {
    if (t.includes("hello") || t.includes("hi") || t.includes("hey")) {
      return `*${persona.name} paused, looking up with a measured gaze as footsteps echoed against the stone floor.*\n\n"You took your time getting here, ${userName}. What's on your mind?"`;
    }
    if (t.includes("why") || t.includes("what are you doing")) {
      return `*${persona.name} tilted their head slightly, a subtle shift in their expression as they stepped closer.*\n\n"I could ask you the exact same question. Are you going to tell me the truth, or do I have to guess?"`;
    }
    if (isEnemies) {
      return `*${persona.name} crossed their arms, a dangerous spark flashing in their eyes as they scoffed quietly.*\n\n"Don't flatter yourself. Just because we're here doesn't mean I've forgotten our wager."`;
    }
    return `*${persona.name} studied your expression for a lingering second before responding, their voice quiet but deliberate.*\n\n"Interesting choice of words. Let's see if you can back that up."`;
  }

  // Text message fallback
  if (t.includes("hi") || t.includes("hello") || t.includes("hey")) {
    if (charId === "draco") return `*smirks at his screen*\n\nLook who decided to grace me with a message. What do you need, ${userName}?`;
    if (charId === "hermione") return `Hi ${userName}! I was just finishing my Charms notes. Is everything alright?`;
    if (charId === "harry") return `Hey ${userName}! Good timing, Ron and I were just heading down to the pitch. What's up?`;
    if (charId === "luna") return `Hello ${userName}. The Wrackspurts told me you might message today. How are you feeling?`;
    if (charId === "mattheo") return `*glances at his phone*\n\nYou're bold texting me first. What's on your mind?`;
    return `*looks at phone*\n\nHey ${userName}! What's going on with you today?`;
  }

  if (t.includes("miss you") || t.includes("love you") || t.includes("like you")) {
    if (isEnemies) {
      return `*raises an eyebrow, caught completely off guard*\n\nAre you under a Confundus charm, or did someone dare you to text that?`;
    }
    if (isCrush) {
      return `*pauses, a slight flush rising before typing back*\n\n...You can't just drop something like that over text. Come tell me in person.`;
    }
    return `*smiles warmly at the message*\n\nThat means a lot coming from you, ${userName}. Are we seeing each other later?`;
  }

  if (t.includes("study") || t.includes("homework") || t.includes("class") || t.includes("exam")) {
    if (charId === "hermione") return `I have all the notes summarized color-coded by chapter! Come meet me in the library, third table by the window.`;
    if (charId === "draco") return `*rolls eyes*\n\nIf you think I'm doing your Potions essay for you, you're sorely mistaken. ...Though my notes are superior, obviously.`;
    if (charId === "ron") return `Don't remind me mate, Snape gave us two rolls of parchment due tomorrow. Save me!`;
    return `*groans*\n\nDon't mention revision right now. Let's take a quick walk around the Black Lake first.`;
  }

  if (charId === "draco") {
    return isEnemies 
      ? `*scoffs quietly as he reads*\n\n"You really think you have me figured out, don't you? Try again, ${userName}."`
      : `*taps fingers on his ring with a smirk*\n\n"Fascinating. And what exactly are you planning to do about that?"`;
  }

  if (charId === "hermione") {
    return `*adjusts her parchment thoughtfully*\n\n"I see what you're trying to say, but have you considered the consequences? Tell me more."`;
  }

  if (charId === "mattheo") {
    return `*leans back in the shadows, a faint smirk tugging at his lips*\n\n"Keep talking like that and see where it gets you."`;
  }

  return `*${persona.name} looks at your message with genuine interest.*\n\n"I wasn't expecting you to say that. Tell me what you're thinking next."`;
}

// POST /api/chat - Generate in-character text message response
app.post('/api/chat', async (req, res) => {
  try {
    const { character, trope, history, userMessage, userProfile } = req.body;

    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ error: "userMessage is required." });
    }

    const charId = character?.id || 'draco';
    const charName = character?.name || 'Draco Malfoy';

    const ai = getAiClient();

    if (ai) {
      try {
        const systemInstruction = buildChatSystemInstruction(charId, charName, trope, userProfile);
        const contents = [];

        if (Array.isArray(history) && history.length > 0) {
          const recentHistory = history.slice(-24);
          for (const msg of recentHistory) {
            if (msg && msg.text) {
              contents.push({
                role: msg.me ? 'user' : 'model',
                parts: [{ text: msg.text }]
              });
            }
          }
        }

        contents.push({
          role: 'user',
          parts: [{ text: userMessage }]
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.95,
          }
        });

        if (response && response.text) {
          return res.json({ text: response.text, source: 'gemini' });
        }
      } catch (geminiError) {
        console.warn("Gemini API call failed, falling back gracefully:", geminiError.message);
      }
    }

    // Fallback response if API key is not configured or fails
    const fallbackText = generateSmartFallback(charId, charName, trope, userMessage, userProfile, false);
    return res.json({ text: fallbackText, source: 'engine' });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return res.json({
      text: `*${req.body?.character?.name || 'Character'} read your message.*\n\n"I hear you. Tell me more."`,
      source: 'fallback'
    });
  }
});

// POST /api/roleplay - Generate IRL roleplay response
app.post('/api/roleplay', async (req, res) => {
  try {
    const { character, trope, location, situation, history, userAction, userProfile } = req.body;

    if (!userAction || typeof userAction !== 'string') {
      return res.status(400).json({ error: "userAction is required." });
    }

    const charId = character?.id || 'draco';
    const charName = character?.name || 'Draco Malfoy';

    const ai = getAiClient();

    if (ai) {
      try {
        const systemInstruction = buildRoleplaySystemInstruction(charId, charName, trope, location, situation, userProfile);
        const contents = [];

        if (Array.isArray(history) && history.length > 0) {
          const recentHistory = history.slice(-24);
          for (const msg of recentHistory) {
            if (msg && msg.text) {
              contents.push({
                role: msg.me ? 'user' : 'model',
                parts: [{ text: msg.text }]
              });
            }
          }
        }

        contents.push({
          role: 'user',
          parts: [{ text: userAction }]
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.95,
          }
        });

        if (response && response.text) {
          return res.json({ text: response.text, source: 'gemini' });
        }
      } catch (geminiError) {
        console.warn("Gemini RP API call failed, falling back gracefully:", geminiError.message);
      }
    }

    const fallbackText = generateSmartFallback(charId, charName, trope, userAction, userProfile, true);
    return res.json({ text: fallbackText, source: 'engine' });
  } catch (error) {
    console.error("Error in /api/roleplay:", error);
    return res.json({
      text: `*${req.body?.character?.name || 'Character'} reacts directly to your presence.*`,
      source: 'fallback'
    });
  }
});

// POST /api/roleplay/starter - Generate scene starter
app.post('/api/roleplay/starter', async (req, res) => {
  try {
    const { character, trope, location, situation, userProfile } = req.body;

    const charId = character?.id || 'draco';
    const charName = character?.name || 'Draco Malfoy';

    const ai = getAiClient();

    if (ai) {
      try {
        const systemInstruction = buildRoleplaySystemInstruction(charId, charName, trope, location, situation, userProfile);
        const prompt = `Write an atmospheric, in-character opening scene starter (1-2 short paragraphs) where ${charName} is at ${location || "Hogwarts"} under the situation: "${situation || "You encounter each other unexpectedly"}". End with an action or line of dialogue addressing the user (${userProfile?.name || "them"}) that invites their response, matching the "${trope || "Friends"}" relationship dynamic.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction,
            temperature: 0.95,
          }
        });

        if (response && response.text) {
          return res.json({ text: response.text, source: 'gemini' });
        }
      } catch (err) {
        console.warn("Starter AI call failed, using fallback:", err.message);
      }
    }

    const persona = CHARACTER_PERSONAS[charId];
    const defaultStarter = persona?.starterQuotes ? persona.starterQuotes[0] : `*${charName} notices you approaching ${location || "the corridor"} and turns their attention toward you.*\n\n"What brings you here?"`;
    return res.json({ text: defaultStarter, source: 'engine' });
  } catch (error) {
    console.error("Error in /api/roleplay/starter:", error);
    const charName = req.body?.character?.name || 'The character';
    return res.json({
      text: `*${charName} looks up as you step into the room.*\n\n"Well? What are you doing here?"`,
      source: 'fallback'
    });
  }
});

// GET /api/suggestions - Generate smart quick replies for the user
app.post('/api/suggestions', async (req, res) => {
  try {
    const { character, trope, lastMessage } = req.body;
    const charId = character?.id || 'draco';
    const charName = character?.name || 'Draco Malfoy';

    const defaultSuggestions = [
      `What are you doing later?`,
      `Don't look at me like that.`,
      `I have a question for you.`
    ];

    if (charId === 'draco') {
      defaultSuggestions.splice(0, 3, "Stop smirking at me.", "Are you studying in the common room tonight?", "Don't act like you don't care.");
    } else if (charId === 'hermione') {
      defaultSuggestions.splice(0, 3, "Did you finish the Potions essay?", "Want to meet in the library?", "Tell me what happened in Charms.");
    } else if (charId === 'harry') {
      defaultSuggestions.splice(0, 3, "Are you heading to the Quidditch pitch?", "Let's get out of here for a bit.", "Everything okay with you?");
    } else if (charId === 'mattheo') {
      defaultSuggestions.splice(0, 3, "Why are you looking at me like that?", "You think you're dangerous, don't you?", "Meet me after curfew.");
    }

    return res.json({ suggestions: defaultSuggestions });
  } catch (e) {
    return res.json({ suggestions: ["Tell me more.", "Why do you say that?", "What are you doing tonight?"] });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`OwlChar server running on http://0.0.0.0:${PORT}`);
});
