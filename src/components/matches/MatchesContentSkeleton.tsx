import { Skeleton } from "@/components/ui/Skeleton";
import cardStyles from "./MatchCard.module.css";
import styles from "./MatchesContent.module.css";

export function MatchesContentSkeleton() {
  return (
    <section className={styles.matches} aria-busy="true">
      <div className={styles.header}>
        <div>
          <Skeleton className={styles.titleSkeleton} />
          <Skeleton className={styles.subtitleSkeleton} />
        </div>
        <div className={styles.count}>
          <Skeleton className={styles.countLabelSkeleton} />
          <Skeleton className={styles.countValueSkeleton} />
        </div>
      </div>

      <section className={styles.filters} aria-hidden="true">
        <Skeleton className={styles.filterHeadingSkeleton} />
        {Array.from({ length: 3 }).map((_, index) => (
          <div className={styles.filterSkeleton} key={index}>
            <Skeleton className={styles.filterLabelSkeleton} />
            <Skeleton className={styles.filterSelectSkeleton} />
          </div>
        ))}
      </section>

      <div className={styles.list}>
        {Array.from({ length: 6 }).map((_, index) => (
          <article className={cardStyles.item} key={index}>
            <div className={cardStyles.row}>
              <span className={cardStyles.homeTeam}>
                <Skeleton className={styles.teamLogoSkeleton} />
                <Skeleton className={styles.teamNameSkeleton} />
              </span>
              <span className={cardStyles.center}>
                <Skeleton className={styles.dateSkeleton} />
                <Skeleton className={styles.timeSkeleton} />
              </span>
              <span className={cardStyles.awayTeam}>
                <Skeleton className={styles.teamNameSkeleton} />
                <Skeleton className={styles.teamLogoSkeleton} />
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
