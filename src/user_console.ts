
import { EventEmitter } from './event_emitter';
import type { Game } from "./game";

// const levels = {
//   error: 0,
//   warn: 1,
//   info: 2,
//   http: 3,
//   verbose: 4,
//   debug: 5,
//   silly: 6,
// };

class ConsoleEntry {
	message: string;
	time: Date;
	data: object | null;
	level: number | string;
	constructor({ message, time = new Date(), data = null, level = "log"}) {
		this.message = message;
		this.time = time;
		this.data = data;
		this.level = level;
	}
	/**
	 * @return {string}
	 */
	renderText() {
		return `[${this.time.getHours()}:${this.time.getMinutes()}:${this.time.getSeconds()}][${this.level}] ${this.message}`;
	}
}

/**
 * Rudimentary console that supports not only strings but also objects (up to the developer to implement)
 */
class UserConsole {
	public lineLimit: number;
	public lines: any[];
	public game: Game | null;
	public input: string;
	constructor({
		game = null,
		lineLimit = 1000, // it says lines but it is ultimately the number of entries to collect
	}) {
		this.lineLimit = lineLimit;
		this.lines = [];
		this.game = game;
		this.input = "";
	}

	log(message: string | ConsoleEntry) {
		if (typeof message === 'string') {
			message = new ConsoleEntry({ message });
		}
		this.lines.push(message);
		this.game.emit('console', message);
	}

	command(message) {
		this.game.emit('consolecommand', message);
	}
	
	/**
	 * Something that allows autocompletion in the future. Not used at the moment
	 */
	registerCommand() {

	}
}

export { UserConsole };
