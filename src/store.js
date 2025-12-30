import { writable, get } from 'svelte/store';

export const GRID_SIZE = 20;
export const TILE_SIZE = 30; // pixels

export const ZONES = {
  EMPTY: 'empty',
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
  INDUSTRIAL: 'industrial',
  ROAD: 'road',
  PARK: 'park'
};

export const COSTS = {
  [ZONES.RESIDENTIAL]: 100,
  [ZONES.COMMERCIAL]: 200,
  [ZONES.INDUSTRIAL]: 300,
  [ZONES.ROAD]: 10,
  [ZONES.PARK]: 50,
  [ZONES.EMPTY]: 5
};

// Initial State
const initialGrid = Array(GRID_SIZE).fill(null).map(() =>
  Array(GRID_SIZE).fill(null).map(() => ({
    type: ZONES.EMPTY,
    population: 0,
    level: 1,
    hasPower: true, // Simplified: everything has power for now
    hasWater: true  // Simplified
  }))
);

export const grid = writable(initialGrid);
export const money = writable(5000);
export const population = writable(0);
export const time = writable(0);
export const selectedTool = writable(null); // null or one of ZONES values
export const demand = writable({ residential: 50, commercial: 0, industrial: 0 }); // -100 to 100
export const denizens = writable([]);
export const pendingMentions = writable([]); // Track @mentions for response queuing

export const messages = writable([
  { id: 1, author: { name: 'Mayor', isSystem: true }, text: 'Welcome to SimTwitty! Start building zones to attract denizens.', time: 0 }
]);

const NO_ROAD_MESSAGES = [
  "I'm trapped! No road out of here.",
  "How do I get to work? The road is gone!",
  "I can't get any deliveries. Moving out!",
  "Is this an island? Where did the road go?",
  "My car is useless without a street."
];

const LONG_COMMUTE_MESSAGES = [
  "The commute is killing me. Moving closer to work.",
  "Spending 4 hours in traffic? No thanks. I'm out.",
  "I miss my family. I spend all my time driving.",
  "Gas prices are too high for this drive.",
  "I need a job closer to home."
];

const SPECIFIC_COMMUTE_MESSAGES = [
  "The commute to {dest} is just too far from here!",
  "I can't believe I have to drive all the way to {dest} every day.",
  "Why is {dest} so far away? My car is crying.",
  "Traffic to {dest} is a nightmare. I'm moving.",
  "I love working at {dest}, but the drive is ruinous."
];

const SPECIFIC_GROWTH_MESSAGES = [
  "Just moved in near {dest}. Convenient!",
  "Love being so close to {dest}.",
  "Great location! {dest} is just a short walk away.",
  "Finally, a short commute to {dest}.",
  "This spot is perfect. I can see {dest} from my window."
];

const POLLUTION_MESSAGES = [
  "The smog is unbearable. I can't breathe!",
  "Moving to the countryside. This air is toxic.",
  "My laundry turns grey when I hang it outside.",
  "Coughing all day. I'm leaving this smog city.",
  "It smells like burning tires here. Bye!"
];

const GENERIC_DECLINE_MESSAGES = [
  "This neighborhood isn't what it used to be.",
  "Time to move on.",
  "Found a better place in another city.",
  "Property values are tanking. Selling now!",
  "Just don't like the vibe here anymore."
];

// Personality traits for denizens
export const PERSONALITIES = ['optimist', 'pessimist', 'pragmatist', 'activist', 'cynic'];

function pickPersonality() {
  return PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
}

// Personality-specific response templates
const PERSONALITY_RESPONSES = {
  optimist: {
    supportive: [
      "@Mayor I knew you'd come through! You're amazing!",
      "@Mayor this is exactly what we needed. Thank you!",
      "@Mayor I have faith in you, Mayor. Let's make this city great!",
      "@Mayor seeing progress like this makes me smile. Keep it up!",
      "@Mayor another win for our city! You're on a roll!"
    ],
    dismissive: [
      "@Mayor I'm sure you're doing your best. We'll figure it out!",
      "@Mayor no worries, I'm confident things will improve.",
      "@Mayor I still believe in you, Mayor!",
      "@Mayor Rome wasn't built in a day. We can wait.",
      "@Mayor hiccups happen. We'll bounce back!"
    ],
    actionTaken: [
      "@Mayor YES! This is incredible! I'm so happy right now!",
      "@Mayor you actually did it! I knew you would!",
      "@Mayor this changes everything! Thank you so much!",
      "@Mayor proof that dreams come true! Best Mayor ever!",
      "@Mayor I'm telling everyone I know about this!"
    ],
    ignored: [
      "@Mayor I'm sure you're busy. I can wait.",
      "@Mayor no rush, Mayor. We're patient here.",
      "@Mayor I still have hope things will get better.",
      "@Mayor maybe next time! I'm staying positive.",
      "@Mayor busy schedule, I get it. We're good."
    ]
  },
  pessimist: {
    supportive: [
      "@Mayor wow, you actually listened? I'm shocked.",
      "@Mayor I guess that's something. Don't get my hopes up though.",
      "@Mayor nice words. Let's see if you actually follow through.",
      "@Mayor probably a fluke, but thanks anyway.",
      "@Mayor I was ready to be disappointed, but... okay."
    ],
    dismissive: [
      "@Mayor figures. Just more empty promises.",
      "@Mayor of course you don't care. Why would you?",
      "@Mayor typical. I'm out of here.",
      "@Mayor expected nothing and still disappointed.",
      "@Mayor another day, another letdown from City Hall."
    ],
    actionTaken: [
      "@Mayor okay, I'll admit it. That actually helped.",
      "@Mayor well, I didn't expect that. Maybe you're not so bad.",
      "@Mayor fine, you did something right for once.",
      "@Mayor don't think this fixes everything, but it's a start.",
      "@Mayor I hate to say it, but good job."
    ],
    ignored: [
      "@Mayor I knew you wouldn't actually do anything.",
      "@Mayor just as I expected. Useless.",
      "@Mayor moving to a city with a competent mayor.",
      "@Mayor why do I even bother asking?",
      "@Mayor silence is loud. Message received."
    ]
  },
  pragmatist: {
    supportive: [
      "@Mayor good to see you're taking action. What's the timeline?",
      "@Mayor solid response. How will this affect the budget?",
      "@Mayor makes sense. Let's see the results.",
      "@Mayor reasonable approach. Proceed.",
      "@Mayor I appreciate the transparency."
    ],
    dismissive: [
      "@Mayor that doesn't address the core issue.",
      "@Mayor nice sentiment, but what's the actual plan?",
      "@Mayor words without action won't fix anything.",
      "@Mayor efficient refusal, but a refusal nonetheless.",
      "@Mayor that's not a solution, that's a deflection."
    ],
    actionTaken: [
      "@Mayor efficient. My commute is already 20% faster.",
      "@Mayor the numbers don't lie. This actually works.",
      "@Mayor finally, some practical solutions.",
      "@Mayor property value up 2%. Acceptable.",
      "@Mayor logical move. Glad you saw the data."
    ],
    ignored: [
      "@Mayor still waiting on concrete action.",
      "@Mayor talk is cheap. Show me results.",
      "@Mayor I'll move somewhere with real infrastructure.",
      "@Mayor inefficiency at its finest.",
      "@Mayor no response? Not very professional."
    ]
  },
  activist: {
    supportive: [
      "@Mayor YES! This is what real leadership looks like!",
      "@Mayor I'm organizing a thank you rally. You in?",
      "@Mayor this is the change we've been fighting for!",
      "@Mayor the people's voice has been heard! Victory!",
      "@Mayor solidarity! Thank you for standing with us!"
    ],
    dismissive: [
      "@Mayor that's not nearly enough. We demand more!",
      "@Mayor half-measures won't cut it. We need real change!",
      "@Mayor you're not listening to what we actually need.",
      "@Mayor shameful! The citizens deserve better!",
      "@Mayor we will not be silenced by your excuses!"
    ],
    actionTaken: [
      "@Mayor THIS is what we've been asking for! Keep it up!",
      "@Mayor you're finally on the right side of history!",
      "@Mayor the movement is working! Let's push for more!",
      "@Mayor direct action gets results! Well done!",
      "@Mayor power to the people! (And the Mayor, this time)."
    ],
    ignored: [
      "@Mayor we're not going away until you listen.",
      "@Mayor the people demand action, not excuses!",
      "@Mayor moving to a city that values its citizens.",
      "@Mayor your silence speaks volumes about your priorities.",
      "@Mayor ignore us at your peril. Election year is coming."
    ]
  },
  cynic: {
    supportive: [
      "@Mayor oh please, what's the catch?",
      "@Mayor nice PR stunt. What are you really after?",
      "@Mayor I'll believe it when I see it.",
      "@Mayor who paid you to say that?",
      "@Mayor sure, sure. And pigs fly."
    ],
    dismissive: [
      "@Mayor lol, you actually think that'll work?",
      "@Mayor spare me the BS, Mayor.",
      "@Mayor typical politician nonsense.",
      "@Mayor yawn. Wake me up when you actually do something.",
      "@Mayor is this a bot account? Feels like it."
    ],
    actionTaken: [
      "@Mayor okay, I'm mildly impressed. Don't let it go to your head.",
      "@Mayor even a broken clock is right twice a day.",
      "@Mayor fine, you did one thing right. Congrats.",
      "@Mayor must be an election year if you're actually working.",
      "@Mayor barely adequate. But I'll take it."
    ],
    ignored: [
      "@Mayor shocking. Absolutely shocking.",
      "@Mayor I'm leaving before this city gets worse.",
      "@Mayor you're a joke, and so is this city.",
      "@Mayor exactly the incompetence I expected.",
      "@Mayor 0/10 administration. Would not recommend."
    ]
  }
};

