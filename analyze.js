/** @param {NS} ns */
import { scan } from './scan.js';

export async function main(ns) {
	let hosts = await scan(ns,"home");
	for (let i = 0; i < hosts.length; i++){
		ns.tprint(i);
	}

}