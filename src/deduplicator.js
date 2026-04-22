/**
 * Deduplicator
 *
 * Removes near-duplicate articles using:
 *  1. Exact URL match
 *  2. Normalized title similarity (Jaccard coefficient on word sets)
 *
 * Threshold: articles with title similarity > 0.65 are considered duplicates.
 * Keeps the version with the richest description.
 */
export class Deduplicator {
    constructor(threshold = 0.65) {
        this.threshold = threshold;
    }

    deduplicate(articles) {
        // Step 1: Exact URL dedupe
        const byUrl = new Map();
        for (const a of articles) {
            const key = this._normalizeUrl(a.url);
            if (!byUrl.has(key) || this._richer(a, byUrl.get(key))) {
                byUrl.set(key, a);
            }
        }

        // Step 2: Fuzzy title dedupe
        const unique = [];
        for (const candidate of byUrl.values()) {
            const isDup = unique.some(existing =>
                this._titleSimilarity(candidate.title, existing.title) > this.threshold
            );
            if (!isDup) unique.push(candidate);
        }

        return unique;
    }

    _normalizeUrl(url = '') {
        return url
            .replace(/^https?:\/\/(www\.)?/, '')
            .replace(/\/$/, '')
            .toLowerCase();
    }

    _richer(a, b) {
        return (a.description || '').length > (b.description || '').length;
    }

    _titleSimilarity(t1 = '', t2 = '') {
        const words1 = new Set(this._tokenize(t1));
        const words2 = new Set(this._tokenize(t2));
        const intersection = new Set([...words1].filter(w => words2.has(w)));
        const union        = new Set([...words1, ...words2]);
        return union.size === 0 ? 0 : intersection.size / union.size;
    }

    _tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2); // Remove very short / stop words
    }
}
