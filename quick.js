/** @param {NS} ns */
export async function main(ns) {
	let time = 0;
	let player = ns.getPlayer();
	let level = ns.getHackingLevel();
	let target = "max-hardware";
	let minSecurityLevel = Math.floor(ns.getServerSecurityLevel(target),1);
	time = (20*((2.5*(minSecurityLevel*ns.getServerRequiredHackingLevel(target))+500)/(level+50))/(player.mults.hacking_speed));
	ns.tprint("minseclvl: " + minSecurityLevel)
	ns.tprint(time);
}