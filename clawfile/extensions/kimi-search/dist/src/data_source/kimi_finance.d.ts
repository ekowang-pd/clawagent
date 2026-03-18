import { type ToolResult } from "../utils";
export type FinanceParams = {
    ticker: string;
    time: string;
    type?: "open_summary" | "close_summary" | "realtime_price" | "realtime_tech";
    file_path: string;
};
export type FinanceConfig = {
    baseUrl: string;
    apiKey: string;
    timeoutSeconds: number;
    customHeaders: Record<string, string>;
};
export type FinanceContext = {
    toolCallId: string;
    userAgent: string;
    config: FinanceConfig;
};
export type FinanceResponse = {
    is_success: boolean;
    result?: {
        user?: Array<{
            type: string;
            text?: string;
        }>;
        assistant?: Array<{
            type: string;
            text?: string;
        }>;
    };
    error?: {
        user?: Array<{
            type: string;
            text?: string;
        }>;
        assistant?: Array<{
            type: string;
            text?: string;
        }>;
    };
    files?: Array<{
        name: string;
        content: string;
    }>;
};
export declare function executeFinance(params: FinanceParams, ctx: FinanceContext, fetchLike?: typeof fetch): Promise<ToolResult>;
//# sourceMappingURL=kimi_finance.d.ts.map