import { Skeleton } from "@/components/ui/Skeleton";
import tableStyles from "./StandingsTable.module.css";
import styles from "./StandingsContent.module.css";

export function StandingsContentSkeleton() {
  return (
    <section className={styles.standings} aria-busy="true">
      <div className={styles.header}>
        <Skeleton className={styles.titleSkeleton} />
        <Skeleton className={styles.subtitleSkeleton} />
      </div>

      <div className={styles.groups}>
        {Array.from({ length: 3 }).map((_, groupIndex) => (
          <section className={tableStyles.group} key={groupIndex}>
            <Skeleton className={styles.groupTitleSkeleton} />
            <div className={tableStyles.tableWrap}>
              <table className={tableStyles.table} aria-hidden="true">
                <thead>
                  <tr>
                    {Array.from({ length: 10 }).map((__, index) => (
                      <th key={index}>
                        <Skeleton className={styles.tableHeadSkeleton} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 4 }).map((__, rowIndex) => (
                    <tr key={rowIndex}>
                      {Array.from({ length: 10 }).map((___, cellIndex) => (
                        <td key={cellIndex}>
                          <Skeleton className={cellIndex === 1 ? styles.teamCellSkeleton : styles.tableCellSkeleton} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
