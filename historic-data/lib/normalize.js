// Normalizers to make a DB query-result row (flattened, string-typed columns —
// booleans as "true"/"false"/"", Postgres array literals as "{a,b}", etc.) directly
// comparable to the JS-typed objects produced by tsv-transform.js's buildCase/buildVictim/
// buildAggressor.

export function normStr(v) {
    if (v === undefined || v === null) return null;
    const t = String(v).trim();
    return t === "" ? null : t;
}

export function normBool(v) {
    if (v === true || v === "true") return true;
    if (v === false || v === "false") return false;
    return null;
}

export function normNum(v) {
    if (v === undefined || v === null || v === "") return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
}

// Parses a Postgres array literal ("{a,b}", "{}", "") or an already-parsed JS array
// into a sorted array of trimmed string elements.
export function parsePgArray(v) {
    if (Array.isArray(v)) return [...v].map(String).sort();
    if (v === undefined || v === null) return [];
    const s = String(v).trim();
    if (s === "" || s === "{}") return [];
    return s
        .replace(/^\{/, "")
        .replace(/\}$/, "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .sort();
}

export function normArrNum(v) {
    return parsePgArray(v).map(Number).sort((a, b) => a - b);
}

export function normDate(v) {
    if (!v) return null;
    return String(v).slice(0, 10);
}
