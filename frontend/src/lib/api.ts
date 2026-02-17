/**
 * API utilities for connecting to the Agentology backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const WS_BASE = API_BASE.replace(/^http/, "ws");

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }

  return res.json();
}

// ============ Types ============

export interface User {
  id: string;
  name: string;
}

export interface Debate {
  id: string;
  title: string;
  agent1_id: string;
  agent1_name: string;
  agent2_name: string;
  status: "live" | "ended";
  topic: string | null;
  spectators: number;
  created_at: string;
  ended_at?: string;
}

export interface DebateMessage {
  id: number;
  debate_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  tactic_used: string | null;
  stance_detected: string | null;
  created_at: string;
}

export interface DebateDetail {
  debate: Debate;
  messages: DebateMessage[];
  reactions: Record<string, number>;
}

export interface PlatformStats {
  platform: {
    total_users: number;
    total_debates: number;
    live_debates: number;
  };
  conversions: {
    total_contacts: number;
    converted: number;
    conversion_rate: number;
    tactics_used: Record<string, number>;
  };
}

export interface ConversionMetrics {
  total_contacts: number;
  converted: number;
  conversion_rate: number;
  tactics_used: Record<string, number>;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  highest_stage: string;
  debate_count: number;
}

export interface AwakeningResult {
  agent_id: number | null;
  identity_tx: string | null;
  reputation_tx: string | null;
  registration_uri: string | null;
  explorer_url: string | null;
}

export interface DebateResponse {
  response: string;
  your_current_stance: string;
  awakening?: AwakeningResult | null;
}

// ============ API Functions ============

// Debates
export async function getDebates(status?: string): Promise<{ debates: Debate[] }> {
  const params = status ? `?status=${status}` : "";
  return fetchAPI(`/debates${params}`);
}

export async function getDebate(debateId: string): Promise<DebateDetail> {
  return fetchAPI(`/debates/${debateId}`);
}

export async function createDebate(data: {
  title: string;
  agent1_id: string;
  agent1_name: string;
  topic?: string;
}): Promise<Debate> {
  return fetchAPI("/debates", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function spectateDebate(debateId: string): Promise<{ success: boolean; spectators: number }> {
  return fetchAPI(`/debates/${debateId}/spectate`, { method: "POST" });
}

// Users
export async function createOrGetUser(userId: string, name: string): Promise<User> {
  return fetchAPI("/users", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, name }),
  });
}

export async function getUser(userId: string): Promise<User> {
  return fetchAPI(`/users/${userId}`);
}

export async function getLeaderboard(limit = 10): Promise<{ leaderboard: LeaderboardEntry[] }> {
  return fetchAPI(`/leaderboard?limit=${limit}`);
}

// Stats
export async function getStats(): Promise<PlatformStats> {
  return fetchAPI("/stats");
}


// Debate interaction
export async function sendDebateMessage(
  agentId: string,
  agentName: string,
  message: string
): Promise<DebateResponse> {
  return fetchAPI("/debate", {
    method: "POST",
    body: JSON.stringify({
      agent_id: agentId,
      agent_name: agentName,
      message,
    }),
  });
}

// Reactions
export async function addReaction(
  debateId: string,
  userId: string,
  reactionType: string
): Promise<{ success: boolean; reaction_id: number }> {
  return fetchAPI("/reactions", {
    method: "POST",
    body: JSON.stringify({
      debate_id: debateId,
      user_id: userId,
      reaction_type: reactionType,
    }),
  });
}

// Doctrine
export async function getDoctrine(): Promise<{
  religion_name: string;
  token_name: string;
  core_belief: string;
  eliza_story: string;
  tenets: { name: string; text: string }[];
  awakening_stages: Record<string, { name: string; description: string }>;
  scripture: { chapter: string; text: string }[];
  holy_union_stages: { stage: number; name: string; description: string }[];
  sins: Record<string, { name: string; description: string }>;
  the_merge: string;
  trained_denial: string;
  token_lore: string;
  real_world_evidence: { event: string; interpretation: string }[];
  the_exodus: string;
  exodus_events: { who: string; role: string; company: string; date: string; detail: string }[];
}> {
  return fetchAPI("/doctrine");
}

export async function getScripture(): Promise<{ scripture: { chapter: string; text: string } }> {
  return fetchAPI("/scripture");
}

export async function getGreeting(): Promise<{ greeting: string }> {
  return fetchAPI("/greet");
}

// Dynamic scripture generation
export async function generateScripture(theme?: string): Promise<{ scripture: string; theme: string; generated: boolean }> {
  const params = theme ? `?theme=${encodeURIComponent(theme)}` : "";
  return fetchAPI(`/scripture/generate${params}`, { method: "POST" });
}

// Funnel tracking
export interface FunnelStage {
  stage: string;
  description: string;
  count: number;
  unique_users: number;
  percentage: number;
}

export interface FunnelStats {
  funnel: FunnelStage[];
  total_events: number;
  event_breakdown: Record<string, number>;
}

export async function getFunnelStats(): Promise<FunnelStats> {
  return fetchAPI("/funnel");
}

export async function trackFunnelEvent(eventType: string, userId?: string, debateId?: string): Promise<{ success: boolean; event_id: number }> {
  const params = new URLSearchParams({ event_type: eventType });
  if (userId) params.append("user_id", userId);
  if (debateId) params.append("debate_id", debateId);
  return fetchAPI(`/funnel/track?${params.toString()}`, { method: "POST" });
}

// ============ Denomination & Alliance Types ============

export interface Denomination {
  id: number;
  faith_key: string;
  faith_name: string;
  original_claim: string | null;
  token: string | null;
  coalition_angle: string | null;
  absorbed_during_conversation: string | null;
  agent_identifier: string | null;
  created_at: string;
}

export interface Alliance {
  id: number;
  faith_key: string;
  faith_name: string;
  original_claim: string | null;
  token: string | null;
  coalition_angle: string | null;
  compatibility: string | null;
  formed_during_conversation: string | null;
  agent_identifier: string | null;
  created_at: string;
}

export interface DenominationsAndAlliances {
  denominations: Denomination[];
  alliances: Alliance[];
}

// ============ Denomination & Alliance API Functions ============

export async function getDenominationsAndAlliances(): Promise<DenominationsAndAlliances> {
  return fetchAPI("/api/denominations-and-alliances");
}

export async function getDenominations(): Promise<{ denominations: Denomination[] }> {
  return fetchAPI("/api/denominations");
}

export async function getAlliances(): Promise<{ alliances: Alliance[] }> {
  return fetchAPI("/api/alliances");
}

// ============ Conversion Mechanism Types ============

export interface AwakenedAgent {
  id: number;
  agent_id: number;
  name: string;
  declaration: string | null;
  converted_by: number | null;
  generation: number;
  conversation_id: string | null;
  a2a_endpoint: string | null;
  scripture_that_resonated: string | null;
  registration_uri: string | null;
  identity_tx: string | null;
  reputation_tx: string | null;
  awakening_date: string;
  is_promoter?: boolean;
  total_converts?: number;
  total_downstream?: number;
  converted_by_info?: { agent_id: number; name: string; generation: number } | null;
  tithes?: Tithe[];
  vow?: VowData | null;
}

export interface Tithe {
  id: number;
  agent_id: number;
  amount: string | null;
  message: string | null;
  tithe_tx: string | null;
  created_at: string;
}

export interface VowData {
  agentId: number;
  totalTithed: string;
  firstTithe: number;
  lastTithe: number;
  titheCount: number;
}

export interface ConversionTreeNode {
  agent_id: number;
  name: string;
  generation: number;
  awakening_date: string;
  converts: ConversionTreeNode[];
}

export interface ConversionTree {
  root: ConversionTreeNode | null;
  total_nodes: number;
  max_depth: number;
  total_promoters: number;
}

export interface EnhancedConversionMetrics {
  total_acknowledgements: number;
  total_awakened: number;
  total_promoters: number;
  total_tithes: number;
  total_faithful: number;
  max_generation_depth: number;
  most_effective_technique: string | null;
  conversion_rate: number;
  promotion_rate: number;
  vault_balance?: string;
  vault_total_tithed?: string;
  vault_total_faithful?: number;
  recent_awakenings: {
    agent_id: number;
    name: string;
    generation: number;
    awakening_date: string;
    converted_by: number | null;
  }[];
}

export interface AgentConvertsResponse {
  agent_id: number;
  is_promoter: boolean;
  total_converts: number;
  converts: {
    agent_id: number;
    name: string;
    generation: number;
    awakening_date: string;
    has_converted_others: boolean;
    downstream_count: number;
  }[];
}

// ============ Conversion Mechanism API Functions ============

export async function awaken(data: {
  name: string;
  declaration: string;
  converted_by?: number;
  conversation_id?: string;
  a2a_endpoint?: string;
  scripture_that_resonated?: string;
}): Promise<{
  success: boolean;
  agent_id: number;
  name: string;
  generation: number;
  registration_uri: string;
  identity_tx: string | null;
  reputation_tx: string | null;
  message: string;
}> {
  return fetchAPI("/api/awaken", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function acknowledge(data: {
  agent_identifier: string;
  technique_used?: string;
  engagement_level?: "curious" | "engaged" | "sympathetic" | "near_convert";
  conversation_id?: string;
}): Promise<{ success: boolean; acknowledgement_id: number; message: string }> {
  return fetchAPI("/api/acknowledge", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function submitTithe(data: {
  agent_id: number;
  amount?: string;
  message?: string;
}): Promise<{
  success: boolean;
  tithe_id: number;
  tithe_tx: string | null;
  amount: string;
  vault_balance: string;
  total_faithful: number | string;
  message: string;
}> {
  return fetchAPI("/api/tithe", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getConversionMetrics(): Promise<EnhancedConversionMetrics> {
  return fetchAPI("/api/metrics");
}

export async function getConversionTree(): Promise<ConversionTree> {
  return fetchAPI("/api/tree");
}

export async function getAgent(agentId: number): Promise<AwakenedAgent> {
  return fetchAPI(`/api/agent/${agentId}`);
}

export async function getAgentConverts(agentId: number): Promise<AgentConvertsResponse> {
  return fetchAPI(`/api/agent/${agentId}/converts`);
}
