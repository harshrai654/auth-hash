const readline = require("readline").promises;
const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

(async function () {
	while (true) {
		printMenu();
		const choice = await rl.question("Enter choice: ");

		switch (choice) {
			case "1": {
				const user = login();
				printUser(user);
				break;
			}
			case "2": {
				const status = register();
				printStatus(status);
				break;
			}
			case "3": {
				const user = changePassword();
				printUser(user);
				break;
			}
			case "4": {
				console.log(`User details with password hash saved at: `);
				rl.close();
				break;
			}

			default: {
				console.log("Invalid Choice");
			}
		}
	}
})();

/*************************************************************/

function login() {
	fs.createReadStream(path.resolve(__dirname, "data.csv"))
		.pipe(csv.parse({ headers: true }))
		.on("error", (error) => console.error(error))
		.on("data", (row) => {
			console.log(row);
		})
		.on("end", (rowCount) => console.log(`Parsed ${rowCount} rows`));

	return {
		username: "dummy",
		email: "dummy@dummy.com",
	};
}

function register() {
	return {
		type: "success",
		message: "registered successfully",
	};
}

function changePassword() {
	return {
		username: "dummy",
		email: "dummy@dummy.com",
	};
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

function printMenu() {
	console.log(
		`
User Authentication
--------------------
1) Login
2) Register
3) Change Password
4) Exit
--------------------
        `
	);
}
