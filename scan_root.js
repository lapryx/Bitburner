/** @param {NS} ns */
export async function scan_usable(ns,hosts) {
	let rootHosts = [];
	for ( let i = 0; i < hosts.length; i++){
		if (ns.hasRootAccess(hosts[i]) && ns.getServerMaxRam(hosts[i]) > 0){
			rootHosts.indexOf(hosts[i]) === -1 ? rootHosts.push(hosts[i].toString()) : await ns.sleep(0);
		}
	}
	return rootHosts;
}