// Denizen request templates for @Mayor mentions
const DENIZEN_REQUESTS = [
  // Location-specific
  "@Mayor we need a road at {home}!",
  "@Mayor can you fix the pollution near {home}?",
  "@Mayor my commute from {home} is brutal!",
  "@Mayor why is {home} so isolated?",
  "@Mayor {home} needs better infrastructure!",
  // City-wide
  "@Mayor this city needs more jobs!",
  "@Mayor the pollution is unbearable!",
  "@Mayor we need better infrastructure!",
  "@Mayor traffic is out of control!",
  "@Mayor we're overcrowded here!"
];

// Dog pile templates - when user gets piled on
const DOG_PILE_TEMPLATES = [
  // Distraction/Focus
  "@{target} tell the Mayor to FOCUS! The city is burning (figuratively)!",
  "@{target} is right, @Mayor stop distracted tweeting and build some roads!",
  "@Mayor maybe less social media, more city planning? Listen to @{target}!",
  "@Mayor your approval rating drops every time you tweet nonsense.",
  "Seriously @Mayor? @{target} is waiting for a response and you tweet this?",

  // Criticism
  "@{target} remember that bridge to nowhere the Mayor built? Fix that first.",
  "@Mayor I'm still waiting for water in Zone C, just saying. @{target} knows what's up.",
  "@Mayor easy to tweet from your ivory tower while we sit in traffic. Right @{target}?",
  "Yeah @{target}, the Mayor clearly doesn't care about our commute.",
  
  // Random Recommendations
  "@Mayor we need more parks! #GreenCity cc: @{target}",
  "Hey @{target}, tell the Mayor to build a stadium! Or at least a hot dog stand.",
  "@Mayor forget roads, we need a monorail! #Monorail",
  "Agreed with @{target}. More industrial zones! I love the smell of smog.",
  "@{target} for Mayor! At least they reply."
];

// Sentiment analysis based on player tweet content
function analyzeSentiment(playerTweet, denizen) {
  const text = playerTweet.toLowerCase();
  const denizensHome = denizen.home ? denizen.home.toLowerCase() : '';
  const denizensWork = denizen.work ? denizen.work.toLowerCase() : '';
  
  // Check if player is addressing their specific situation
  if (text.includes(denizensHome) || text.includes(denizensWork)) {
    if (text.includes('build') || text.includes('fix') || text.includes('improve') || text.includes('road')) {
      return 'actionTaken'; // Player is doing something about THEIR issue
    }
  }
  
  // Generic action words
  if (text.includes('build') || text.includes('fix') || text.includes('improve')) {
    return 'actionTaken';
  }
  
  // Supportive language
  if (text.includes('sorry') || text.includes('thanks') || text.includes('appreciate') || 
      text.includes('listen') || text.includes('understand') || text.includes('working on')) {
    return 'supportive';
  }
  
  // Dismissive language
  if (text.includes('no') || text.includes('can\'t') || text.includes('won\'t') || 
      text.includes('impossible') || text.includes('not possible')) {
    return 'dismissive';
  }
  
  // Generic/ignored
  return 'ignored';
}

// Determine emotional state based on denizen's current situation
function getEmotionalState(denizen) {
  // Happy: employed, no missed days, stable
  if (denizen.work && !denizen.daysMissed && denizen.unemployedDays === 0) {
    return 'happy';
  }
  
  // Desperate: unemployed or long unemployment
  if (!denizen.work || denizen.unemployedDays > 5) {
    return 'desperate';
  }
  
  // Angry: just lost job or home
  if (denizen.daysMissed > 3 || denizen.unemployedDays > 15) {
    return 'angry';
  }
  
  return 'neutral';
}

