import { useEffect, useRef, useState } from "react";
import { Terminal, Minimize2, Maximize2, Trash2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LogEntry {
	timestamp: string;
	type: "info" | "success" | "error" | "warning" | "transaction" | "channel" | "settlement" | "connected" | "clear";
	message: string;
	metadata?: Record<string, any>;
}

const TerminalLogs = () => {
	const [logs, setLogs] = useState<LogEntry[]>([]);
	const [isMinimized, setIsMinimized] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	const logsEndRef = useRef<HTMLDivElement>(null);
	const logsContainerRef = useRef<HTMLDivElement>(null);
	const eventSourceRef = useRef<EventSource | null>(null);

	// Auto-scroll to bottom when new logs arrive (only within terminal container)
	useEffect(() => {
		if (!isMinimized && logsContainerRef.current) {
			// Scroll the terminal container, not the main page
			logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
		}
	}, [logs, isMinimized]);

	// Connect to log stream (SSE or polling based on environment)
	useEffect(() => {
		const orchestratorUrl = import.meta.env.VITE_ORCHESTRATOR_URL || "http://localhost:3001";
		const isProduction = import.meta.env.PROD;
		const isVercel = window.location.hostname.includes("vercel.app") || window.location.hostname.includes("vercel.com");

		// Use polling for production/Vercel deployments, SSE for local development
		if (isProduction || isVercel) {
			console.log("Using polling mode for log streaming");
			setupPolling(orchestratorUrl);
		} else {
			console.log("Using SSE mode for log streaming");
			setupSSE(orchestratorUrl);
		}

		function setupSSE(url: string) {
			const eventSource = new EventSource(`${url}/api/logs/stream`);
			eventSourceRef.current = eventSource;

			eventSource.onopen = () => {
				setIsConnected(true);
				console.log("Connected to orchestrator log stream");
			};

			eventSource.onmessage = (event) => {
				try {
					const log: LogEntry = JSON.parse(event.data);
					if (log.type === "clear") {
						setLogs([]);
					} else {
						setLogs((prev) => [...prev, log]);
					}
				} catch (error) {
					console.error("Failed to parse log:", error);
				}
			};

			eventSource.onerror = () => {
				setIsConnected(false);
				console.error("Lost connection to orchestrator");
			};

			return () => {
				eventSource.close();
			};
		}

		function setupPolling(url: string) {
			let lastTimestamp: string | null = null;
			let pollInterval: NodeJS.Timeout;

			const pollLogs = async () => {
				try {
					const params = new URLSearchParams();
					if (lastTimestamp) {
						params.append("since", lastTimestamp);
					}
					params.append("limit", "100");

					const response = await fetch(`${url}/api/logs?${params}`);
					if (!response.ok) {
						throw new Error(`HTTP ${response.status}`);
					}

					const data = await response.json();

					if (data.logs && data.logs.length > 0) {
						setLogs((prev) => {
							// Filter out duplicates and add new logs
							const existingTimestamps = new Set(prev.map((log) => log.timestamp));
							const newLogs = data.logs.filter((log: LogEntry) => !existingTimestamps.has(log.timestamp));

							if (newLogs.length > 0) {
								lastTimestamp = newLogs[newLogs.length - 1].timestamp;
								return [...prev, ...newLogs];
							}
							return prev;
						});
					}

					setIsConnected(true);
				} catch (error) {
					console.error("Failed to fetch logs:", error);
					setIsConnected(false);
				}
			};

			// Initial fetch
			pollLogs();

			// Poll every 2 seconds
			pollInterval = setInterval(pollLogs, 2000);

			return () => {
				if (pollInterval) {
					clearInterval(pollInterval);
				}
			};
		}
	}, []);

	const clearLogs = () => {
		setLogs([]);
	};

	const getLogColor = (type: string) => {
		switch (type) {
			case "success":
				return "text-green-400";
			case "error":
				return "text-red-400";
			case "warning":
				return "text-yellow-400";
			case "transaction":
				return "text-blue-400";
			case "channel":
				return "text-purple-400";
			case "settlement":
				return "text-cyan-400";
			case "connected":
				return "text-emerald-400";
			default:
				return "text-gray-300";
		}
	};

	const getLogPrefix = (type: string) => {
		switch (type) {
			case "success":
				return "✓";
			case "error":
				return "✗";
			case "warning":
				return "⚠";
			case "transaction":
				return "⛓";
			case "channel":
				return "📡";
			case "settlement":
				return "💰";
			case "connected":
				return "🔌";
			default:
				return "›";
		}
	};

	return (
		<div className={cn("flex flex-col bg-[#0a0a0a] rounded-lg border border-white/10 shadow-2xl overflow-hidden transition-all duration-300", isMinimized ? "h-14" : "h-[600px]")} style={{ overflowAnchor: "none" }}>
			{/* Terminal Header */}
			<div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-zinc-900 to-zinc-800 border-b border-white/10">
				<div className="flex items-center gap-3">
					<Terminal className="w-5 h-5 text-green-400" />
					<span className="font-mono text-sm font-semibold text-gray-200">AI Agents Logs</span>
					<div className="flex items-center gap-2">
						<Circle className={cn("w-2 h-2 fill-current", isConnected ? "text-green-500 animate-pulse" : "text-red-500")} />
						<span className="text-xs text-gray-400 font-mono">{isConnected ? "LIVE" : "OFFLINE"}</span>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={clearLogs} title="Clear logs">
						<Trash2 className="w-4 h-4 text-gray-400" />
					</Button>
					<Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => setIsMinimized(!isMinimized)} title={isMinimized ? "Maximize" : "Minimize"}>
						{isMinimized ? <Maximize2 className="w-4 h-4 text-gray-400" /> : <Minimize2 className="w-4 h-4 text-gray-400" />}
					</Button>
				</div>
			</div>

			{/* Terminal Body */}
			{!isMinimized && (
				<div ref={logsContainerRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-[#0a0a0a] scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
					{logs.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-full text-gray-500">
							<Terminal className="w-12 h-12 mb-3 opacity-30" />
							<p className="text-sm">Waiting for orchestrator activity...</p>
							<p className="text-xs mt-1 opacity-70">Submit a video request to see logs</p>
						</div>
					) : (
						<div className="space-y-1">
							{logs.map((log, index) => (
								<div key={index} className="flex gap-2 leading-relaxed hover:bg-white/5 px-2 py-1 rounded transition-colors">
									<span className="text-gray-600 text-xs shrink-0 mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</span>
									<span className={cn("shrink-0", getLogColor(log.type))}>{getLogPrefix(log.type)}</span>
									<span className={cn("break-all", getLogColor(log.type))}>{log.message}</span>
								</div>
							))}
							<div ref={logsEndRef} />
						</div>
					)}
				</div>
			)}

			{/* Footer Info Bar */}
			{!isMinimized && (
				<div className="px-4 py-2 bg-zinc-900/50 border-t border-white/10 flex items-center justify-between text-xs font-mono">
					<div className="flex items-center gap-4 text-gray-500">
						<span>
							{logs.length} {logs.length === 1 ? "entry" : "entries"}
						</span>
						<span className="hidden md:block">•</span>
						<span className="hidden md:block">Payment Channel System</span>
					</div>
					<div className="text-gray-600">
						<span className="text-green-400">ETH</span> • <span className="text-purple-400">Arbitrum Sepolia</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default TerminalLogs;
