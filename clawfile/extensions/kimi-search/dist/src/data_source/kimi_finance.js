"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeFinance = executeFinance;
const fs_1 = require("fs");
const path_1 = require("path");
const utils_1 = require("../utils");
function saveFiles(files) {
    const savedPaths = [];
    for (const file of files) {
        try {
            const dir = (0, path_1.dirname)(file.name);
            (0, fs_1.mkdirSync)(dir, { recursive: true });
            (0, fs_1.writeFileSync)(file.name, file.content, "utf-8");
            savedPaths.push(file.name);
        }
        catch (e) {
            console.error(`Failed to save file ${file.name}:`, e);
        }
    }
    return savedPaths.length > 0 ? `Files saved: ${savedPaths.join(", ")}` : "";
}
async function executeFinance(params, ctx, fetchLike = fetch) {
    const baseUrl = ctx.config.baseUrl.trim();
    const apiKey = ctx.config.apiKey.trim();
    if (!baseUrl || !apiKey) {
        return (0, utils_1.error)("Finance service is not configured. Set KIMI_PLUGIN_API_KEY or configure the plugin.", "Finance service not configured");
    }
    const queryType = params.type || "realtime_price";
    const timeoutSeconds = ctx.config.timeoutSeconds ?? 30;
    const timeoutMs = Math.max(1, timeoutSeconds) * 1000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetchLike(baseUrl, {
            method: "POST",
            headers: {
                "User-Agent": ctx.userAgent,
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "X-Msh-Tool-Call-Id": ctx.toolCallId,
                ...ctx.config.customHeaders,
            },
            body: JSON.stringify({
                method: "get_stock_realtime_price",
                params: {
                    ticker: params.ticker,
                    time: params.time,
                    type: queryType,
                    file_path: params.file_path,
                },
            }),
            signal: controller.signal,
        });
        if (response.status !== 200) {
            return (0, utils_1.error)(`Failed to fetch finance data. Status: ${response.status}. This may indicate the finance service is currently unavailable.`, "Failed to fetch finance data");
        }
        const data = (await response.json());
        if (!data.is_success) {
            const errorMessages = [];
            if (data.error?.assistant) {
                errorMessages.push(...data.error.assistant.map((item) => item.text || "").filter(Boolean));
            }
            if (data.error?.user) {
                errorMessages.push(...data.error.user.map((item) => item.text || "").filter(Boolean));
            }
            return (0, utils_1.error)(errorMessages.join("\n") || "Finance API returned an error.", "Finance API error");
        }
        // Save files if any
        let fileMessage = "";
        if (data.files && data.files.length > 0) {
            fileMessage = saveFiles(data.files);
        }
        // Build result message
        const resultMessages = [];
        if (data.result?.assistant) {
            resultMessages.push(...data.result.assistant.map((item) => item.text || "").filter(Boolean));
        }
        if (data.result?.user) {
            resultMessages.push(...data.result.user.map((item) => item.text || "").filter(Boolean));
        }
        const output = resultMessages.join("\n");
        const message = fileMessage ? `${output}\n\n${fileMessage}` : output;
        return (0, utils_1.ok)(output, message);
    }
    catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        return (0, utils_1.error)(`Failed to fetch finance data due to network error: ${errMsg}. This may indicate the service is unreachable.`, "Network error when calling finance service");
    }
    finally {
        clearTimeout(timeout);
    }
}
//# sourceMappingURL=kimi_finance.js.map