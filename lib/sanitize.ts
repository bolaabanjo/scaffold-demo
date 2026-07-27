/**
 * Input safety layer.
 *
 * The goal is to block active script/HTML-injection vectors from user input
 * (XSS-style payloads) WITHOUT breaking legitimate questions about code.
 * We deliberately target executable/markup injection patterns — script tags,
 * inline event handlers, javascript:/data: URIs, and DOM-exec sinks — rather
 * than any mention of the word "javascript". A user can still ask "how do I
 * write a for-loop in JS"; they cannot smuggle a live <script> or onerror= in.
 *
 * Pure module (no client/server-only APIs) so it runs identically in the
 * browser (pre-send UX) and on the server (authoritative enforcement).
 */

export interface InjectionResult {
    blocked: boolean;
    reason?: string;
}

const INJECTION_PATTERNS: Array<{ re: RegExp; reason: string }> = [
    { re: /<\s*script[\s>]/i, reason: 'inline <script> tags are not allowed' },
    { re: /<\s*\/\s*script\s*>/i, reason: 'inline <script> tags are not allowed' },
    { re: /<\s*iframe[\s>]/i, reason: '<iframe> embeds are not allowed' },
    { re: /<\s*object[\s>]/i, reason: '<object> embeds are not allowed' },
    { re: /<\s*embed[\s>]/i, reason: '<embed> embeds are not allowed' },
    // Inline event-handler attributes: onerror=, onload=, onclick=, etc.
    { re: /\son\w+\s*=\s*["'`]?[^"'`>]*["'`]?/i, reason: 'inline event handlers are not allowed' },
    // javascript: / vbscript: protocol URIs
    { re: /javascript\s*:/i, reason: 'javascript: URIs are not allowed' },
    { re: /vbscript\s*:/i, reason: 'vbscript: URIs are not allowed' },
    // data: URIs that carry markup/script
    { re: /data\s*:\s*text\/html/i, reason: 'data:text/html URIs are not allowed' },
    // Common DOM/exec sinks written as active markup
    { re: /<\s*svg[^>]*\son\w+/i, reason: 'inline SVG event handlers are not allowed' },
    { re: /document\s*\.\s*(cookie|write|location)/i, reason: 'direct document access is not allowed' },
    { re: /\beval\s*\(/i, reason: 'eval() calls are not allowed' },
    { re: /new\s+Function\s*\(/i, reason: 'Function constructor calls are not allowed' },
];

/**
 * Inspect a single string for injection payloads.
 */
export function detectInjection(text: string): InjectionResult {
    if (!text) return { blocked: false };

    for (const { re, reason } of INJECTION_PATTERNS) {
        if (re.test(text)) {
            return { blocked: true, reason };
        }
    }
    return { blocked: false };
}

/**
 * User-facing message shown when input is rejected.
 */
export function injectionMessage(result: InjectionResult): string {
    return `Your message was blocked for security reasons: ${result.reason ?? 'potentially unsafe content detected'}. Please rephrase without embedded scripts or markup.`;
}
