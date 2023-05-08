/** @param {NS} ns */
import { scan } from './scan.js';

export async function main(ns) {
	let hosts = await scan(ns,"home");
	let portScripts = ["BruteSSH.exe","FTPCrack.exe","relaySMTP.exe","HTTPWorm.exe","SQLInject.exe"];
	let maxPorts = 0;
	for (let i = 4; i >= 0; i--) {
		if (ns.fileExists(portScripts[i])) {
			maxPorts += 1;
		} else {
			portScripts.splice(i,1);
		}	
	}
	for (let i = 0; i < hosts.length; i++){
		let reqPorts = ns.getServerNumPortsRequired(hosts[i]);
		if (reqPorts <= maxPorts) {
			for(let x = 0; x < reqPorts; x++) {
				switch(portScripts[x]){
					case "BruteSSH.exe":
						ns.brutessh(hosts[i]);
						break;
					case "FTPCrack.exe":
						ns.ftpcrack(hosts[i]);
						break;
					case "relaySMTP.exe":
						ns.relaysmtp(hosts[i]);
						break;
					case "HTTPWorm.exe":
						ns.httpworm(hosts[i]);
						break;
					case "SQLInject.exe":
						ns.sqlinject(hosts[i]);
						break;
				}
			}
			ns.nuke(hosts[i]);
		}
	}
}