// Generate denizen response based on personality, sentiment, and emotional state
function generateDenizenResponse(denizen, playerTweet, sentiment) {
  const personality = denizen.personality || 'optimist';
  const emotionalState = getEmotionalState(denizen);
  
  // Get base responses from personality templates
  let responses = PERSONALITY_RESPONSES[personality][sentiment] || PERSONALITY_RESPONSES[personality]['ignored'];
  
  // Modify response based on emotional state
  if (emotionalState === 'desperate' && sentiment === 'ignored') {
    responses = [
      "@Mayor I'm leaving. This city doesn't care about us.",
      "@Mayor I can't afford to stay here anymore.",
      "@Mayor goodbye. I'm done waiting."
    ];
  }
  
  if (emotionalState === 'angry' && sentiment === 'dismissive') {
    responses = [
      "@Mayor you just cost me my home. I hope you're happy.",
      "@Mayor I trusted you. Never again.",
      "@Mayor you've lost my vote forever."
    ];
  }
  
  if (emotionalState === 'happy' && sentiment === 'supportive') {
    responses = [
      "@Mayor you're the best! This city is amazing!",
      "@Mayor thanks for everything you do!",
      "@Mayor I love living here!"
    ];
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Generate a denizen request to @Mayor
function generateDenizenRequest(denizen) {
  let request = DENIZEN_REQUESTS[Math.floor(Math.random() * DENIZEN_REQUESTS.length)];
  request = request.replace('{home}', denizen.home || 'here');
  return request;
}

// Helper for unique names
function generateUserName() {
  const prefixes = ['Urban', 'City', 'Metro', 'Town', 'Village', 'Street', 'Road', 'Lane', 'Park', 'Zone'];
  const suffixes = ['Planner', 'Dweller', 'Sim', 'Citizen', 'Neighbor', 'Walker', 'Driver', 'Builder', 'Fan', 'Critic'];
  const name = prefixes[Math.floor(Math.random() * prefixes.length)] + suffixes[Math.floor(Math.random() * suffixes.length)];
  return name + Math.floor(Math.random() * 1000);
}

function generateAuthorProfile(context) {
  const t = get(time);
  const currentDenizens = get(denizens);

  // Try to find a relevant denizen first
  if (context) {
    // If we provided a specific denizen in context
    if (context.denizen) return context.denizen;

    // If context has coordinates, look for a resident there
    if (context.x != null && context.y != null) {
      const resident = currentDenizens.find(d => d.home === getAddress(context.x, context.y));
      if (resident) return resident;
    }
  }

  // Fallback: Pick a random existing denizen
  const activeDenizens = currentDenizens.filter(d => !d.left);
  if (activeDenizens.length > 0) {
    return activeDenizens[Math.floor(Math.random() * activeDenizens.length)];
  }

  // Fallback if no denizens exist (early game)
  const name = generateUserName();
  let home = "Homeless";
  let work = null;
  let since = t;

  if (context && context.type === ZONES.RESIDENTIAL && context.x != null) {
    home = getAddress(context.x, context.y);
  } else {
    home = getAddress(Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE));
  }

  return {
    name,
    home,
    work,
    since,
    history: [{ type: 'move_in', time: since, home }],
    isSystem: false
  };
}

export function getZoneName(type, x, y) {
  const streetAddr = getStreetAddress(x, y);

  if (type === ZONES.COMMERCIAL) {
    const names = ["Commerce Square", "The Market", "Shopping Center", "Mall", "Corner Store", "Business Plaza", "Trade Center", "Retail Park"];
    return `${names[Math.floor(Math.random() * names.length)]} at ${streetAddr}`;
  } else if (type === ZONES.INDUSTRIAL) {
    const names = ["Industrial Park", "Factory District", "The Works", "Manufacturing Hub", "Tech Park", "Warehouse Zone", "Power Station", "Refinery"];
    return `${names[Math.floor(Math.random() * names.length)]} at ${streetAddr}`;
  } else if (type === ZONES.RESIDENTIAL) {
    const names = ["The Apartments", "Housing Block", "Residences", "Living Quarters", "The Lofts", "Condos", "Villas", "Estates"];
    return `${names[Math.floor(Math.random() * names.length)]} at ${streetAddr}`;
  } else if (type === ZONES.PARK) {
    const names = ["Green Park", "City Garden", "Recreation Area", "The Commons", "Nature Reserve", "Playground", "Central Park", "Botanical Garden"];
    return `${names[Math.floor(Math.random() * names.length)]} at ${streetAddr}`;
  }
  return `Zone at ${streetAddr}`;
}

export function getNearestTile(x, y, targetTiles) {
  let minDist = 999;
  let nearest = null;
  for (const t of targetTiles) {
    const dist = Math.sqrt(Math.pow(t.x - x, 2) + Math.pow(t.y - y, 2));
    if (dist < minDist) {
      minDist = dist;
      nearest = t;
    }
  }
  return nearest;
}

// Helper for addresses
export function getAddress(x, y) {
  const rowChar = String.fromCharCode(65 + y); // 0 -> A, 1 -> B
  const colNum = x + 1;
  return `${rowChar}${colNum}`;
}

export function getStreetAddress(x, y) {
  const rowChar = String.fromCharCode(65 + y);
  const colNum = x + 1;

  // Ordinal suffix for column (1st, 2nd, 3rd, 4th...)
  const j = colNum % 10,
    k = colNum % 100;
  let suffix = "th";
  if (j == 1 && k != 11) {
    suffix = "st";
  }
  if (j == 2 && k != 12) {
    suffix = "nd";
  }
  if (j == 3 && k != 13) {
    suffix = "rd";
  }

  return `${rowChar} St & ${colNum}${suffix}`;
}

export function addMessage(text, author = null, context = null) {
  messages.update(msgs => {
    let msgAuthor = author;

    if (!msgAuthor) {
      msgAuthor = generateAuthorProfile(context);
    } else if (typeof msgAuthor === 'string') {
      // Handle legacy string calls (e.g. 'Mayor')
      msgAuthor = { name: msgAuthor, isSystem: true };
    }

    const newMsg = {
      id: Date.now() + Math.random(),
      author: msgAuthor,
      text,
      time: get(time)
    };
    return [newMsg, ...msgs].slice(0, 50); // Keep last 50
  });
}

// Queue a denizen response to a player @mention
let mentionHistory = []; // { name, time }

export function triggerDogPile(targetName) {
  const currentDenizens = get(denizens);
  const otherDenizens = currentDenizens.filter(d => d.name !== targetName && !d.left);
  
  if (otherDenizens.length < 3) return; // Not enough people for a pile

  // Pick 3-5 random pilers
  const count = 3 + Math.floor(Math.random() * 3);
  const pilers = [];
  for (let i = 0; i < count; i++) {
    if (otherDenizens.length > 0) {
      const idx = Math.floor(Math.random() * otherDenizens.length);
      pilers.push(otherDenizens[idx]);
      otherDenizens.splice(idx, 1); // preventing duplicates
    }
  }

  // Queue their messages
  pendingMentions.update(mentions => {
    const newMentions = [...mentions];
    const t = get(time);
    
    pilers.forEach((piler, i) => {
      let tmpl = DOG_PILE_TEMPLATES[Math.floor(Math.random() * DOG_PILE_TEMPLATES.length)];
      tmpl = tmpl.replace('{target}', targetName);
      // 2-5 ticks delay, staggered
      newMentions.push({
        denizenName: piler.name,
        playerTweet: "", 
        forcedResponse: tmpl,
        respondAt: t + 2 + i + Math.floor(Math.random() * 2)
      });
    });
    return newMentions;
  });
}

export function queueDenizenResponse(denizenName, playerTweet) {
  const t = get(time);

  // Check for Dog Pile condition (Mentioning same person twice within 60 ticks)
  const recent = mentionHistory.filter(h => h.name === denizenName && t - h.time < 60);
  
  if (recent.length >= 1) {
     triggerDogPile(denizenName);
  }
  
  mentionHistory.push({ name: denizenName, time: t });
  // Cleanup old history
  mentionHistory = mentionHistory.filter(h => t - h.time < 100);

  pendingMentions.update(mentions => {
    // Queue response for 1-3 ticks later
    const respondAt = t + 1 + Math.floor(Math.random() * 3);
    return [...mentions, { denizenName, playerTweet, respondAt }];
  });
}

// Parse @mention from tweet text
export function parseMention(text) {
  const match = text.match(/@(\w+)/);
  return match ? match[1] : null;
}

// Simulation Logic
export function tick() {
  time.update(n => n + 1);
  const currentTime = get(time);

  // Track changes during this tick
  const resGrowthEvents = [];
  const resDeclineEvents = [];
  const jobGrowthEvents = [];
  const queuedMessages = [];
  const commuteFailures = new Set();
  const commuteSuccesses = new Set();

  // Local helper to queue messages during grid update
  const queueMessage = (text, author, context) => {
    queuedMessages.push({ text, author, context });
  };

  // 1. Calculate totals first to determine demand
  const currentGridState = get(grid);
  const oldPop = get(population); // Capture old population
  let totalResidents = 0;
  let totalJobs = 0;

  currentGridState.forEach(row => {
    row.forEach(tile => {
      if (tile.type === ZONES.RESIDENTIAL) {
        totalResidents += tile.population;
      } else if (tile.type === ZONES.COMMERCIAL || tile.type === ZONES.INDUSTRIAL) {
        totalJobs += tile.population;
      }
    });
  });

  // 2. Update Demand
  let rDemand = 50 + (totalJobs - totalResidents);
  let cDemand = (totalResidents - totalJobs) * 0.5;
  let iDemand = (totalResidents - totalJobs) * 0.5;

  const clamp = (val) => Math.max(-100, Math.min(100, val));
  rDemand = clamp(rDemand);
  cDemand = clamp(cDemand);
  iDemand = clamp(iDemand);

  demand.set({ residential: rDemand, commercial: cDemand, industrial: iDemand });

  // 3. Analyze Road Networks & Calculate Pollution
  const { roadNetworkMap, networks } = analyzeNetworks(currentGridState);
  const pollutionGrid = calculatePollution(currentGridState);

  // We need to map address strings back to coordinates for pathfinding
  const addrToCoord = (addr) => {
    if (!addr) return null;
    try {
      const colMatch = addr.match(/[A-Z]+/);
      const rowMatch = addr.match(/\d+/);
      if (!colMatch || !rowMatch) return null;

      const colChar = colMatch[0];
      const rowNum = parseInt(rowMatch[0]);
      const y = colChar.charCodeAt(0) - 65;
      const x = rowNum - 1;
      return { x, y };
    } catch (e) {
      return null;
    }
  };

  // 4. Process Grid Growth based on Demand, Connectivity, and Distance
  // Calculate Global Labor Shortage for determining job cuts
  const laborExcess = totalJobs - totalResidents;
  // If we have more jobs than residents, we must cut jobs.
  // Probability to cut a job is proportional to the excess.
  // If excess is small (e.g. 1), prob is small. If large, prob is high.
  // Let's say we want to clear the excess in approx 1-2 ticks.
  // chance = 2 * (excess / totalJobs). (Capped at 1.0)
  // If excess is 50%, chance is 100%.
  let jobCutChance = 0;
  if (totalJobs > 0 && laborExcess > 0) {
    jobCutChance = Math.min(1.0, (laborExcess / totalJobs) * 2);
  }

  grid.update(currentGrid => {
    let newPop = 0;

    const nextGrid = currentGrid.map(row => row.map(tile => ({ ...tile, traffic: 0 }))); // Reset traffic

    // Calculate Traffic based on Denizen Commutes
    const currentDenizens = get(denizens);
    const trafficMap = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

    // Optimization: Cache paths? For now, recalculate (simpler, but slower at scale)
    // To scale to 2500+, we should cache paths in denizen object and only update if road network changes.
    // For this step, let's just calculate active commutes.

    // We need to map address strings back to coordinates for pathfinding

    // Only process a subset of denizens per tick for performance? Or all?
    // Let's try all for now, but limit pathfinding depth if needed.
    // Actually, simple Manhattan distance might be enough if grid is simple, but BFS is requested.

    // Group denizens by commute to avoid re-calculating same path?
    // Map: "x1,y1-x2,y2" -> path
    const pathCache = new Map();

    for (const d of currentDenizens) {
      if (d.home && d.work && !d.left) {
        const home = addrToCoord(d.home);
        const work = addrToCoord(d.work);

        if (home && work) {
          // Check if both home and work still exist as zones
          const homeTile = currentGrid[home.y][home.x];
          const workTile = currentGrid[work.y][work.x];

          // Validate zones exist
          if (homeTile.type !== ZONES.RESIDENTIAL || (workTile.type !== ZONES.COMMERCIAL && workTile.type !== ZONES.INDUSTRIAL)) {
            // Job or Home lost physically
            // We handle this in the "Leaving" logic usually, but let's mark for update here if critical
            // Actually, let's just not route traffic.
          } else {
            // Find access points (all adjacent road tiles)
            const startNodes = findAccessPoints(home.x, home.y, currentGrid);
            const endNodes = findAccessPoints(work.x, work.y, currentGrid);

            if (startNodes.length > 0 && endNodes.length > 0) {
              // Create a cache key based on start/end coordinates
              const cacheKey = `${home.x},${home.y}-${work.x},${work.y}`;
              let path = pathCache.get(cacheKey);

              if (!path) {
                path = getPath(startNodes, endNodes, currentGrid);
                if (path) pathCache.set(cacheKey, path);
              }

              if (path) {
                for (const step of path) {
                  trafficMap[step.y][step.x] += 1;
                }
                commuteSuccesses.add(d.id);
              } else {
                // Path impossible! Commute broken.
                commuteFailures.add(d.id);
              }
            } else {
              // No road access at all (start or end)
              commuteFailures.add(d.id);
            }
          }
        }
      }
    }

    // Process immediate job losses from broken commutes
    // We do this by mutating the denizen in place for the *next* update cycle to pick up, 
    // or we can handle it in the denizen update block.
    // Since `currentDenizens` is from `get(denizens)`, we shouldn't mutate it directly if we want to be clean,
    // but we need to pass this info to the denizen update logic.
    // Let's store broken commutes in a set to use in step 5.
    const brokenCommuteDenizens = new Set(currentDenizens.filter(d => d.lostJob).map(d => d.id));

    // Apply traffic map to nextGrid
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (nextGrid[y][x].type === ZONES.ROAD) {
          // Normalize traffic for display. 
          // 1 car = ? traffic. 
          // Let's say max capacity is 10.
          // We want density 0-1 range roughly, or higher for jams.
          // tile.traffic used to be density. Now it is raw count.
          // We can just store raw count and let Tile component handle scaling.
          nextGrid[y][x].traffic = trafficMap[y][x];
        }
      }
    }

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const tile = nextGrid[y][x];

        // Find Network Info
        let networkId = null;
        let hasRoadAccess = false;

        // Check neighbors for road network
        const neighbors = [
          { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
          { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
        ];

        for (const { dx, dy } of neighbors) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
            if (currentGrid[ny][nx].type === ZONES.ROAD) {
              hasRoadAccess = true;
              networkId = roadNetworkMap[ny][nx];
              if (networkId) break; // Found a network
            }
          }
        }

        // Apply traffic density to roads
        // (Calculated above via pathfinding)

        if (tile.type === ZONES.RESIDENTIAL) {
          const pollution = pollutionGrid[y][x];

          if (hasRoadAccess && networkId) {
            const netInfo = networks.get(networkId);

            // COMMUTE CHECK: Find distance to nearest job
            let commuteDist = 999;
            if (netInfo && netInfo.jobTiles.length > 0) {
              commuteDist = getNearestDistance(x, y, netInfo.jobTiles);
            }

            const MAX_COMMUTE = 15; // Max tiles a sim is willing to travel
            const isCommuteOkay = commuteDist <= MAX_COMMUTE;

            // LAND VALUE / DESIRABILITY
            // Base chance from demand
            // Penalty for pollution
            // Bonus for short commute
            let growthChance = (rDemand / 100);

            // Pollution Penalty: If pollution > 5, significant penalty
            if (pollution > 5) growthChance -= 0.5;
            if (pollution > 20) growthChance -= 1.0; // Toxic

            // Commute Bonus/Penalty
            if (commuteDist < 5) growthChance += 0.2; // Walkable
            else if (commuteDist > 10) growthChance -= 0.1; // Long drive

            if (isCommuteOkay && growthChance > 0) {
              if (tile.population < 50 * tile.level) {
                if (Math.random() < growthChance) {
                  tile.population += 1;
                  resGrowthEvents.push({ x, y });

                  // Chance for positive address-aware message
                  if (Math.random() < 0.05 && isCommuteOkay && netInfo && netInfo.jobTiles.length > 0) {
                    const nearest = getNearestTile(x, y, netInfo.jobTiles);
                    if (nearest) {
                      const jobTile = currentGridState[nearest.y][nearest.x];
                      const destName = getZoneName(jobTile.type, nearest.x, nearest.y);
                      const tmpl = SPECIFIC_GROWTH_MESSAGES[Math.floor(Math.random() * SPECIFIC_GROWTH_MESSAGES.length)];

                      const context = { x, y, type: tile.type, jobX: nearest.x, jobY: nearest.y, isGrowth: true };
                      queueMessage(tmpl.replace("{dest}", destName), null, context);
                    }
                  }
                }
              }
            } else {
              // Decay conditions
              // 1. No road
              // 2. No Jobs (Commute too far)
              // 3. Pollution too high
              if (tile.population > 0) {
                if (!isCommuteOkay || pollution > 20 || growthChance < -0.2) {
                  tile.population -= 1;
                  resDeclineEvents.push({ x, y });

                  // Trigger complaint tweet on decline
                  if (Math.random() < 0.1) { // 10% chance per decaying tile
                    let msgArray = GENERIC_DECLINE_MESSAGES;
                    let specificMsg = null;
                    let jobContext = null;

                    if (!hasRoadAccess) msgArray = NO_ROAD_MESSAGES;
                    else if (pollution > 20) msgArray = POLLUTION_MESSAGES;
                    else if (!isCommuteOkay) {
                      if (netInfo && netInfo.jobTiles.length > 0) {
                        const nearest = getNearestTile(x, y, netInfo.jobTiles);
                        if (nearest) {
                          const jobTile = currentGridState[nearest.y][nearest.x];
                          const destName = getZoneName(jobTile.type, nearest.x, nearest.y);
                          const tmpl = SPECIFIC_COMMUTE_MESSAGES[Math.floor(Math.random() * SPECIFIC_COMMUTE_MESSAGES.length)];
                          specificMsg = tmpl.replace("{dest}", destName);
                          jobContext = { jobX: nearest.x, jobY: nearest.y };
                        }
                      }
                      if (!specificMsg) msgArray = LONG_COMMUTE_MESSAGES;
                    }

                    const context = { x, y, type: tile.type, isLeaving: true, ...jobContext };

                    if (specificMsg) {
                      queueMessage(specificMsg, null, context);
                    } else {
                      queueMessage(msgArray[Math.floor(Math.random() * msgArray.length)], null, context);
                    }
                  }
                }
              }
            }

          } else {
            // No road -> Decay
            if (tile.population > 0) {
              tile.population -= 1;
              resDeclineEvents.push({ x, y });

              if (Math.random() < 0.1) {
                const context = { x, y, type: tile.type, isLeaving: true };
                queueMessage(NO_ROAD_MESSAGES[Math.floor(Math.random() * NO_ROAD_MESSAGES.length)], null, context);
              }
            }
          }
          newPop += tile.population;

        } else if (tile.type === ZONES.COMMERCIAL) {
          // Commercial needs Residents nearby (Customer base)
          if (hasRoadAccess && networkId) {
            const netInfo = networks.get(networkId);
            let customerDist = 999;
            if (netInfo && netInfo.resTiles.length > 0) {
              customerDist = getNearestDistance(x, y, netInfo.resTiles);
            }

            if (customerDist <= 20 && cDemand > 0) {
              if (tile.population < 25 * tile.level) {
                if (Math.random() < (cDemand / 100)) {
                  tile.population += 1;
                  jobGrowthEvents.push({ x, y, type: tile.type });
                }
              }
            } else {
              // Decay if isolated or low demand OR Labor Shortage
              if (tile.population > 0) {
                // ISOLATION LOGIC
                if (customerDist > 20) {
                  tile.daysIsolated = (tile.daysIsolated || 0) + 1;
                  if (tile.daysIsolated >= 7) {
                    tile.population = 0; // BUSTED
                    tile.daysIsolated = 0;
                  }
                } else {
                  tile.daysIsolated = 0; // Connection restored
                }

                // Decay conditions: Very low demand OR Global Labor Shortage enforcement
                if (tile.population > 0 && (cDemand < -20 || Math.random() < jobCutChance)) {
                  if (Math.random() < 0.05 || Math.random() < jobCutChance) { // Use higher probability for labor enforcement
                    tile.population -= 1;
                    // Optional: Add decline event if we want to track it
                  }
                }
              } else {
                tile.daysIsolated = 0; // Reset if empty
              }
            }
          } else {
            if (tile.population > 0) {
              tile.population = 0; // Simplified bust
              // We should probably track job decline too, but prompt focuses on growth pairing
            }
          }

        } else if (tile.type === ZONES.INDUSTRIAL) {
          // Industry just needs workers (Residents) anywhere on network
          // Less sensitive to distance than Commercial
          if (hasRoadAccess && networkId) {
            const netInfo = networks.get(networkId);
            if (netInfo && netInfo.resTiles.length > 0 && iDemand > 0) {
              if (tile.population < 25 * tile.level) {
                if (Math.random() < (iDemand / 100)) {
                  tile.population += 1;
                  jobGrowthEvents.push({ x, y, type: tile.type });
                }
              }
            } else {
              // Decay if isolated or low demand OR Labor Shortage
              if (tile.population > 0) {
                const noWorkers = !netInfo || netInfo.resTiles.length === 0;

                // ISOLATION LOGIC
                if (noWorkers) {
                  tile.daysIsolated = (tile.daysIsolated || 0) + 1;
                  if (tile.daysIsolated >= 7) {
                    tile.population = 0; // BUSTED
                    tile.daysIsolated = 0;
                  }
                } else {
                  tile.daysIsolated = 0; // Connection restored
                }

                if (tile.population > 0 && (iDemand < -20 || Math.random() < jobCutChance)) {
                  if (Math.random() < 0.05 || Math.random() < jobCutChance) {
                    tile.population -= 1;
                  }
                }
              } else {
                tile.daysIsolated = 0; // Reset if empty
              }
            }
          } else {
            if (tile.population > 0) {
              tile.population = 0;
            }
          }
        }
      }
    }

    population.set(newPop);
    return nextGrid;
  });

  // 5. Update Denizens Table (Immutable-ish)
  denizens.update(currentDenizens => {
    let nextDenizens = [...currentDenizens];
    const currentGrid = get(grid);

    // Calculate Open Jobs (Vacancies)
    const workerCounts = new Map();
    for (const d of nextDenizens) {
      if (d.work && !d.left) {
        workerCounts.set(d.work, (workerCounts.get(d.work) || 0) + 1);
      }
    }

    const openJobs = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const tile = currentGrid[y][x];
        if (tile.type === ZONES.COMMERCIAL || tile.type === ZONES.INDUSTRIAL) {
          const addr = getAddress(x, y);
          const workers = workerCounts.get(addr) || 0;
          const vacancies = tile.population - workers;

          // Find connected networks for this job
          const jobNetworks = new Set();
          const neighbors = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
          ];
          for (const { dx, dy } of neighbors) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
              if (currentGrid[ny][nx].type === ZONES.ROAD) {
                const netId = roadNetworkMap[ny][nx];
                if (netId) jobNetworks.add(netId);
              }
            }
          }

          for (let k = 0; k < vacancies; k++) {
            openJobs.push({ x, y, type: tile.type, addr, networks: Array.from(jobNetworks) });
          }
        }
      }
    }
    // Shuffle vacancies
    for (let i = openJobs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [openJobs[i], openJobs[j]] = [openJobs[j], openJobs[i]];
    }

    const getAccessibleJobIndex = (homeAddr) => {
      const coords = addrToCoord(homeAddr);
      if (!coords) return -1;

      const homeNetworks = new Set();
      const neighbors = [
        { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
        { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
      ];
      for (const { dx, dy } of neighbors) {
        const nx = coords.x + dx;
        const ny = coords.y + dy;
        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
          if (currentGrid[ny][nx].type === ZONES.ROAD) {
            const netId = roadNetworkMap[ny][nx];
            if (netId) homeNetworks.add(netId);
          }
        }
      }

      return openJobs.findIndex(job => job.networks.some(netId => homeNetworks.has(netId)));
    };

    // Identify Migrations (Decline + Growth pair)
    // If we have both declines and growth, we can treat some as moves
    const moves = [];
    const leaving = [];
    const arriving = [];

    // Update Commute Status (Days Missed & Firing) & Unemployment
    for (let i = 0; i < nextDenizens.length; i++) {
      const d = nextDenizens[i];
      let updated = false;

      // Commute
      if (commuteSuccesses.has(d.id)) {
        if (d.daysMissed > 0) { d.daysMissed = 0; updated = true; }
      } else if (commuteFailures.has(d.id)) {
        d.daysMissed = (d.daysMissed || 0) + 1;
        updated = true;
        if (d.daysMissed >= 7) {
          if (d.work) queueMessage("Fired for not showing up!", d, { x: -1, y: -1 });
          d.work = null;
          d.daysMissed = 0;
          d.unemployedDays = 0;
          d.history.push({ type: 'fired', time: currentTime });
        }
      }

      // Unemployment
      if (!d.work && !d.left) {
        d.unemployedDays = (d.unemployedDays || 0) + 1;
        updated = true;
        if (d.unemployedDays > 30) {
          leaving.push({ x: -1, y: -1, denizenId: d.id });
        }
      } else if (d.work) {
        if (d.unemployedDays > 0) { d.unemployedDays = 0; updated = true; }
      }

      if (updated) nextDenizens[i] = { ...d };
    }

    // Create pools
    let declinePool = [...resDeclineEvents];
    let growthPool = [...resGrowthEvents];

    // Pair them up (Simple FIFO for now, could be distance based later)
    while (declinePool.length > 0 && growthPool.length > 0) {
      const from = declinePool.shift();
      const to = growthPool.shift();
      moves.push({ from, to });
    }

    // Remaining are actual leaves / arrivals
    leaving.push(...declinePool);
    arriving.push(...growthPool);

    // Handle Moves (Migrations)
    for (const move of moves) {
      const fromAddr = getAddress(move.from.x, move.from.y);
      const toAddr = getAddress(move.to.x, move.to.y);

      const idx = nextDenizens.findIndex(d => d.home === fromAddr && !d.left);
      if (idx !== -1) {
        // Mutate copy (or create new object for true immutability, but splicing array is already mutation)
        // Let's update the object in place for simplicity in this step, or clone if strict
        const denizen = { ...nextDenizens[idx] };

        // Update History
        denizen.history = [...(denizen.history || []), { type: 'move', time: currentTime, from: fromAddr, to: toAddr }];
        denizen.home = toAddr;

        // Update Work if needed (Assign new job if available in pool AND they don't have one)
        // Preventing job-hopping here prevents "leaking" jobs (leaving old jobs filled but ownerless)
        if (!denizen.work && openJobs.length > 0) {
          const jobIndex = getAccessibleJobIndex(denizen.home);
          if (jobIndex !== -1) {
            const jobEvent = openJobs.splice(jobIndex, 1)[0];
            denizen.work = jobEvent.addr;
            denizen.history.push({ type: 'new_job', time: currentTime, work: denizen.work });
          }
        }

        nextDenizens[idx] = denizen;

        // Queue Message for Move
        if (Math.random() < 0.1) {
          const context = { x: move.to.x, y: move.to.y, isGrowth: true }; // Treat as growth context for message location
          queueMessage(`Moved from ${fromAddr} to ${toAddr}. Fresh start!`, denizen, context);
        }
      } else {
        // If no denizen found to move (shouldn't happen if sync is perfect), treat as separate leave/arrive
        leaving.push(move.from);
        arriving.push(move.to);
      }
    }

    // Handle Existing Unemployed (Fix for "Not everyone has a workplace")
    // Prioritize giving new jobs to existing residents who need them
    if (openJobs.length > 0) {
      for (let i = 0; i < nextDenizens.length; i++) {
        if (openJobs.length === 0) break;

        const d = nextDenizens[i];
        if (!d.left && !d.work) {
          const jobIndex = getAccessibleJobIndex(d.home);
          if (jobIndex !== -1) {
            const jobEvent = openJobs.splice(jobIndex, 1)[0];
            const newWork = jobEvent.addr;

            // Update Denizen
            const updatedDenizen = { ...d };
            updatedDenizen.work = newWork;
            updatedDenizen.history = [...(d.history || []), { type: 'new_job', time: currentTime, work: newWork }];
            nextDenizens[i] = updatedDenizen;

            // Social Media Message for finding a job
            if (Math.random() < 0.3) {
              const msgs = [
                `Finally got a job at ${newWork}!`,
                `Hired! Starting work at ${newWork}.`,
                `Off to work at ${newWork}. So happy!`,
                `Unemployment over. Hello ${newWork}.`
              ];
              const txt = msgs[Math.floor(Math.random() * msgs.length)];
              queueMessage(txt, updatedDenizen, { x: jobEvent.x, y: jobEvent.y, type: jobEvent.type });
            }
          }
        }
      }
    }

    // Handle Declines (People leaving permanently)
    for (const event of leaving) {
      const addr = getAddress(event.x, event.y);
      // Find a denizen at this address
      const idx = nextDenizens.findIndex(d => d.home === addr && !d.left);
      if (idx !== -1) {
        const leavingDenizen = { ...nextDenizens[idx] };
        leavingDenizen.left = currentTime;
        leavingDenizen.history = [...(leavingDenizen.history || []), { type: 'left_city', time: currentTime }];

        // Assign to relevant queued messages
        for (const qMsg of queuedMessages) {
          if (qMsg.context && qMsg.context.isLeaving && qMsg.context.x === event.x && qMsg.context.y === event.y) {
            if (!qMsg.author) {
              qMsg.author = leavingDenizen;
            }
          }
        }

        // Keep them in the array but marked as left (Historical record)
        nextDenizens[idx] = leavingDenizen;
      }
    }

    // Handle Growth (New Denizens)
    const newCreatedDenizens = [];
    for (const event of arriving) {
      const homeAddr = getAddress(event.x, event.y);
      let workAddr = null;

      // Pair with a new job if available
      if (openJobs.length > 0) {
        const jobIndex = getAccessibleJobIndex(homeAddr);
        if (jobIndex !== -1) {
          const jobEvent = openJobs.splice(jobIndex, 1)[0];
          workAddr = jobEvent.addr;
        }
      }

      const newDenizen = {
        id: generateUserName() + Math.random(), // Unique ID
        name: generateUserName(),
        home: homeAddr,
        work: workAddr,
        since: currentTime,
        history: [{ type: 'move_in', time: currentTime, home: homeAddr }],
        isSystem: false,
        personality: pickPersonality(), // NEW: Personality trait
        playerInteractions: [] // NEW: Track player interactions
      };

      newCreatedDenizens.push(newDenizen);
      nextDenizens.push(newDenizen);
    }

    // Dispatch Queued Messages
    // We need to assign authors to the messages now that we have the new denizens
    for (const msg of queuedMessages) {
      let author = msg.author;

      if (!author && msg.context) {
        if (msg.context.isGrowth) {
          // Find one of the newly created denizens at this location OR a mover
          // Check new arrivals first
          let localDenizen = newCreatedDenizens.find(d => d.home === getAddress(msg.context.x, msg.context.y));

          // If not new, check if it was a mover (already in nextDenizens)
          if (!localDenizen) {
            const addr = getAddress(msg.context.x, msg.context.y);
            localDenizen = nextDenizens.find(d => d.home === addr && !d.left);
          }

          if (localDenizen) {
            author = localDenizen;
          }
        } else if (msg.context.isLeaving) {
          // Already handled in leaving loop mostly, but if missed:
          // Use a temp profile if we can't find the real one (already marked left)
        } else if (msg.context.x != null) {
          // Normal resident message
          const localDenizen = nextDenizens.find(d => d.home === getAddress(msg.context.x, msg.context.y) && !d.left);
          if (localDenizen) author = localDenizen;
        }
      }

      addMessage(msg.text, author, msg.context);
    }

    // --- RECONCILIATION STEP ---
    // Strict enforcement: Ensure denizen counts match Grid Population exactly.
    // This catches bulldozed zones, manual edits, or drift.

    // 1. Group active denizens by Home Address AND Work Address
    const denizensByAddress = new Map();
    const workersByAddress = new Map();

    for (let i = 0; i < nextDenizens.length; i++) {
      const d = nextDenizens[i];
      if (!d.left) {
        // Home Map
        if (d.home) {
          if (!denizensByAddress.has(d.home)) {
            denizensByAddress.set(d.home, []);
          }
          denizensByAddress.get(d.home).push(i);
        }
        // Work Map
        if (d.work) {
          if (!workersByAddress.has(d.work)) {
            workersByAddress.set(d.work, []);
          }
          workersByAddress.get(d.work).push(i);
        }
      }
    }

    // 2. Iterate Grid to validate
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const tile = currentGrid[y][x];
        const addr = getAddress(x, y);

        // --- RESIDENTIAL CHECKS ---
        const residentIndices = denizensByAddress.get(addr) || [];

        if (tile.type === ZONES.RESIDENTIAL) {
          // Check for Excess Denizens
          if (residentIndices.length > tile.population) {
            const excess = residentIndices.length - tile.population;
            for (let k = 0; k < excess; k++) {
              const idxToRemove = residentIndices.pop();
              const d = nextDenizens[idxToRemove];
              const updatedD = { ...d, left: currentTime, history: [...(d.history || []), { type: 'evicted', time: currentTime }] };
              nextDenizens[idxToRemove] = updatedD;
            }
          }
          // Check for Missing Denizens (Drift correction)
          else if (residentIndices.length < tile.population) {
            const diff = tile.population - residentIndices.length;
            for (let k = 0; k < diff; k++) {
              const newDenizen = {
                id: generateUserName() + Math.random(),
                name: generateUserName(),
                home: addr,
                work: null,
                since: currentTime,
                history: [{ type: 'drift_correction_spawn', time: currentTime, home: addr }],
                isSystem: false,
                personality: pickPersonality(), // NEW: Personality trait
                playerInteractions: [] // NEW: Track player interactions
              };
              nextDenizens.push(newDenizen);
            }
          }
        } else {
          // Not Residential: Evict illegal tenants
          if (residentIndices.length > 0) {
            for (const idx of residentIndices) {
              const d = nextDenizens[idx];
              const updatedD = { ...d, left: currentTime, history: [...(d.history || []), { type: 'evicted_bulldoze', time: currentTime }] };
              nextDenizens[idx] = updatedD;
            }
          }
        }

        // --- COMMERCIAL/INDUSTRIAL CHECKS (JOBS) ---
        const workerIndices = workersByAddress.get(addr) || [];

        if (tile.type === ZONES.COMMERCIAL || tile.type === ZONES.INDUSTRIAL) {
          // 1. Check for Excess Workers (More people claim to work here than capacity/population)
          if (workerIndices.length > tile.population) {
            const excess = workerIndices.length - tile.population;
            for (let k = 0; k < excess; k++) {
              const idxToFire = workerIndices.pop();
              const d = nextDenizens[idxToFire];
              // Fire them (work = null)
              const updatedD = { ...d, work: null, history: [...(d.history || []), { type: 'fired_excess', time: currentTime }] };
              nextDenizens[idxToFire] = updatedD;
              if (!d.isSystem) queueMessage("Laid off due to downsizing.", updatedD, { x, y, type: tile.type });
            }
          }
          // 2. Check for Missing Workers
          else if (workerIndices.length < tile.population) {
            // Do nothing here. We do NOT spawn commuters.
            // The grid population will be corrected (contracted) in the next phase to match the worker count.
          }
        }
      }
    }

    // 3. Final Pass: Found orphans
    // If a denizen works at an address that is no longer a valid workplace, fire them.
    for (let i = 0; i < nextDenizens.length; i++) {
      const d = nextDenizens[i];
      if (!d.left && d.work) {
        const coords = addrToCoord(d.work);
        let validJob = false;
        // Valid if it maps to a coord AND that coord is C/I
        if (coords) {
          const tile = currentGrid[coords.y][coords.x];
          if (tile.type === ZONES.COMMERCIAL || tile.type === ZONES.INDUSTRIAL) {
            validJob = true;
          }
        }

        if (!validJob) {
          const updatedD = { ...d, work: null, history: [...(d.history || []), { type: 'workplace_demolished', time: currentTime }] };
          nextDenizens[i] = updatedD;
        }
      }
    }

    return nextDenizens;
  });

  // 6. GRID CONTRACTION (Self-Containment Enforcement)
  {
    const finalDenizens = get(denizens);
    const workerCounts = new Map();
    for (const d of finalDenizens) {
      if (!d.left && d.work) {
        workerCounts.set(d.work, (workerCounts.get(d.work) || 0) + 1);
      }
    }

    grid.update(g => {
      // Must map to trigger reactivity on deep change if reference changes
      return g.map((row, y) => row.map((tile, x) => {
        if (tile.type === ZONES.COMMERCIAL || tile.type === ZONES.INDUSTRIAL) {
          const addr = getAddress(x, y);
          const workers = workerCounts.get(addr) || 0;
          if (tile.population > workers) {
            // Contract grid population to match reality
            return { ...tile, population: workers };
          }
        }
        return tile;
      }));
    });
  }

  // Social Media / Messages (Global Events)
  if (resGrowthEvents.length > 0) {
    if (Math.random() < 0.05) {
      const msgs = [
        "Moving in today! So excited.",
        "Boxes unpacked. Hello city!",
        "Just got the keys to my new place.",
        "New in town, looking for recommendations.",
        "Wow, this city is growing fast!"
      ];
      // Pick a random NEW denizen (excluding commuters)
      const newDenizens = get(denizens).filter(d => d.since === currentTime && !d.isSystem);
      if (newDenizens.length > 0) {
        const author = newDenizens[Math.floor(Math.random() * newDenizens.length)];
        addMessage(msgs[Math.floor(Math.random() * msgs.length)], author);
      }
    }
  }

  // Random events / thoughts
  if (Math.random() < 0.01) {
    const thoughts = [
      "I love the smell of industry in the morning.",
      "We need more parks!",
      "Traffic is getting bad.",
      "Is there a coffee shop nearby?",
      "The mayor is doing a great job... I think.",
      "Why is the power always out? Oh wait, it works."
    ];
    // Pick random existing denizen
    addMessage(thoughts[Math.floor(Math.random() * thoughts.length)]);
  }

  // Process pending denizen responses to player @mentions
  const currentMentions = get(pendingMentions);
  const mentionsToRespond = currentMentions.filter(m => m.respondAt === currentTime);
  
  for (const mention of mentionsToRespond) {
    const denizen = get(denizens).find(d => d.name === mention.denizenName && !d.left);
    if (denizen) {
      if (mention.forcedResponse) {
        // Dog pile override!
        addMessage(mention.forcedResponse, denizen);
      } else {
        const sentiment = analyzeSentiment(mention.playerTweet, denizen);
        const response = generateDenizenResponse(denizen, mention.playerTweet, sentiment);
        addMessage(response, denizen);
      }
    }
  }
  
  // Clean up processed mentions
  pendingMentions.update(m => m.filter(x => x.respondAt > currentTime));
  
  // Denizen initiates @mention to Mayor (~every 120 ticks, max 1 per tick)
  if (get(time) % 120 === 0 && Math.random() < 0.3) {
    const currentDenizens = get(denizens);
    const struggling = currentDenizens.filter(d => 
      !d.left && (d.unemployedDays > 10 || d.daysMissed > 3 || (d.work && get(time) - d.since > 50))
    );
    
    if (struggling.length > 0) {
      const denizen = struggling[Math.floor(Math.random() * struggling.length)];
      const request = generateDenizenRequest(denizen);
      addMessage(request, denizen);
    }
  }

  // Tax income every 5 ticks
  if (get(time) % 5 === 0) {
    money.update(m => m + Math.floor(get(population) * 0.5));
  }
}

