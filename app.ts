import Discord from "discord.js";

const client = new Discord.Client();

const processCmd = (s: string) => {
	let cmd: string;
	let args: string[];

	const match = s.match(/([^\s]+)(\s+.+)?/);
	if (match === null) {
		return;
	}
	cmd = match[1];
	args = match.slice(2);
};

client.on("message", msg => {
	const s = msg.content;
	if (s.substr(0, 1) === "!") {
		processCmd(s.slice(1));
	}
});
