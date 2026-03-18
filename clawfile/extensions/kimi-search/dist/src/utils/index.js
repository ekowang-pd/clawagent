"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
exports.error = error;
exports.decodeHtmlEntities = decodeHtmlEntities;
exports.extractMeaningfulText = extractMeaningfulText;
function ok(output, message = "", brief = "") {
    return {
        is_error: false,
        output,
        message,
        brief,
    };
}
function error(message, brief, output = "") {
    return {
        is_error: true,
        output,
        message,
        brief,
    };
}
function decodeHtmlEntities(input) {
    return input
        .replaceAll("&nbsp;", " ")
        .replaceAll("&amp;", "&")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .replaceAll("&quot;", '"')
        .replaceAll("&#39;", "'")
        .replaceAll(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
        .replaceAll(/&#x([\da-fA-F]+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}
function extractMeaningfulText(html) {
    const stripped = html
        .replaceAll(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gis, " ")
        .replaceAll(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gis, " ")
        .replaceAll(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gis, " ")
        .replaceAll(/<!--([\s\S]*?)-->/g, " ")
        .replaceAll(/<\/?(h[1-6]|p|div|article|section|li|tr|td|th|ul|ol|br)\b[^>]*>/gi, "\n")
        .replaceAll(/<[^>]+>/g, " ");
    const decoded = decodeHtmlEntities(stripped)
        .replaceAll(/\r\n?/g, "\n")
        .replaceAll(/\t/g, " ")
        .replaceAll(/[ \u00A0]+/g, " ")
        .replaceAll(/\n{3,}/g, "\n\n")
        .trim();
    return decoded;
}
//# sourceMappingURL=index.js.map