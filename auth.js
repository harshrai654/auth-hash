const readline = require("readline").promises;
const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");
const crypto = require("crypto");
const { resolve } = require("path");
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const FILE_NAME = "data.csv";

(async function () {
	while (true) {
		printMenu();
		const choice = await rl.question("Enter choice: ");

		switch (choice) {
			case "1": {
				const username = await rl.question("Enter your username : ");
				const password = await rl.question("Enter your password : ");

				await login({
					username,
					password,
				});
				break;
			}
			case "2": {
				const username = await rl.question("Enter your username : ");
				const email = await rl.question("Enter your email : ");
				const password = await rl.question("Enter your password : ");
				await register({
					username,
					password,
					email,
				});
				break;
			}
			case "3": {
				console.log(
					`\nUser details with password hash saved at: ${FILE_NAME}`
				);
				rl.close();
				return;
				break;
			}

			default: {
				console.log("Invalid Choice");
			}
		}
	}
})();

/*************************************************************/

async function login({ username, password }) {
	const data = await getCSVData();

	if (!data[username]) {
		return printStatus({
			type: "ERROR",
			message: "Invalid Credentials",
		});
	}

	const savedUser = data[username];
	const hash = crypto
		.pbkdf2Sync(password, savedUser.salt, 1000, 64, "sha256")
		.toString("hex");

	if (savedUser.passwordHash === hash) {
		printStatus({
			type: "success",
			message: "Login Successful!",
		});

		return printUser({
			username: username,
			email: savedUser.email,
		});
	}

	return printStatus({
		type: "ERROR",
		message: "Invalid Credentials",
	});
}

async function register({ username, password, email }) {
	/**
	 * Verify if username is unique
	 */
	const data = await getCSVData();

	if (data[username]) {
		return printStatus({
			type: "ERROR",
			message: "Username already exist",
		});
	}

	/**
	 * Generate Salt and Hash
	 */
	const salt = crypto.randomBytes(16).toString("hex");
	const passwordHash = crypto
		.pbkdf2Sync(password, salt, 1000, 64, "sha256")
		.toString("hex");

	/**
	 * Save user to CSV
	 */
	await saveToCSV({
		username,
		passwordHash,
		email,
		salt,
	});

	/**
	 * Update Status
	 */
	printUser({
		username,
		email,
	});

	printStatus({
		type: "success",
		message: "Registration Successful",
	});
}

function printUser(user) {
	if (!user || typeof user !== "object") {
		console.log("Invalid Credentials");
	}

	console.log("\n");
	Object.keys(user).forEach((detail) =>
		console.log(`${detail}: ${user[detail]}`)
	);
	console.log("\n");
}

function printStatus({ type, message }) {
	console.log("\n");
	console.log(`[${type}] :: ${message}`);
	console.log("\n");
}

function getCSVData() {
	return new Promise((resolve, reject) => {
		const data = {};

		fs.createReadStream(path.resolve(__dirname, FILE_NAME))
			.pipe(csv.parse({ headers: true }))
			.on("error", (error) => reject(error))
			.on("data", (row) => {
				const { username, passwordHash, email, salt } = row;

				data[username] = {
					passwordHash,
					email,
					salt,
				};
			})
			.on("end", (t) => resolve(data));
	});
}

function saveToCSV(data) {
	return new Promise((resolve, reject) => {
		const headers = Object.keys(data);

		const writeStream = csv.writeToStream(
			fs.createWriteStream(path.resolve(__dirname, FILE_NAME), {
				flags: "a",
			}),
			[data],
			{
				headers,
				includeEndRowDelimiter: true,
				writeHeaders: false,
			}
		);

		writeStream.on("error", (err) => reject(err));
		writeStream.on("finish", () => resolve());
	});
}

function printMenu() {
	console.log(
		`
User Authentication
--------------------
1) Login
2) Register
3) Exit
--------------------
        `
	);
}
