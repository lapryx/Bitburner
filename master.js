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
	- keep count of when we have enough weaken or grow to reach the threshold and then skip that check
*/


/*
	program description:
	1. scan for all hosts
	2. nuke all possible hosts (using nuke.js)
	3. create a list of usable hosts (using scan_root.js should be renamed)
	4. find the optimal target
	5. run the hacking script
	    a. check if host is usable
		b. calculate the thresholds for target
		c. check for the action to be taken
		d. check if script is available
		e. run the script
		f. sleep until first script to be released 
	6. loop 

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

export async function master_basic(ns,hosts){
	let target = "";
	let host = "";
	let script = "";
	let ram = 0;
	let action = "";
	let threads = 0;
	let time = 50;
	let level = 0;
	let player = ns.getPlayer();
	var hostsCheck = await scan(ns,"home");
	
	while(true) {
		level = ns.getHackingLevel();
		var hosts = await scan_usable(ns,hostsCheck);
		target = find_optimal_target(ns,hosts);
		let securityThresh = ns.getServerMinSecurityLevel(target) * 1.5;
		let moneyThresh = ns.getServerMaxMoney(target) * 0.85;
		for (let s = 0; s < 50; s++) {
		for (let  i = 0; i < hosts.length; i++) {
			let securityLevel = ns.getServerSecurityLevel(target);
			host = hosts[i];
			if ( !ns.hasRootAccess(host) ) { break; }
			if (ns.getServerSecurityLevel(target) > securityThresh) {
				action = "weaken";
				//using actual security level here as it is of course not yet weakened to the min sec level
				time = (20*((2.5*(securityLevel*ns.getServerRequiredHackingLevel(target))+500)/(level+50))/(player.mults.hacking_speed));
			} else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
				action = "grow";
				time = (16*((2.5*(securityLevel*ns.getServerRequiredHackingLevel(target))+500)/(level+50))/(player.mults.hacking_speed));
			} else {
				action = "hack";
				time = (5*((2.5*(ns.getServerRequiredHackingLevel(target)*securityLevel)+500)/(level+50))/player.mults.hacking_speed)
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
					await ns.sleep(50);
				}
			}
			await ns.sleep(50);
			//
		} await ns.sleep(time*1000+50);
		}
		await ns.sleep(500);
	} 
}

export async function main(ns) {
	var hostsCheck = await scan(ns,"home");
	var hosts = await scan_usable(ns,hostsCheck);
	var host = "home";
	var formulas_available = ns.fileExists("Formulas.exe");
	while (true) {
		formulas_available = ns.fileExists("Formulas.exe");
		// run nuke script on all servers to ensure they are up to date
	if (formulas_available) {
		await master_formulas(ns,hosts);
	} else {
		await master_basic(ns,hosts);
	}
	await ns.sleep(100);
	}


}