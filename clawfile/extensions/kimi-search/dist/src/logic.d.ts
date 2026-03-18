import { type FetchLike, type ToolResult } from "./utils";
export type { FetchLike, ToolResult } from "./utils/index.js";
export type SearchParams = {
    query: string;
    limit?: number;
    include_content?: boolean;
};
export type SearchConfig = {
    baseUrl?: string;
    apiKey?: string;
    customHeaders?: Record<string, string>;
    timeoutSeconds?: number;
};
export type SearchContext = {
    toolCallId: string;
    userAgent: string;
    config: SearchConfig;
};
export type FetchParams = {
    url: string;
};
export type FetchServiceConfig = {
    baseUrl?: string;
    apiKey?: string;
    customHeaders?: Record<string, string>;
};
export type FetchContext = {
    toolCallId: string;
    userAgent: string;
    service?: FetchServiceConfig;
};
export declare function executeSearch(params: SearchParams, ctx: SearchContext, fetchLike?: FetchLike): Promise<ToolResult>;
export declare function executeFetch(params: FetchParams, ctx: FetchContext, fetchLike?: FetchLike): Promise<ToolResult>;
//# sourceMappingURL=logic.d.ts.map