function getNearestDistance(x, y, targetTiles) {
  let minDist = 999;
  for (const t of targetTiles) {
    const dist = Math.sqrt(Math.pow(t.x - x, 2) + Math.pow(t.y - y, 2));
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

function calculatePollution(gridState) {
  const pGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

  // Find all pollution sources
  const sources = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (gridState[y][x].type === ZONES.INDUSTRIAL) {
        sources.push({ x, y, intensity: 10 + gridState[y][x].population }); // More pop = more smog
      }
    }
  }

  // Apply pollution radius
  if (sources.length > 0) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        let totalPollution = 0;
        for (const src of sources) {
          const dist = Math.sqrt(Math.pow(src.x - x, 2) + Math.pow(src.y - y, 2));
          if (dist < 8) { // Pollution radius
            totalPollution += src.intensity / (dist + 1); // Falloff
          }
        }
        pGrid[y][x] = totalPollution;
      }
    }
  }
  return pGrid;
}

function findAccessPoints(cx, cy, gridState) {
  const points = [];
  // Check self and neighbors
  const checks = [{ dx: 0, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];

  for (const { dx, dy } of checks) {
    const nx = cx + dx;
    const ny = cy + dy;
    if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
      if (gridState[ny][nx].type === ZONES.ROAD) {
        points.push({ x: nx, y: ny });
      }
    }
  }
  return points;
}

