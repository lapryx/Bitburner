/** @param {NS} ns */
import { scan_root } from './scan_root.js';
import { scan } from './scan.js';

/*  
  ToDo:
    - change ram check to use an array for predetermined values
    - add functionality using formulas when aquired (and check if its available)
    - add regular check for nuking
    - recheck usable hosts at set intervals (15 min) or if possible when manually triggered after e.g. buying a new hack
    - make it loop then wait for the first script to be released (the if is running doesnt do anything at the moment)
    - create function that finds the optimal ratio of hack/grow and weaken to keep max hack (if needed in 2 cycles)`

*/

export async function main(ns) {
	let hostsCheck = await scan(ns,"home");
	let hosts = await scan_root(ns,hostsCheck);
	let host = "home";
	let ram = 0;
	let threads = 0;
	let action = "hack";
	let target = arguments[0].args[0];
	let script = "";
	let securityThresh = ns.getServerMinSecurityLevel(target) * 1.5;
	let moneyThresh = ns.getServerMaxMoney(target) * 0.75;


while(true) {
	for (let  i = 0; i < hosts.length; i++) {
		host = hosts[i];
		if ( !ns.hasRootAccess(host) ) { break; }
		if (ns.getServerSecurityLevel(target) > securityThresh) {
			action = "weaken";
		} else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
			action = "grow";
		} else {
			action = "hack";
		}
		script = action + ".js";
		ram = ns.getScriptRam(script);
		threads = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ram); 
		if (threads > 0){
			if ( !ns.fileExists(script,host)) {
				ns.scp(script,host)
			}
			await ns.exec(script, host, threads, target);
			while(ns.isRunning(script, "home", target)) {
				await ns.sleep(500);
			}
		}
		await ns.sleep(500);
		//
	}
	await ns.sleep(500);
} 



	/* What does this function need to do:
	 * 		- find a decent target (until formulas is aquired)
	 * 		- update the target with a formula after formulas is aquired (check if its available?)
	 * 		- find usable servers (do they need a backdoor?)
	 * 		- calculate hack, grow and weaken threads and divide them over usable servers
	 * 		- occasionally update target and usable servers (15 min?)
	 * 		
	 */

}