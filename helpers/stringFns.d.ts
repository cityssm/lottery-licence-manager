import { RawRowsColumnsReturn } from "./llmTypes";
export declare function formatDollarsAsHTML(dollarAmt: number): string;
export declare function escapeHTML(str: string): string;
export declare function rawToCSV(rowsColumnsObj: RawRowsColumnsReturn): string;
export declare function generatePassword(): string;
export declare function getUID(): string;