function getPath(starts, ends, gridState) {
  if (!starts || starts.length === 0 || !ends || ends.length === 0) return null;

  const endSet = new Set(ends.map(e => `${e.x},${e.y}`));
  const queue = starts.map(s => ({ x: s.x, y: s.y, path: [{ x: s.x, y: s.y }] })); // Include start in path
  const visited = new Set(starts.map(s => `${s.x},${s.y}`));

  while (queue.length > 0) {
    const { x, y, path } = queue.shift();

    if (endSet.has(`${x},${y}`)) {
      return path;
    }

    const neighbors = [
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
      { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
    ];

    for (const { dx, dy } of neighbors) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
        if (!visited.has(`${nx},${ny}`) && gridState[ny][nx].type === ZONES.ROAD) {
          visited.add(`${nx},${ny}`);
          queue.push({ x: nx, y: ny, path: [...path, { x: nx, y: ny }] });
        }
      }
    }
  }
  return null; // No path found
}

// Helper: Analyze Road Networks (Flood Fill)
function analyzeNetworks(gridState) {
  const networks = new Map();
  const roadNetworkMap = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
  let nextNetworkId = 1;
  const visited = new Set();

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (gridState[y][x].type === ZONES.ROAD && !visited.has(`${x},${y}`)) {
        const networkId = nextNetworkId++;
        // Store coordinates of connected zones
        networks.set(networkId, { jobTiles: [], resTiles: [], roadCount: 0 });

        const queue = [{ x, y }];
        visited.add(`${x},${y}`);
        roadNetworkMap[y][x] = networkId;
        networks.get(networkId).roadCount++; // Count initial road tile

        while (queue.length > 0) {
          const { x: cx, y: cy } = queue.shift();

          const neighbors = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
          ];

          neighbors.forEach(({ dx, dy }) => {
            const nx = cx + dx;
            const ny = cy + dy;

            if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
              const neighborTile = gridState[ny][nx];

              if (neighborTile.type === ZONES.ROAD) {
                if (!visited.has(`${nx},${ny}`)) {
                  visited.add(`${nx},${ny}`);
                  roadNetworkMap[ny][nx] = networkId;
                  networks.get(networkId).roadCount++;
                  queue.push({ x: nx, y: ny });
                }
              } else {
                // Check adjacent zones to add to network stats
                // Note: A zone touches the network at (cx, cy)
                // We add the ZONE'S coordinates (nx, ny) to the lists
                const netInfo = networks.get(networkId);
                if (neighborTile.type === ZONES.RESIDENTIAL) {
                  // Avoid duplicates if multiple road tiles touch same zone
                  if (!netInfo.resTiles.some(t => t.x === nx && t.y === ny)) {
                    netInfo.resTiles.push({ x: nx, y: ny });
                  }
                } else if (neighborTile.type === ZONES.COMMERCIAL || neighborTile.type === ZONES.INDUSTRIAL) {
                  if (!netInfo.jobTiles.some(t => t.x === nx && t.y === ny)) {
                    netInfo.jobTiles.push({ x: nx, y: ny });
                  }
                }
              }
            }
          });
        }
      }
    }
  }
  return { roadNetworkMap, networks };
}

