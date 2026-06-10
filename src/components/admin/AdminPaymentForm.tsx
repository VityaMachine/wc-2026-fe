"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/providers/AuthProvider";
import { confirmParticipantPayment } from "@/services/admin.service";
import type { PaymentStatus } from "@/types/admin";
import styles from "./AdminPaymentForm.module.css";

const paymentStatuses: PaymentStatus[] = ["PAID", "PENDING", "UNPAID", "FAILED"];

export function AdminPaymentForm() {
  const { isAuthenticated, isLoading, token, user } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("PAID");
  const [amount, setAmount] = useState(100);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!token || !email.trim()) {
      setError("Enter a user email.");
      return;
    }

    setIsSubmitting(true);

    try {
      await confirmParticipantPayment(
        {
          email: email.trim(),
          status,
          amount,
        },
        token,
      );
      setMessage("Payment status updated.");

      if (status === "PAID") {
        setEmail("");
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to update payment status.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <section className={styles.page}>
        <div className={styles.notice}>
          <LoadingSpinner />
          <p>Loading admin access...</p>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className={styles.page}>
        <div className={styles.notice}>
          <h1>Admin</h1>
          <p>Please log in to access admin tools.</p>
          <Link className={styles.linkButton} href="/login">
            Login
          </Link>
        </div>
      </section>
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <section className={styles.page}>
        <div className={styles.notice}>
          <h1>Access denied</h1>
          <p>Your account does not have admin permissions.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Admin</p>
          <h1>Payment confirmation</h1>
          <p>Update a World Cup 2026 participant payment status.</p>
        </div>

        {message ? <p className={styles.success}>{message}</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}

        <label className={styles.field}>
          <span>User email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>Payment status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as PaymentStatus)}>
            {paymentStatuses.map((paymentStatus) => (
              <option key={paymentStatus} value={paymentStatus}>
                {paymentStatus}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>Amount</span>
          <input
            type="number"
            min="0"
            step="1"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            required
          />
        </label>

        <button className={styles.submit} type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoadingSpinner size="sm" /> : null}
          <span>{isSubmitting ? "Updating..." : "Update payment"}</span>
        </button>
      </form>
    </section>
  );
}
