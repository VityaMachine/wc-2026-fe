import { apiGetAuth, apiPostAuth } from "@/lib/api";
import type { CreatePredictionPayload, Prediction } from "@/types/prediction";

type PredictionsResponse =
  | Prediction[]
  | {
      predictions?: Prediction[];
      items?: Prediction[];
      data?: Prediction[];
    };

type PredictionResponse =
  | Prediction
  | {
      prediction?: Prediction;
      data?: Prediction;
    };

function unwrapPredictions(response: PredictionsResponse): Prediction[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.predictions ?? response.items ?? response.data ?? [];
}

function unwrapPrediction(response: PredictionResponse): Prediction {
  if ("id" in response) {
    return response;
  }

  const prediction = response.prediction ?? response.data;

  if (!prediction) {
    throw new Error("Prediction response is empty.");
  }

  return prediction;
}

export async function getMyPredictions(token: string): Promise<Prediction[]> {
  const response = await apiGetAuth<PredictionsResponse>("/predictions/my", token);

  return unwrapPredictions(response);
}

export async function createPrediction(payload: CreatePredictionPayload, token: string): Promise<Prediction> {
  const response = await apiPostAuth<PredictionResponse, CreatePredictionPayload>("/predictions", payload, token);

  return unwrapPrediction(response);
}