// Helper: Check neighbors
function isNear(gridState, x, y, type) {
  const neighbors = [
    { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
    { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
  ];

  return neighbors.some(({ dx, dy }) => {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
      return gridState[ny][nx].type === type;
    }
    return false;
  });
}

// Action: Build
export function build(x, y, toolType) {

  const currentMoney = get(money);
  const cost = COSTS[toolType];

  if (currentMoney >= cost) {
    // Check for road bulldozing
    const currentGrid = get(grid);
    const oldTile = currentGrid[y][x];

    if (oldTile.type === ZONES.ROAD && toolType !== ZONES.ROAD) {
      // Road is being removed or replaced
      if (Math.random() < 0.7) { // High chance to complain
        const addr = getStreetAddress(x, y);
        const complaints = [
          `@Mayor Hey! I used the road at ${addr} to get to work!`,
          `@Mayor My commute just got ruined by work at ${addr}.`,
          `@Mayor Why are we destroying infrastructure at ${addr}?`,
          `@Mayor Now I have to take the long way around ${addr}.`,
          `@Mayor Bulldozers at ${addr} woke me up!`
        ];
        addMessage(complaints[Math.floor(Math.random() * complaints.length)]);
      }
    } else if (oldTile.type !== toolType && toolType !== ZONES.EMPTY && toolType !== ZONES.ROAD) {
      // Zoning change (e.g. Empty -> Residential, or Residential -> Commercial)
      if (Math.random() < 0.4) {
        const addr = getStreetAddress(x, y);
        const zoneName = getZoneName(toolType, x, y);

        let comments = [];
        if (toolType === ZONES.RESIDENTIAL) {
          comments = [
            `New housing coming to ${addr}. Nice!`,
            `Looks like they are building ${zoneName}.`,
            `More neighbors at ${addr}. Hope they are quiet.`,
            `Finally developing the lot at ${addr}.`
          ];
        } else if (toolType === ZONES.COMMERCIAL) {
          comments = [
            `Ooh, a new shop opening at ${addr}?`,
            `I heard ${zoneName} is being built.`,
            `Traffic is going to be bad at ${addr} with all the shoppers.`,
            `Can't wait to visit ${zoneName}!`
          ];
        } else if (toolType === ZONES.INDUSTRIAL) {
          comments = [
            `Ugh, they are building a factory at ${addr}.`,
            `There goes the neighborhood. ${zoneName} is huge.`,
            `More jobs at ${addr}, but at what cost?`,
            `I hope ${zoneName} doesn't smell bad.`
          ];
        } else if (toolType === ZONES.PARK) {
          comments = [
            `Yay! A new park at ${addr}.`,
            `Love that they preserved green space at ${addr}.`,
            `Going to take my dog to ${zoneName}.`,
            `Picnic time at ${addr}!`
          ];
        }

        if (comments.length > 0) {
          addMessage(comments[Math.floor(Math.random() * comments.length)]);
        }
      }
    }

    money.update(m => m - cost);
    grid.update(g => {
      const newGrid = [...g];
      newGrid[y][x] = {
        ...newGrid[y][x],
        type: toolType,
        population: 0,
        level: 1
      };
      return newGrid;
    });
  }
}
