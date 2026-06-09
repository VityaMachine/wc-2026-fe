import styles from "./LoadingSpinner.module.css";

type LoadingSpinnerProps = {
  className?: string;
  size?: "sm" | "md";
};

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const classes = [styles.spinner, styles[size], className].filter(Boolean).join(" ");

  return <span className={classes} aria-hidden="true" />;
}
