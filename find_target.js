/** @param {NS} ns */
export function find_optimal_target(ns, hosts) {
	let target = "";
    let moneyPerSec = 0;
    let moneyPerSecHost = 0;
	let player = ns.getPlayer();
    let level = ns.getHackingLevel();
    let host = "";
	let hackPercent = 0;
	let hackTime = 0;
	let minSecurityLevel = 0;
	for (let  i = 0; i < hosts.length; i++) {
		host = hosts[i];
		minSecurityLevel = Math.floor(ns.getServerBaseSecurityLevel(host)/3,1)
		hackPercent = Math.min(Math.max(((1.75*level)-ns.getServerRequiredHackingLevel(host))/(1.75*level)*(((100-minSecurityLevel)/100)*(player.mults.hacking_chance)),0),1);
		hackTime = (5*((2.5*(ns.getServerRequiredHackingLevel(host)*minSecurityLevel)+500)/(level+50))/player.mults.hacking_speed);
		if ( ns.getServerMaxMoney(host) > 0 && ns.getServerRequiredHackingLevel(host) <= level ) {
			moneyPerSecHost = ((ns.getServerMaxMoney(host))*
				(100-ns.getServerBaseSecurityLevel(host)/100)*
				(level-(ns.getServerRequiredHackingLevel(host)-1))/level*
				(player.mults.hacking_money)/24000*
				(hackPercent)/(hackTime));
		}
		if (moneyPerSecHost > moneyPerSec) {
			moneyPerSec = moneyPerSecHost;
			target = host;
		}
	}
	return target;

}