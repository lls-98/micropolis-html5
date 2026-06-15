/**
 * Lists the various result outcomes that may occur when applying a tool.
 * Ports ToolResult.java.
 */
export const ToolResult = Object.freeze({
    SUCCESS: 'SUCCESS',
    NONE: 'NONE',
    UH_OH: 'UH_OH',
    INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',

    // Ordinal numeric mappings if needed for fallback binary encoding serialization
    SUCCESS_ORD: 1,
    NONE_ORD: 0,
    UH_OH_ORD: -1,
    INSUFFICIENT_FUNDS_ORD: -2
});