import { Skeleton } from "@/components/ui/Skeleton";
import { TournamentParticipationCardSkeleton } from "@/components/tournaments/TournamentParticipationCard";
import styles from "./HomeContent.module.css";

export function HomeContentSkeleton() {
  return (
    <section className={styles.home} aria-busy="true">
      <div className={styles.hero}>
        <Skeleton className={styles.heroTitleSkeleton} />
        <Skeleton className={styles.heroTextSkeleton} />
      </div>

      <TournamentParticipationCardSkeleton />

      <section className={styles.section}>
        <Skeleton className={styles.sectionTitleSkeleton} />
        <ul className={styles.tournamentList}>
          {Array.from({ length: 2 }).map((_, index) => (
            <li className={styles.tournamentItem} key={index}>
              <Skeleton className={styles.tournamentTitleSkeleton} />
              <dl>
                {Array.from({ length: 3 }).map((__, detailIndex) => (
                  <div key={detailIndex}>
                    <Skeleton className={styles.tournamentLabelSkeleton} />
                    <Skeleton className={styles.tournamentValueSkeleton} />
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
