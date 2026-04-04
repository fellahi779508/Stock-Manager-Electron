const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn, exec } = require("child_process");

let backendProcess;
let frontendProcess;
let mainWindow;

app.disableHardwareAcceleration();

// Kill ports
function killPorts() {
	return new Promise((resolve) => {
		exec("npx kill-port 3000 3001", () => resolve());
	});
}

// Start backend (NestJS - 3001)
function startBackend() {
	return new Promise((resolve, reject) => {
		backendProcess = spawn(
			process.platform === "win32" ? "npm.cmd" : "npm",
			["run", "start:dev"],
			{ cwd: path.join(__dirname, "../backend"), shell: true },
		);

		backendProcess.stdout.on("data", (data) => {
			const text = data.toString();
			console.log("Backend:", text);

			if (text.includes("Nest application successfully started")) {
				resolve();
			}
		});

		backendProcess.stderr.on("data", (data) =>
			console.error("Backend Error:", data.toString()),
		);

		backendProcess.on("exit", (code) => {
			if (code !== 0) reject(new Error("Backend exited"));
		});
	});
}

// Start frontend (Next.js - 3000)
function startFrontend() {
	return new Promise((resolve, reject) => {
		frontendProcess = spawn(
			process.platform === "win32" ? "npm.cmd" : "npm",
			["run", "dev"],
			{ cwd: path.join(__dirname, "../frontend"), shell: true },
		);

		frontendProcess.stdout.on("data", (data) => {
			const text = data.toString();
			console.log("Frontend:", text);

			if (text.includes("Local:")) {
				resolve();
			}
		});

		frontendProcess.stderr.on("data", (data) =>
			console.error("Frontend Error:", data.toString()),
		);

		frontendProcess.on("exit", (code) => {
			if (code !== 0) reject(new Error("Frontend exited"));
		});
	});
}

// Create window
function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1920,
		height: 1080,
		show: false,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	mainWindow.loadFile(path.join(__dirname, "loader.html"));

	mainWindow.once("ready-to-show", () => {
		mainWindow.show();
	});
}

// Load main app with CSS fix
function loadMainApp() {
	const url = "http://127.0.0.1:3000";

	console.log("Loading:", url);

	setTimeout(() => {
		mainWindow.loadURL(url);

		mainWindow.webContents.on("did-finish-load", async () => {
			console.log("Page loaded");

			// Check if CSS exists
			const hasCSS = await mainWindow.webContents.executeJavaScript(`
				document.styleSheets.length > 0
			`);

			if (!hasCSS) {
				console.log("CSS missing → reloading...");
				setTimeout(() => {
					mainWindow.reload();
				}, 1500);
			} else {
				console.log("CSS loaded successfully");
			}
		});
	}, 4000); // important delay for Next.js compilation
}

// Cleanup
async function cleanUp() {
	console.log("🧹 Cleaning up processes...");
	const killPromises = [];

	const killProc = (proc, name) => {
		if (proc && proc.pid) {
			killPromises.push(
				new Promise((resolve) => {
					treeKill(proc.pid, "SIGKILL", (err) => {
						if (err) console.error(`Failed to kill ${name}:`, err);
						else console.log(`✅ Killed ${name} (PID ${proc.pid})`);
						resolve();
					});
				}),
			);
		}
	};

	killProc(backendProcess, "backend");
	killProc(frontendProcess, "frontend");
	killPromises.push(killPorts());
	await Promise.all(killPromises);
	console.log("🧹 Cleanup complete");
}

// App lifecycle
app.whenReady().then(async () => {
	createWindow();

	try {
		await killPorts();

		await Promise.all([startBackend(), startFrontend()]);

		console.log("Servers ready");

		loadMainApp();
	} catch (err) {
		console.error("Startup error:", err);
	}
});

app.on("window-all-closed", async () => {
	await cleanUp();
	if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", async () => {
	await cleanUp();
});
