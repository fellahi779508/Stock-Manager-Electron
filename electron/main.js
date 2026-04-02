const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn, exec } = require("child_process");
const waitOn = require("wait-on");

let backendProcess;
let frontendProcess;

app.disableHardwareAcceleration();

// Kill ports synchronously using a promise
function killPorts() {
	return new Promise((resolve, reject) => {
		exec("npx kill-port 3000 3001", (err, stdout, stderr) => {
			if (err) {
				console.error("Kill-port error:", err);
				return reject(err);
			}
			if (stdout) console.log(stdout);
			if (stderr) console.error(stderr);
			resolve();
		});
	});
}

// Start NestJS backend
function startBackend() {
	return new Promise((resolve, reject) => {
		backendProcess = spawn(
			process.platform === "win32" ? "npm.cmd" : "npm",
			["run", "start:dev"],
			{ cwd: path.join(__dirname, "../backend"), shell: true },
		);

		backendProcess.stdout.on("data", (data) => {
			const text = data.toString();
			console.log(`Backend: ${text}`);
			// resolve as soon as we see "Nest application successfully started"
			if (text.includes("Nest application successfully started")) {
				resolve();
			}
		});

		backendProcess.stderr.on("data", (data) =>
			console.error(`Backend Error: ${data}`),
		);

		backendProcess.on("exit", (code) => {
			if (code !== 0) reject(new Error("Backend exited unexpectedly"));
		});
	});
}

// Start Next.js frontend
function startFrontend() {
	return new Promise((resolve, reject) => {
		frontendProcess = spawn(
			process.platform === "win32" ? "npm.cmd" : "npm",
			["run", "dev"],
			{ cwd: path.join(__dirname, "../frontend"), shell: true },
		);

		frontendProcess.stdout.on("data", (data) => {
			const text = data.toString();
			console.log(`Frontend: ${text}`);
			// resolve when Next.js ready
			if (text.includes("Local:")) {
				resolve();
			}
		});

		frontendProcess.stderr.on("data", (data) =>
			console.error(`Frontend Error: ${data}`),
		);

		frontendProcess.on("exit", (code) => {
			if (code !== 0) reject(new Error("Frontend exited unexpectedly"));
		});
	});
}

// Create Electron window
function createWindow() {
	const win = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	win.loadURL("http://localhost:3000");
}

// Clean up processes
function cleanUp() {
	if (backendProcess) backendProcess.kill();
	if (frontendProcess) frontendProcess.kill();
	exec("npx kill-port 3000 3001");
}

// App ready
app.whenReady().then(async () => {
	try {
		await killPorts();
		await startBackend();
		await startFrontend();
		createWindow();
	} catch (err) {
		console.error("Startup error:", err);
	}
});

// Close all processes when Electron closes
app.on("window-all-closed", () => {
	cleanUp();
	if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
	cleanUp();
});
