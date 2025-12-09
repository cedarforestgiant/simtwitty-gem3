
import { grid, tick, denizens, population, ZONES, getAddress, build, money, selectedTool } from './src/store.js';
import { get } from 'svelte/store';

// Mock random for deterministic tests
const originalRandom = Math.random;
let randomVal = 0.5;
Math.random = () => randomVal;

function setRandom(val) {
    randomVal = val;
}

function reset() {
    grid.set(Array(20).fill(null).map(() => 
        Array(20).fill(null).map(() => ({
            type: ZONES.EMPTY,
            population: 0,
            level: 1,
            hasPower: true,
            hasWater: true
        }))
    ));
    denizens.set([]);
    population.set(0);
    money.set(5000);
}

// Test 1: Denizen Creation on Growth
console.log('Test 1: Denizen Creation on Growth');
reset();

// Build Road at 0,0 (A1) and 1,0 (B1)
selectedTool.set(ZONES.ROAD);
build(0, 0, ZONES.ROAD);
build(1, 0, ZONES.ROAD);

// Build Residential at 0,1 (A2)
selectedTool.set(ZONES.RESIDENTIAL);
build(0, 1, ZONES.RESIDENTIAL);

// Build Commercial at 1,1 (B2) - Job Source
selectedTool.set(ZONES.COMMERCIAL);
build(1, 1, ZONES.COMMERCIAL);

// Force growth conditions
// Residential demand is high by default (50)
// Need to tick enough times or force population
// Let's rely on tick logic. 
// Residential at (0,1) needs road access (has it via (0,0)) and jobs nearby (has it via (1,1))

// Set random to ensure growth
setRandom(0.001); // Low random for high success chance in `if (Math.random() < growthChance)`

// Run a few ticks
for(let i=0; i<10; i++) {
    tick();
}

const pop = get(population);
const denizenList = get(denizens);

console.log(`Population: ${pop}`);
console.log(`Denizens: ${denizenList.length}`);

if (pop > 0 && denizenList.length === pop) {
    console.log('PASS: Population matches Denizen count');
    const d = denizenList[0];
    console.log(`Denizen 1: ${d.name}, Home: ${d.home}, Work: ${d.work}, Since: ${d.since}`);
    
    if (d.home === getAddress(0, 1)) {
        console.log('PASS: Home address correct');
    } else {
        console.log(`FAIL: Home address mismatch. Expected ${getAddress(0,1)}, got ${d.home}`);
    }
} else {
    console.log('FAIL: Population growth did not trigger denizen creation correctly');
}


// Test 2: Denizen Leaving (Decline)
console.log('\nTest 2: Denizen Leaving');
// Force a bad condition. Remove the road.
setRandom(0.001); // Keep random low so decay happens if condition met?
// Actually decay check: if (!isCommuteOkay || pollution > 20 || growthChance < -0.2)
// Removing road triggers "No road -> Decay" block directly.

selectedTool.set(ZONES.EMPTY); // Bulldoze road
build(0, 0, ZONES.EMPTY);

// Tick to process decay
tick();

const popAfter = get(population);
const denizensAfter = get(denizens);

console.log(`Population After Decay: ${popAfter}`);
console.log(`Denizens After Decay: ${denizensAfter.length}`);

if (popAfter < pop && denizensAfter.length === popAfter) {
    console.log('PASS: Denizen removed on population decline');
} else {
    console.log('FAIL: Denizen not removed correctly');
}

