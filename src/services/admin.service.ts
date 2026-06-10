import { apiPatchAuth } from "@/lib/api";
import type { ConfirmParticipantPaymentPayload } from "@/types/admin";

const TOURNAMENT_SLUG = "world-cup-2026";

export async function confirmParticipantPayment(payload: ConfirmParticipantPaymentPayload, token: string) {
  return apiPatchAuth<unknown, ConfirmParticipantPaymentPayload>(
    `/tournaments/${TOURNAMENT_SLUG}/participant/payment`,
    payload,
    token,
  );
}
