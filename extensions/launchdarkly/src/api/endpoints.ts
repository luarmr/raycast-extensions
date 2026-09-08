import { ldFetch } from "./client";
import {
  LDAuditLogEntry,
  LDAuditLogResponse,
  LDEnvironment,
  LDFlag,
  LDFlagStatusResponse,
  LDMember,
  LDPaginated,
  LDProject,
  LDSegment,
} from "../types";

const enc = encodeURIComponent;

export function fetchFlag(projectKey: string, flagKey: string): Promise<LDFlag> {
  return ldFetch<LDFlag>(`/api/v2/flags/${enc(projectKey)}/${enc(flagKey)}`);
}

export async function fetchProjects(): Promise<LDProject[]> {
  const result = await ldFetch<LDPaginated<LDProject>>("/api/v2/projects", { limit: 100, sort: "name" });
  return result.items ?? [];
}

export async function fetchEnvironments(projectKey: string): Promise<LDEnvironment[]> {
  const result = await ldFetch<LDPaginated<LDEnvironment>>(`/api/v2/projects/${enc(projectKey)}/environments`, {
    limit: 100,
  });
  return result.items ?? [];
}

export function fetchFlagStatus(projectKey: string, flagKey: string): Promise<LDFlagStatusResponse> {
  return ldFetch<LDFlagStatusResponse>(`/api/v2/flag-status/${enc(projectKey)}/${enc(flagKey)}`);
}

export async function fetchFlagTags(): Promise<string[]> {
  const result = await ldFetch<LDPaginated<string>>("/api/v2/tags", { kind: "flag", limit: 100 });
  return result.items ?? [];
}

export async function fetchSegments(projectKey: string, environmentKey: string): Promise<LDSegment[]> {
  const result = await ldFetch<LDPaginated<LDSegment>>(`/api/v2/segments/${enc(projectKey)}/${enc(environmentKey)}`, {
    limit: 100,
  });
  return result.items ?? [];
}

export function fetchMe(): Promise<LDMember> {
  return ldFetch<LDMember>("/api/v2/members/me");
}

export interface AuditLogQuery {
  projectKey: string;
  flagKey?: string;
  environmentKey?: string;
  /** Unix epoch millis; only entries before this timestamp are returned. */
  before?: number;
}

/** The audit log endpoint caps `limit` at 20. */
export const AUDIT_LOG_PAGE_SIZE = 20;

export async function fetchAuditLog(query: AuditLogQuery): Promise<LDAuditLogEntry[]> {
  const spec = `proj/${query.projectKey}:env/${query.environmentKey ?? "*"}:flag/${query.flagKey ?? "*"}`;
  const result = await ldFetch<LDAuditLogResponse>("/api/v2/auditlog", {
    spec,
    limit: AUDIT_LOG_PAGE_SIZE,
    before: query.before,
  });
  return result.items ?? [];
}
