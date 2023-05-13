/** @param {import(".").NS } ns */
import { scan_usable } from './scan_root.js';
import { scan } from './scan.js';
import { find_optimal_target } from './find_target.js';
import { main as nuke } from './nuke.js';
/*  
  ToDo:
	- change ram check to use an array for predetermined values
	- add functionality using formulas when aquired (and check if its available) finding target has been done
	- add regular check for nuking
	- recheck usable hosts at set intervals (15 min) or if possible when manually triggered after e.g. buying a new hack
	- make it loop then wait for the first script to be released (the if is running doesnt do anything at the moment)
	- create function that finds the optimal ratio of hack/grow and weaken to keep max hack (if needed in 2 cycles)`
	- keep count of when we have enough weaken or grow to reach the threshold and then skip that check

	- instead of calculating if a cycle is possible we should check if there is room for at least 1 more thread and keep a counter 
	- to ensure that if there is ram available but not enough for an entire cycle we fill the remaining ram with grows and 
	- push the remainder to the next host
	
	- start using libraries

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
export async function master_basic(ns,hosts,target) {
	let securityThreshold = ns.getServerMinSecurityLevel(target);
	let moneyThreshold = ns.getServerMaxMoney(target);
	let threads = 0;
	let ram = 0;
	let ramAvailable = 0;
	let level = ns.getHackingLevel();
	let player = ns.getPlayer();
	let time = 15;
	let actions = {"weaken": "weaken.js","grow": "grow.js","hack": "hack.js"};
	let action = "";
	let minSecurityLevel = ns.getServerMinSecurityLevel(target);
	let requiredLvl = ns.getServerRequiredHackingLevel(target);
	let maxMoney = ns.getServerMaxMoney(target);
	let growPercent = (Math.pow((Math.min((1+(1.03-1)/minSecurityLevel),1.0035)),(1*(ns.getServerGrowth(target)/100)*player.mults.hacking_grow))-1);
	let moneyHacked = ((maxMoney)*((100-minSecurityLevel/100)*((level-(requiredLvl-1))/level)*player.mults.hacking_money)/24000);
	let growPerhack = Math.ceil(((moneyHacked)/((growPercent)*(maxMoney-moneyHacked))))
	let ramPerCycle = await ns.getScriptRam(actions["grow"])*growPerhack + await ns.getScriptRam(actions["hack"]);
	let weakenRam = await ns.getScriptRam(actions["weaken"]);
	let securityLevel = 0;
	let weakenThreadsTotal = 0;
	let weakenThreads = 0;
	let growThreads = 0;
	let hackThreads = 0;

	for (let s = 0; s < 10; s++) {
		securityLevel = ns.getServerSecurityLevel(target);
		for (let i = 0; i < hosts.length; i++) {
			if (securityLevel > securityThreshold) {
				weakenThreadsTotal = Math.ceil((securityLevel-securityThreshold)/0.05);
			} 
			ramAvailable = Math.floor(ns.getServerMaxRam(hosts[i]) - ns.getServerUsedRam(hosts[i]));
			for ( let x = 0; x < weakenThreadsTotal; x++) {
				if (ramAvailable >= weakenRam) {
					ramAvailable -= weakenRam;
					weakenThreads++;
					weakenThreadsTotal--;
				}
				await ns.sleep(25);
			} 
			while (ramAvailable > ramPerCycle) {
				
				if (ramPerCycle <= ramAvailable) {
                    ramAvailable -= ramPerCycle;
					growThreads += growPerhack;
					hackThreads++;
                }
				await ns.sleep(26);
			}
			// we now know how much weakening and growing/hacking to do on target, we need to calculate the lowest time 
			// and then start the scripts after which we wait for the specified time before running the loop again
			if (weakenThreads > 0) {
				await ns.exec(actions["weaken"],hosts[i],weakenThreads,target);
				var weakenTime = (20*((2.5*(securityLevel*requiredLvl)+500)/(level+50))/(player.mults.hacking_speed));
				time = weakenTime;
			} 
			if (growThreads > 0) {
                await ns.exec(actions["grow"],hosts[i],growThreads,target);
                var growTime = (16*((2.5*(securityLevel*requiredLvl)+500)/(level+50))/(player.mults.hacking_speed));
				time = growTime;
            }
			if (hackThreads > 0) {
				await ns.exec(actions["hack"],hosts[i],hackThreads,target);
				var hackTime = (5*((2.5*(requiredLvl*securityLevel)+500)/(level+50))/player.mults.hacking_speed);
				time = hackTime;
			}
            await ns.sleep(100);

		}
		await ns.sleep(time*1000);
	}
}

export async function main(ns) {
	let hostsScan = await scan(ns,"home");
	let hosts = [];
	let target = "";
	while (true) {
		await nuke(ns);
		hosts = await scan_usable(ns,hostsScan);
		target = find_optimal_target(ns,hosts);
		await master_basic(ns, hosts,target);
		await ns.sleep(53);
	}


}


/*
	Description:
	1. scan for all hosts
	2. start infinite loop
	3. nuke all possible hosts (using nuke.js)
	4. create a list of usable hosts (using scan_root.js should be renamed)
	5. find the optimal target
	6. run master_basic with the list of usable hosts:
		a. initialize function variables
		b. calculate variables for target
		c. start loop that runs 10 times (arbitrary number of times to ensure we don't run the target and nuking scripts too often)
		d. get the actual security level of the target (done here toe ensure we pick up weakening)
		e. check if weakening is needed, if true set weakening threads to needed threads to hit threshold
		f. calculate the available ram after starting weakening threads
		g. calculate max possible hack/grow cycles with remaining ram (if any remaining)
		h. start scripts if there is a thread request and set time to the lowest time
		i. loop to c 
	7. loop to 2

*/