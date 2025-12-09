
import { grid, tick, denizens, population, ZONES, getAddress, build, money, selectedTool } from './src/store.js';
import { get } from 'svelte/store';

const originalRandom = Math.random;
let randomVal = 0.5;
Math.random = () => randomVal;
function setRandom(val) { randomVal = val; }

function reset() {
    grid.set(Array(20).fill(null).map(() =>
        Array(20).fill(null).map(() => ({
            type: ZONES.EMPTY,
            population: 0,
            level: 1,
            traffic: 0
        }))
    ));
    denizens.set([]);
    population.set(0);
}

console.log('Test: Commute Firing Logic (7 Days)');
reset();

// Setup:
// A1(0,0): Road
// B1(1,0): Road
// C1(2,0): Road
// A2(0,1): Residential
// C2(2,1): Commercial (Work)
selectedTool.set(ZONES.ROAD);
build(0, 0, ZONES.ROAD);
build(1, 0, ZONES.ROAD);
build(2, 0, ZONES.ROAD);

grid.update(g => {
    // A2 Res
    g[1][0].type = ZONES.RESIDENTIAL;
    g[1][0].population = 20; // Increase pop so they don't all leave immediately

    // C2 Com
    g[1][2].type = ZONES.COMMERCIAL;
    g[1][2].population = 20;
    // Neighbors of A2: A1(0,0) Road - Access OK
    // Neighbors of C2: C1(2,0) Road - Access OK
    return g;
});

// Force create denizen manually or tick?
// Tick is better to ensure state is clean.
console.log('Growing denizen...');
setRandom(0.001); // Force growth
tick(); // Tick 1: growth

// Fill with dummies to buffer leaving
denizens.update(ds => {
    const dummies = [];
    for (let k = 0; k < 15; k++) {
        dummies.push({
            id: `dummy_${k}`,
            name: `Dummy${k}`,
            home: getAddress(0, 1),
            work: getAddress(2, 1),
            since: 0,
            history: [],
            daysMissed: 0
        });
    }
    // Add Test Subject LAST so they are last to be picked for leaving (if fifo)
    // Actually findIndex finds first match. So Dummies first.
    return [...ds, ...dummies, {
        id: 'test_subject',
        name: 'TargetSim',
        home: getAddress(0, 1),
        work: getAddress(2, 1),
        since: 0,
        history: [],
        daysMissed: 0
    }];
});

let dList = get(denizens);
let target = dList.find(d => d.id === 'test_subject');
console.log(`Target Denizen: ${target.name}, Work: ${target.work}`);

// Break Commute
console.log('Breaking Commute (Removing B1)...');
selectedTool.set(ZONES.EMPTY);
build(1, 0, ZONES.EMPTY);

// Tick 1-6: Should increment daysMissed but NOT fire.
for (let i = 1; i <= 6; i++) {
    tick();
    const d = get(denizens).find(d => d.id === 'test_subject');
    // Check internal state if possible? 
    // Actually `daysMissed` is on the object in store.
    console.log(`Day ${i}: daysMissed=${d.daysMissed}, Work=${d.work}, Left=${d.left}`);
    if (d.work === null) {
        console.log(`FAIL: Fired too early on day ${i}`);
    }
}

// Tick 7: Should fire.
console.log('Day 7: Expecting firing...');
tick();
const dFinal = get(denizens).find(d => d.id === 'test_subject');
console.log(`Day 7: Work=${dFinal.work}, Left=${dFinal.left}`);
// Note: lostJob sets work to null eventually?
// In my code: `d.lostJob = true`. 
// Does `store.js` update clear `work` property?
// Looking at store logic...
// Access step 5 (Update Denizens Table):
// `const brokenCommuteDenizens = new Set(currentDenizens.filter(d => d.lostJob).map(d => d.id));`
// Wait, I saw `brokenCommuteDenizens` earlier in tick, but didn't verify if it's used to clear job.
// `denizens.update` step starts line 567.
// I don't see `lostJob` handling there explicitly in the original provided partial code.
// Wait, step 4 sets `d.lostJob = true`.
// Step 5 should ideally handle it.
// SimTwitty usually handles `lostJob` by clearing `work`.
// If not, I missed a step in implementation plan?
// Let's check `store.js` step 5 logic again or rely on verification output.
// If verification fails, I know I need to update step 5.

if (dFinal.work === null || dFinal.lostJob === true) {
    console.log('PASS: Denizen fired after 7 days.');
} else {
    console.log('FAIL: Denizen still employed.');
}
