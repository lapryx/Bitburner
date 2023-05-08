/** @param {NS} ns */
export async function scan(ns,target) {
	let current = "";
	let hosts = ns.scan(target);
	for (let i = 0; i < hosts.length; i++){
		current = hosts[i].toString();
		if (current != "home") {
		let hostsCurrent = ns.scan(current);
		for ( let x = 0; x < hostsCurrent.length; x++){
			if (hostsCurrent[x].toString() != "home"){
				hosts.indexOf(hostsCurrent[x]) === -1 ? hosts.push(hostsCurrent[x].toString()) : await ns.sleep(0);
			}
		}
		}
	}
	return hosts;
}