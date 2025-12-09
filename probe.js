import { writable, get } from 'svelte/store';
console.log('Svelte store loaded successfully');
const s = writable(1);
console.log(get(s));
