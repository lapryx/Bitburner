/** @param {NS} ns */
export async function main(ns) {
  const target = arguments[0].args[0];
	await ns.hack(target);
}