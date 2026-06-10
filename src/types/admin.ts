export type PaymentStatus = "PAID" | "PENDING" | "UNPAID" | "FAILED";

export type ConfirmParticipantPaymentPayload = {
  email: string;
  status: PaymentStatus;
  amount: number;
};
