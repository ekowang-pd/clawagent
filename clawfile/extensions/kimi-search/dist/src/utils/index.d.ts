export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;
export type ToolResult = {
    is_error: boolean;
    output: string;
    message: string;
    brief: string;
};
export declare function ok(output: string, message?: string, brief?: string): ToolResult;
export declare function error(message: string, brief: string, output?: string): ToolResult;
export declare function decodeHtmlEntities(input: string): string;
export declare function extractMeaningfulText(html: string): string;
//# sourceMappingURL=index.d.ts.map