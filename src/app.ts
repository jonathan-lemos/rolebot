import Discord from "discord.js";
import API_TOKEN from "./token";

// @ts-ignore
if (API_TOKEN === "YOUR.API.TOKEN.HERE") {
	throw new Error("To use rolebot, you must generate a Discord API token and add it to token.ts");
}

const client = new Discord.Client();

const guildRoles = (guild: Discord.Guild): string[] => {
	return guild.roles.map(r => r.name).filter(s => s !== "@everyone");
};

const findRole = (key: string, guild: Discord.Guild): (Discord.Role | null) => {
	return guild.roles.find(r => r.name === key);
};

const commands: { [cmd: string]:
	(args: string[], user: Discord.GuildMember, guild: Discord.Guild) => (string | null | Promise<string | null>) } = {
	addrole: (args, user, guild) => {
		const usage =
`Usage: !addrole role
Adds a role to this user.
List of roles:
${guildRoles(guild).reduce((a, s) => `${a}\n${s}`)}`;

		if (args.length === 0 || args[0] === "-help") {
			return usage;
		}

		args[0] = args.reduce((a, v) => a + " " + v).replace(/"?(.+)"?/, "$1");

		const role = findRole(args[0], guild);
		if (role === null) {
			return `Role "${args[0]}" not found.`;
		}
		if (user.roles.has(role.id)) {
			return `You already have role "${args[0]}"`;
		}

		return new Promise<string | null>(async resolve => {
			await user.addRole(role).then(res => {
				resolve(`Role "${args[0]}" successfully added.`);
			}).catch(res => {
				resolve(`Role "${args[0]}" was not added (${res}).`);
			});
		});
	},

	help: () => {
		const list = Object.keys(commands).sort().reduce((a, s) => `${a}\n${s}`);
		return `List of commands:\n${list}\nType "!*command* -help" for usage of any command.`;
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
		const usage =
`Usage: !rmrole role
Removes a role from this user.
List of roles:
${guildRoles(guild).reduce((a, s) => `${a}\n${s}`)}`;

		if (args.length === 0 || args[0] === "-help") {
			return usage;
		}

		args[0] = args.reduce((a, v) => a + " " + v).replace(/"?(.+)"?/, "$1");

		const role = findRole(args[0], guild);
		if (role === null) {
			return `Role "${args[0]}" not found.`;
		}
		if (!user.roles.has(role.id)) {
			return `You already lack role "${args[0]}"`;
		}

		return new Promise<string | null>(async resolve => {
			await user.removeRole(role).then(res => {
				resolve(`Role "${args[0]}" successfully removed.`);
			}).catch(res => {
				resolve(`Role "${args[0]}" was not removed (${res}).`);
			});
		});
	},
};

const processCmd = (s: string, user: Discord.GuildMember, guild: Discord.Guild): Promise<string | null> => {
	let cmd: string;
	let args: string[];

	const match = s.match(/([^\s]+)(.+)?/);
	if (match === null) {
		return new Promise(resolve => resolve(null));
	}
	cmd = match[1];
	args = match[2] != null ? match[2].trim().split(/\s+/) : [];

	if (commands[cmd] === undefined) {
		return new Promise(resolve => resolve(`Command "${cmd}" unrecognized.`));
	}
	const res = commands[cmd](args, user, guild);
	if (typeof res === "string" || res === null) {
		return new Promise(resolve => resolve(res));
	}
	return res;
};

client.on("message", async msg => {
	const s = msg.content;
	if (s.substr(0, 1) === "!") {
		const response = await processCmd(s.slice(1), msg.member, msg.guild);
		if (response !== null) {
			msg.channel.send(`${msg.author}\n${response}`);
		}
	}
});

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.login(API_TOKEN);
console.log("rolebot is active");
