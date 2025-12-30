
import { grid, tick, ZONES } from './src/store.js';
import { get } from 'svelte/store';

// Mock random to be deterministic
Math.random = () => 0.5;

function setup() {
    // Reset grid
    const newGrid = Array(20).fill(null).map(() =>
        Array(20).fill(null).map(() => ({
            type: ZONES.EMPTY,
            population: 0,
            level: 1,
            traffic: 0,
            daysIsolated: 0
        }))
    );

    // Helper to set tile
    const set = (addr, type, pop = 0) => {
        const colChar = addr.match(/[A-Z]+/)[0];
        const rowNum = parseInt(addr.match(/\d+/)[0]);
        const y = colChar.charCodeAt(0) - 65; // A=0
        const x = rowNum - 1; // 1=0
        if (newGrid[y] && newGrid[y][x]) {
            newGrid[y][x].type = type;
            newGrid[y][x].population = pop;
        }
    };

    // Construct User's Map based on description
    // Left side (Connected to Res)
    set('E7', ZONES.RESIDENTIAL, 50);
    set('F7', ZONES.RESIDENTIAL, 50);
    
    set('D7', ZONES.ROAD);
    set('D8', ZONES.ROAD);
    set('D9', ZONES.ROAD);
    set('D10', ZONES.ROAD); // x=9
    
    set('E8', ZONES.ROAD);
    set('F8', ZONES.ROAD);

    // Right side (Connected to Ind)
    set('E13', ZONES.INDUSTRIAL, 50);
    set('F13', ZONES.INDUSTRIAL, 50);
    
    set('D12', ZONES.ROAD); // x=11
    set('D13', ZONES.ROAD);
    
    set('E11', ZONES.ROAD); // x=10
    set('F11', ZONES.ROAD);
    set('F12', ZONES.ROAD);

    // The Gap
    // D11 (x=10) is EMPTY (Bulldozed)
    // E10 (x=9) is EMPTY (Implied)
    // F10 (x=9) is EMPTY (Implied)

    grid.set(newGrid);
}

console.log('Test: Reproduce User Issue');
setup();

// Verify Initial State
let g = get(grid);
let indTile = g[12][4]; // E13 (y=4, x=12)
console.log(`Initial E13 Type: ${indTile.type}, Pop: ${indTile.population}`);

// Run 7 days
for (let i = 1; i <= 8; i++) {
    tick();
    g = get(grid);
    indTile = g[4][12]; // E13
    console.log(`Day ${i}: E13 Pop = ${indTile.population}, DaysIsolated = ${indTile.daysIsolated}`);
}
