
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
            traffic: 0,
            daysIsolated: 0
        }))
    ));
    denizens.set([]);
    population.set(0);
}

console.log('Test: Zone Bust Logic (7 Days Isolation)');
reset();

// Setup:
// A1(0,0): Road
// B1(1,0): Road
// C1(2,0): Road
// A2(0,1): Residential
// C2(2,1): Industrial (Work)
selectedTool.set(ZONES.ROAD);
build(0, 0, ZONES.ROAD);
build(1, 0, ZONES.ROAD);
build(2, 0, ZONES.ROAD);

grid.update(g => {
    // A2 Res
    g[1][0].type = ZONES.RESIDENTIAL;
    g[1][0].population = 50;

    // C2 Ind
    g[1][2].type = ZONES.INDUSTRIAL;
    g[1][2].population = 50;
    return g;
});

// Verify Initial State
tick();
let g = get(grid);
let indTile = g[1][2];
console.log(`Initial Ind Pop: ${indTile.population}, Type: ${indTile.type}`);

// Break Connection
console.log('Breaking Road Connection (Removing B1)...');
selectedTool.set(ZONES.EMPTY);
build(1, 0, ZONES.EMPTY);

// Run 6 days (Should NOT bust yet)
for (let i = 1; i <= 6; i++) {
    tick();
    g = get(grid);
    indTile = g[1][2];
    console.log(`Day ${i}: Ind Pop = ${indTile.population}, DaysIsolated = ${indTile.daysIsolated || 0}`);
    if (indTile.population === 0) {
        console.log('FAIL: Busted too early!');
    }
}

// Run 7th day (Should Bust)
console.log('Day 7: Checking for Bust...');
tick();
g = get(grid);
indTile = g[1][2];
console.log(`Day 7: Ind Pop = ${indTile.population}, DaysIsolated = ${indTile.daysIsolated || 0}`);

if (indTile.population === 0) {
    console.log('PASS: Zone population dropped to zero.');
} else {
    console.log('FAIL: Zone population did not drop to zero.');
}
