/** @param {import(".").NS } ns */
import { scan_usable } from './scan_root.js';
import { scan } from './scan.js';
import { find_optimal_target } from './find_target.js';
/*  
  ToDo:
	- change ram check to use an array for predetermined values
	- add functionality using formulas when aquired (and check if its available) finding target has been done
	- add regular check for nuking
	- recheck usable hosts at set intervals (15 min) or if possible when manually triggered after e.g. buying a new hack
	- make it loop then wait for the first script to be released (the if is running doesnt do anything at the moment)
	- create function that finds the optimal ratio of hack/grow and weaken to keep max hack (if needed in 2 cycles)`
	- test
*/

export async function master_formulas(ns,hosts){
	let host = "";
	let target = "";
	var ram = 0;
	var threads = 0;
	var action = "hack";
	var script = "";
	/* 
		formula = MAX(($maxMoney)*((100-$averageSecurityLevel/100)*(($hackingLevel-($averageHackLevel-1))/$hackingLevel)*($moneyPct/100)/24000),0)*($hackPct)/$minSec
	*/
	while(true) {
		target = find_optimal_target(ns,hosts);
		let securityThresh = ns.getServerMinSecurityLevel(target) * 1.5;
		let moneyThresh = ns.getServerMaxMoney(target) * 0.85;
		for (let s = 0; s < 50; s++) {
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
				}
				await ns.sleep(500);
			}
		}
		await ns.sleep(500);
	} 
}

export async function master_basic(ns,hosts,target){
	let securityThresh = ns.getServerMinSecurityLevel(target) * 1.5;
	let moneyThresh = ns.getServerMaxMoney(target) * 0.85;
	let host = "";
	let script = "";
	let ram = 0;
	let action = "";
	let threads = 0;
	
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
}

export async function main(ns) {
	var hostsCheck = await scan(ns,"home");
	var hosts = await scan_usable(ns,hostsCheck);
	var host = "home";
	var formulas_available = ns.fileExists("Formulas.exe");

	if (formulas_available) {
		await master_formulas(ns,hosts);
	} else {
		let target = arguments[0].args[0];
		await master_basic(ns,hosts,target);
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