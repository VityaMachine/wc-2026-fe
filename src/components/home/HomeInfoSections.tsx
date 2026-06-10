import { useLocale } from "@/providers/LocaleProvider";
import { TELEGRAM_CHANNEL_URL } from "@/config/links";
import type { TranslationKey } from "@/lib/i18n";
import styles from "./HomeContent.module.css";

const participationRuleKeys = [
  "homeRuleRegister",
  "homeRulePredict",
  "homeRuleLockedPrediction",
  "homeRuleHiddenPredictions",
  "homeRuleAutoPoints",
  "homeRulePaidPrize",
  "homeRulePaidVoluntary",
  "homeRulePaidMinimum",
] as const satisfies readonly TranslationKey[];

const scoringRules: Array<{ label: TranslationKey; points: TranslationKey }> = [
  {
    label: "homeScoringExact",
    points: "homeScoringExactPoints",
  },
  {
    label: "homeScoringDraw",
    points: "homeScoringDrawPoints",
  },
  {
    label: "homeScoringGoalDifference",
    points: "homeScoringGoalDifferencePoints",
  },
  {
    label: "homeScoringWinner",
    points: "homeScoringWinnerPoints",
  },
  {
    label: "homeScoringTotalGoals",
    points: "homeScoringTotalGoalsPoints",
  },
];

const examples: Array<{
  actual: string;
  prediction: string;
  awarded: TranslationKey;
  reason: TranslationKey;
  note?: TranslationKey;
}> = [
  {
    actual: "2:1",
    prediction: "2:1",
    awarded: "homeExample1Awarded",
    reason: "homeExample1Reason",
  },
  {
    actual: "3:1",
    prediction: "2:0",
    awarded: "homeExample2Awarded",
    reason: "homeExample2Reason",
    note: "homeExample2Note",
  },
  {
    actual: "1:1",
    prediction: "0:0",
    awarded: "homeExample3Awarded",
    reason: "homeExample3Reason",
  },
];

export function HomeInfoSections() {
  const { t } = useLocale();

  return (
    <div className={styles.infoSections}>
      <section className={styles.infoCard}>
        <h2>{t("homeAboutTitle")}</h2>
        <div className={styles.textStack}>
          <p>{t("homeAboutText1")}</p>
          <p>{t("homeAboutText2")}</p>
        </div>
        <div className={styles.tierGrid} aria-label={t("homeParticipationTypesLabel")}>
          <div className={styles.tierItem}>
            <strong>FREE</strong>
            <span>{t("homeFreeDescription")}</span>
          </div>
          <div className={styles.tierItem}>
            <strong>PAID</strong>
            <span>{t("homePaidDescription")}</span>
          </div>
        </div>
      </section>

      <section className={styles.infoCard}>
        <h2>{t("homeTelegramTitle")}</h2>
        <p>{t("homeTelegramText")}</p>
        <a className={styles.telegramButton} href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
          {t("homeTelegramCta")}
        </a>
      </section>

      <section className={styles.infoCard}>
        <h2>{t("homeRulesTitle")}</h2>
        <ol className={styles.ruleList}>
          {participationRuleKeys.map((ruleKey) => (
            <li key={ruleKey}>{t(ruleKey)}</li>
          ))}
        </ol>
        <div className={styles.participationSummary} aria-label={t("homeParticipationSummaryLabel")}>
          <div>
            <strong>FREE</strong>
            <span>{t("homeSummaryFree")}</span>
          </div>
          <div>
            <strong>PAID</strong>
            <span>{t("homeSummaryPaid")}</span>
          </div>
          <div>
            <strong>{t("homeSummaryMinimumTitle")}</strong>
            <span>{t("homeSummaryMinimum")}</span>
          </div>
        </div>
      </section>

      <section className={styles.infoCard}>
        <h2>{t("homePrizeTitle")}</h2>
        <p>{t("homePrizeText")}</p>
        <div className={styles.prizeGrid} aria-label={t("homePrizeDistributionLabel")}>
          <div>
            <strong>{t("homePrizeFirst")}</strong>
            <span>50%</span>
          </div>
          <div>
            <strong>{t("homePrizeSecond")}</strong>
            <span>30%</span>
          </div>
          <div>
            <strong>{t("homePrizeThird")}</strong>
            <span>20%</span>
          </div>
        </div>
      </section>

      <section className={styles.infoCard}>
        <h2>{t("homeScoringTitle")}</h2>
        <p>{t("homeScoringExplanation")}</p>
        <strong className={styles.scoringPriorityTitle}>{t("homeScoringPriorityLabel")}</strong>
        <div className={styles.scoringGrid} aria-label={t("homeScoringPriorityLabel")}>
          {scoringRules.map((rule) => (
            <div className={styles.scoringItem} key={rule.label}>
              <span>{t(rule.label)}</span>
              <strong>{t(rule.points)}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.infoCard}>
        <h2>{t("homeExamplesTitle")}</h2>
        <div className={styles.exampleGrid}>
          {examples.map((example) => (
            <article className={styles.exampleCard} key={`${example.actual}-${example.prediction}`}>
              <dl>
                <div>
                  <dt>{t("homeExampleActual")}</dt>
                  <dd>{example.actual}</dd>
                </div>
                <div>
                  <dt>{t("homeExamplePrediction")}</dt>
                  <dd>{example.prediction}</dd>
                </div>
                <div>
                  <dt>{t("homeExampleAwarded")}</dt>
                  <dd>{t(example.awarded)}</dd>
                </div>
              </dl>
              <p className={styles.exampleNote}>
                <strong>{t("homeExampleReasonLabel")}</strong> {t(example.reason)}
              </p>
              {example.note ? (
                <p className={styles.exampleNote}>
                  <strong>{t("homeExampleNoteLabel")}</strong> {t(example.note)}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
