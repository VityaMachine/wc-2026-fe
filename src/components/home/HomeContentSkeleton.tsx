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

      <div className={styles.infoSections}>
        {Array.from({ length: 4 }).map((_, index) => (
          <section className={styles.infoCard} key={index}>
            <Skeleton className={styles.sectionTitleSkeleton} />
            <Skeleton className={styles.infoLineSkeleton} />
            <Skeleton className={styles.infoLineShortSkeleton} />
          </section>
        ))}
      </div>
    </section>
  );
}
