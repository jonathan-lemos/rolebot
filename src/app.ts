import Discord from "discord.js";
import API_TOKEN from "./token";

if (API_TOKEN === "YOUR.API.TOKEN.HERE") {
	throw new Error("To use rolebot, you must generate a Discord API token and add it to token.ts");
}

const client = new Discord.Client();

const guildRoles = (guild: Discord.Guild): string[] => {
	return guild.roles.map((v, k) => k).sort();
};

const findRole = (key: string, guild: Discord.Guild): (Discord.Role | null) => {
	const res = guild.roles.map((v, k) => k.toLowerCase()).find(s => s === key.toLowerCase());
	if (res === undefined) {
		return null;
	}
	const q = guild.roles.get(res);
	if (q === undefined) {
		throw new Error(`guild.roles.get(${key}) was undefined but was found in map()`);
	}
	return q;
};

const commands: { [cmd: string]:
	(args: string[], user: Discord.GuildMember, guild: Discord.Guild) => (string | null) } = {
	addrole: (args, user, guild) => {
		const usage = `Usage: !addrole role\nAdds a role to this user.\nList of roles:\n
		${guildRoles(guild).reduce(s => `\n${s}`)}`;

		if (args.length === 0 || args[0] === "-help") {
			return usage;
		}

		args[0] = args.reduce((a, v) => a + " " + v).replace(/"?(.+)"?/, "$1");

		const role = findRole(args[0], guild);
		if (role === null) {
			return `Role "${args[0]}" not found.`;
		}

		user.addRole(role);
		return `Role "${args[0]}" successfully added.`;
	},

	help: () => {
		const list = Object.keys(commands).sort().reduce(s => `\n${s}`);
		return `List of commands\n${list}\nType "command -help" for usage of any command.`;
	},

	ping: args => {
		const usage = "Usage: ping [number]\nReturns \"pong\" with an optional number of o's (default 1).";
		if (args.length === 0) {
			return "pong";
		}
		if (args[0].toLowerCase() === "-help" || args.length > 1) {
			return usage;
		}
		let count: number;
		try {
			count = parseInt(args[0], 10);
		}
		catch (e) {
			return usage;
		}
		return `p${"".padEnd(count, "o")}ng`;
	},

	rmrole: (args, user, guild) => {
		const usage = `Usage: !rmrole role\nAdds a role to this user.\nList of roles:\n
		${guildRoles(guild).reduce(s => `\n${s}`)}`;

		if (args.length === 0 || args[0] === "-help") {
			return usage;
		}

		args[0] = args.reduce((a, v) => a + " " + v).replace(/"?(.+)"?/, "$1");

		const role = findRole(args[0], guild);
		if (role === null) {
			return `Role "${args[0]}" not found.`;
		}

		if (!user.roles.has(role.name)) {
			return `You do not have the role "${role.name}"`
		}
		user.removeRole(role);
		return `Role "${args[0]}" successfully removed.`;
	},
};

const processCmd = (s: string): (string | null) => {
	let cmd: string;
	let args: string[];

	const match = s.match(/([^\s]+)(.+)?/);
	if (match === null) {
		return null;
	}
	cmd = match[1];
	args = match[2] != null ? match[2].trim().split(/\s+/) : [];

	return null;
};

client.on("message", msg => {
	const s = msg.content;
	if (s.substr(0, 1) === "!") {
		processCmd(s.slice(1));
	}
});

client.login(API_TOKEN);
