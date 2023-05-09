/** @param {NS} ns */
export async function main(ns) {
	let files = ["grow","hack","weaken","master","nuke","scan"];
	let baseUrl = "https://raw.githubusercontent.com/lapryx/Bitburner/main/";
	let fullUrl = "";
	for (let i = 0; i < files.length; i++) {
		let fileName = files[i] + ".js";
		fullUrl = baseUrl + fileName;
		ns.wget(fullUrl,fileName);
	}
  ns.tprint("goodbye world");
}