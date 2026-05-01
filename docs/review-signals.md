# Review Signals

ReviewRaven analyzes multiple signals to detect suspicious review patterns. These signals extend the base signals provided by `@reviewraven/shared-intelligence`.

## Signal Detection Architecture

Signals are detected in `src/lib/analysis.ts` via the `detectSignals()` function. Each signal has:
- A unique ID (SIG-S###, SIG-G###, or SIG-R###)
- A human-readable name
- A type: `SUSPICIOUS` or `SAFE`
- A weight (negative for suspicious, positive for safe)
- An explanation of why the signal fired

Shared signals are looked up via `createReviewRavenRegistry()` which merges:
- `sharedSignals` from `@reviewraven/shared-intelligence` (SIG-S001-S100, SIG-G001-G027)
- `reviewSpecificSignals` from `src/lib/review-signals/index.ts` (SIG-R001-R008)

## Shared-Intelligence Base Signals (Active in detectSignals)

| Signal ID | Name | Detection Logic |
| --- | --- | --- |
| SIG-S022 | Duplicate_Timestamps | 3+ reviews with exact same timestamp |
| SIG-S002 | Verified_Purchase_Deficit | <=20% verified when 5+ reviews |
| SIG-G001 | Verified_Purchase_Strong | >80% verified when 5+ reviews |
| SIG-S003 | Superlative_Clumping | >50% of snippets contain superlatives |
| SIG-S024 | Emotional_Extremity | 4+ exclamation marks or ALL CAPS |
| SIG-S100 | Ultimate_Suspicion | AI prompt leak ("as an ai", "language model") |
| SIG-S006 | Opening_Identity / Unique_Phrasing | Identical opening phrases across reviews |
| SIG-G005 | Natural_Phrasing | Unique phrasing across reviews |
| SIG-S008 | Author_Patterns | Sequential naming (first 5 chars match) |
| SIG-S005 | Low_Volume_Risk | Missing rating or review count |

## ReviewRaven-Specific Signals (SIG-R001 to SIG-R008)

These are actively detected in `detectSignals()`:

### SIG-R001: Review_Timing_Anomaly (weight: -30)

Detects reviews posted at unusual hours in bulk. If >60% of timestamps map to days 1-5 or 23-31 (suggesting end-of-month automation), fires this signal.

**Detection:** Parses YYYY-MM-DD from timestamps, checks day-of-month distribution.

### SIG-R002: Rating_Skew_Extreme (weight: -25)

Detects extremely skewed ratings. Rating >= 4.8 with 10+ reviews suggests inflation. Rating <= 1.5 with 10+ reviews suggests widespread issues.

**Detection:** Checks `data.rating` and `data.reviewCount` thresholds.

### SIG-R003: Language_Repetition (weight: -20)

Detects identical 5-word phrases across multiple reviews. If 3+ shared phrases found across the review corpus, fires this signal.

**Detection:** Sliding window of 5 words across all snippets, counts phrase occurrences.

### SIG-R004: Verified_Purchase_Absence (weight: -35)

Detects complete absence of verified purchase badges on 3+ reviews.

**Detection:** Checks if `data.isVerified` has zero `true` values.

### SIG-R005: Sentiment_Text_Mismatch (weight: -25)

Detects when star rating contradicts review text sentiment. High rating (>=4.0) with >40% negative-sentiment reviews, or low rating (<=2.5) with >40% positive-sentiment reviews.

**Detection:** Lexicon-based sentiment analysis using positive/negative word lists.

### SIG-R006: Reviewer_Diversity_Low (weight: -20)

Detects when <50% of reviewer names are unique (suggesting duplicate or templated profiles).

**Detection:** Compares unique name count to total name count.

### SIG-R007: Suspicious_Burst (weight: -40)

Detects review volume spike. If 50%+ of all reviews were posted on a single date, fires this signal.

**Detection:** Groups timestamps by date, checks if max daily count >= 50% of total.

### SIG-R008: Category_Normalization_Fail (weight: -15)

Detects rating patterns inconsistent with category norms. Supplements with >=4.5 rating and 50+ reviews, or electronics with >=4.9 rating and 100+ reviews.

**Detection:** Cross-references `data.category` with rating and review count thresholds.

## Signal Weighting

Signals are weighted according to category-specific rules defined in `src/lib/intel/categoryRegistry.ts`:

| Category | Adjusted Signals |
| --- | --- |
| electronics | SIG-S009 (1.2x), SIG-S010 (0.8x) |
| apparel | SIG-S002 (1.5x), SIG-S003 (0.8x) |
| niche | SIG-S010 (0.4x) |
| digital | SIG-G015 (0x) |
| tools | SIG-G002 (1.5x) |
| supplements | SIG-S002 (1.8x), SIG-S009 (1.5x) |

## False Positive Mitigation

- No single signal determines the verdict
- All signals are weighted according to category-specific rules
- Confidence score reflects data limitations
- UNKNOWN verdict is used when data is insufficient
- Evidence snippets are provided for suspicious signals

## What We Do NOT Claim

- We do not identify specific fake reviews
- We do not accuse sellers of fraud
- We do not make legal claims about product quality
- We report "suspicious patterns" and "low trust signals" only
