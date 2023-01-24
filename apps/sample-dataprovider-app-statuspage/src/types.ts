type WebtriggerRequest = {
  body: string;
};

type WebtriggerResponse = {
  body: string;
  statusCode: number;
  headers: Record<string, unknown>;
};

type ForgeTriggerContext = {
  installContext: string;
};

type BaseStatuspageEvent = {
  meta: {
    unsubscribe: string;
    documentation: string;
  };
  page: {
    id: string;
    status_indicator: string;
    status_description: string;
  };
};

type IncidentUpdate = {
  body: string;
  created_at: string;
  display_at: string;
  status: string;
  twitter_updated_at: string | null;
  updated_at: string;
  wants_twitter_update: boolean;
  id: string;
  incident_id: string;
};

type ComponentUpdateEvent = BaseStatuspageEvent & {
  component_update: {
    created_at: string;
    new_status: string;
    old_status: string;
    id: string;
    component_id: string;
  };
  component: {
    created_at: string;
    id: string;
    name: string;
    status: string;
  };
};
type StatuspageIncident = {
  backfilled: boolean;
  created_at: string;
  impact: string;
  impact_override: string;
  monitoring_at: string;
  postmortem_body: string;
  postmortem_body_last_updated_at: string;
  postmortem_ignored: boolean;
  postmortem_notified_subscribers: boolean;
  postmortem_notified_twitter: boolean;
  postmortem_published_at: string;
  resolved_at: string;
  scheduled_auto_transition: boolean;
  scheduled_for: string;
  scheduled_remind_prior: boolean;
  scheduled_reminded_at: string;
  scheduled_until: string;
  shortlink: string;
  status: string;
  updated_at: string;
  id: string;
  organization_id: string;
  incident_updates: IncidentUpdate[];
  name: string;
};
type IncidentUpdateEvent = BaseStatuspageEvent & {
  incident: StatuspageIncident;
};

type StatuspageEvent = ComponentUpdateEvent | IncidentUpdateEvent;

export {
  WebtriggerRequest,
  WebtriggerResponse,
  ForgeTriggerContext,
  IncidentUpdateEvent,
  StatuspageEvent,
  StatuspageIncident,
};
