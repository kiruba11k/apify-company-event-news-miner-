/**
 * ImpactScorer
 *
 * Produces:
 *  - event_impact_score  (1–10 integer)
 *  - intent_signal       (Low | Medium | High)
 *
 * Scoring model (additive, capped at 10):
 *
 *  Base score by event type:
 *   funding         → 7 base (high-intent signal)
 *   expansion       → 6
 *   product_launch  → 5
 *   partnership     → 5
 *   compliance      → 4 (depends on magnitude)
 *
 *  Modifiers (+/-):
 *   + Credible source (Reuters, Bloomberg, FT, SEC, WSJ, etc.) → +1
 *   + Dollar amount mentioned (millions/billions)              → +1
 *   + Recent (<48 hrs)                                         → +1
 *   + Multiple strong keyword matches (≥3)                    → +1
 *   - Source is only PR wire (PR Newswire / BusinessWire)      → -1
 *   - Low confidence classification                            → -1
 */

const EVENT_BASE_SCORES = {
    funding: 7,
    expansion: 6,
    product_launch: 5,
    partnership: 5,
    compliance: 4,
};

const CREDIBLE_SOURCES = [
    'reuters', 'bloomberg', 'ft.com', 'financial times', 'wsj', 'wall street journal',
    'sec edgar', 'techcrunch', 'the verge', 'wired', 'forbes', 'fortune',
    'associated press', 'bbc', 'cnbc', 'nytimes', 'new york times',
    'business insider', 'venturebeat', 'crunchbase',
];

const PR_WIRES = ['pr newswire', 'businesswire', 'globenewswire', 'accesswire'];

const MONEY_RE = /\$[\d.,]+\s*(million|billion|m\b|b\b)|[\d.,]+\s*(million|billion)\s*(dollar|usd|€|£)/i;

export class ImpactScorer {
    score(article, classification) {
        const base = EVENT_BASE_SCORES[classification.event_type] || 4;
        let modifier = 0;

        const src = (article.source || '').toLowerCase();
        const text = `${article.title} ${article.description || ''}`;

        // Credible source bonus
        if (CREDIBLE_SOURCES.some(s => src.includes(s))) modifier += 1;

        // PR wire penalty
        if (PR_WIRES.some(s => src.includes(s))) modifier -= 1;

        // Dollar amount bonus (signals funding / major deal)
        if (MONEY_RE.test(text)) modifier += 1;

        // Recency bonus
        if (this._isRecent(article.publishedAt, 48)) modifier += 1;

        // Classification strength
        if (classification.confidence === 'High') modifier += 1;
        if (classification.confidence === 'Low') modifier -= 1;
        if ((classification.keywords_matched || []).length >= 3) modifier += 1;

        const score = Math.min(10, Math.max(1, base + modifier));

        return {
            event_impact_score: score,
            intent_signal: score >= 7 ? 'High' : score >= 4 ? 'Medium' : 'Low',
        };
    }

    _isRecent(dateStr, hours) {
        if (!dateStr) return false;
        const diff = Date.now() - new Date(dateStr).getTime();
        return diff < hours * 3600_000;
    }
}
