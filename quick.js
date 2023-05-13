/** @param {NS} ns */
export async function main(ns) {
	let threads = {threads: 5} 
	ns.tprint("earned: " + await ns.hack("n00dles",threads))
}