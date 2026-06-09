import Link from "next/link";
import styles from "./Pagination.module.css";

type PaginationProps = {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  labels: {
    previous: string;
    next: string;
    page: string;
    of: string;
  };
};

export function Pagination({ page, totalPages, buildHref, labels }: PaginationProps) {
  const normalizedTotalPages = Math.max(totalPages, 1);
  const canGoPrevious = page > 1;
  const canGoNext = page < normalizedTotalPages;

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      {canGoPrevious ? (
        <Link className={styles.link} href={buildHref(page - 1)}>
          {labels.previous}
        </Link>
      ) : (
        <span className={`${styles.link} ${styles.disabled}`} aria-disabled="true">
          {labels.previous}
        </span>
      )}

      <span className={styles.current}>
        {labels.page} {page} {labels.of} {normalizedTotalPages}
      </span>

      {canGoNext ? (
        <Link className={styles.link} href={buildHref(page + 1)}>
          {labels.next}
        </Link>
      ) : (
        <span className={`${styles.link} ${styles.disabled}`} aria-disabled="true">
          {labels.next}
        </span>
      )}
    </nav>
  );
}
