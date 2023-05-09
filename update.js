/** @param {NS} ns */
export async function main(ns) {
	wget("https://raw.githubusercontent.com/lapryx/Bitburner/main/clone.js","clone.js");
	exec("clone.js","home");
}