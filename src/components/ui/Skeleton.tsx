import styles from "./Skeleton.module.css";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return <span className={className ? `${styles.skeleton} ${className}` : styles.skeleton} aria-hidden="true" />;
}
