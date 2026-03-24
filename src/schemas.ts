import * as z from 'zod';

export const IssueParamsSchema = z.object({
  source: z.string(),
  id: z.string(),
});
export type IssueParams = z.infer<typeof IssueParamsSchema>;

export const StatusParamsSchema = z.object({
  sessionId: z.string(),
});
export type StatusParams = z.infer<typeof StatusParamsSchema>;

export const RevokeParamsSchema = z.object({
  sessionId: z.string(),
});
export type RevokeParams = z.infer<typeof RevokeParamsSchema>;

export const IssueResultOAuthSchema = z.object({
  type: z.literal('oauth'),
  sessionId: z.string(),
  url: z.string(),
  callbackState: z.string(),
});
export type IssueResultOAuth = z.infer<typeof IssueResultOAuthSchema>;

export const IssueResultDirectSchema = z.object({
  type: z.literal('direct'),
  sessionId: z.string(),
});
export type IssueResultDirect = z.infer<typeof IssueResultDirectSchema>;

export const IssueResultSchema = z.discriminatedUnion('type', [
  IssueResultOAuthSchema,
  IssueResultDirectSchema,
]);
export type IssueResult = z.infer<typeof IssueResultSchema>;

export type ProviderIssueResult = IssueResult;

export const MappingResultSchema = z.record(z.string(), z.unknown());
export type MappingResult = z.infer<typeof MappingResultSchema>;

export const SessionStatusEnum = z.enum(['pending', 'issued', 'revoked', 'expired', 'aborted']);
export type SessionStatus = z.infer<typeof SessionStatusEnum>;

export const StatusResultSchema = z.object({
  sessionId: z.string(),
  status: SessionStatusEnum,
});
export type StatusResult = z.infer<typeof StatusResultSchema>;

export const RevokeResultSchema = z.object({
  sessionId: z.string(),
});
export type RevokeResult = z.infer<typeof RevokeResultSchema>;

export const IssuanceStatusEnum = z.enum(['pending', 'issued', 'aborted']);
export type IssuanceStatus = z.infer<typeof IssuanceStatusEnum>;

export interface IssuanceEvent {
  sessionId: string;
  status: IssuanceStatus;
  context: {
    source: string;
    id: string;
    attestation: string;
  };
}

export interface EventMap {
  issuance: IssuanceEvent;
}

export type EventHandler<T> = (event: T) => Promise<void>;
