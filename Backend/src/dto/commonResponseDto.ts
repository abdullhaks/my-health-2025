export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
}

export interface IResponseDTO {
  success?: boolean;
  message?: string;
  data?: unknown;
  subscription?: string;
  accessToken?: string;
}

import { ObjectId } from "mongodb";

export interface UpdateResult {
  acknowledged: boolean;
  matchedCount: number;
  modifiedCount: number;
  upsertedCount: number;
  upsertedId: ObjectId | null;
}