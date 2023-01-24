import {
  CompassCreateIncidentEventInput,
  CompassIncidentEventState,
  CompassIncidentEventSeverityLevel,
  DataProviderIncidentEvent,
} from '@atlassian/forge-graphql';
import { StatuspageIncident } from '../types';

function getState(status: string): CompassIncidentEventState {
  switch (status) {
    case 'investigating':
      return CompassIncidentEventState.Open;
    case 'identified':
      return CompassIncidentEventState.Open;
    case 'monitoring':
      return CompassIncidentEventState.Open;
    case 'in_progress':
      return CompassIncidentEventState.Open;
    case 'verifying':
      return CompassIncidentEventState.Open;
    case 'resolved':
      return CompassIncidentEventState.Resolved;
    case 'completed':
      return CompassIncidentEventState.Resolved;
    default:
      return CompassIncidentEventState.Resolved;
  }
}
function getSeverity(impact: string): CompassIncidentEventSeverityLevel {
  switch (impact) {
    case 'none':
      return CompassIncidentEventSeverityLevel.Five;
    case 'minor':
      return CompassIncidentEventSeverityLevel.Four;
    case 'major':
      return CompassIncidentEventSeverityLevel.Three;
    case 'critical':
      return CompassIncidentEventSeverityLevel.One;
    case 'maintenance':
      return CompassIncidentEventSeverityLevel.Four;
    default:
      return CompassIncidentEventSeverityLevel.Five;
  }
}

export function toIncidentEvent(incident: StatuspageIncident, pageCode: string): CompassCreateIncidentEventInput {
  const lastIncidentUpdate = incident.incident_updates[0];
  return {
    externalEventSourceId: pageCode,
    displayName: incident.name,
    description: `${lastIncidentUpdate.body}`,
    lastUpdated: incident.updated_at,
    updateSequenceNumber: Date.now(),
    url: incident.shortlink,
    incidentProperties: {
      id: incident.id,
      state: getState(lastIncidentUpdate.status),
      severity: {
        label: incident.impact,
        level: getSeverity(incident.impact),
      },
      startTime: incident.created_at,
      endTime: incident.resolved_at,
    },
  };
}

export function toDataProviderIncident(incident: StatuspageIncident): DataProviderIncidentEvent {
  const lastIncidentUpdate = incident.incident_updates[0];
  return {
    displayName: incident.name,
    description: `${lastIncidentUpdate.body}`,
    lastUpdated: incident.updated_at,
    updateSequenceNumber: Date.now(),
    url: incident.shortlink,
    id: incident.id,
    state: getState(lastIncidentUpdate.status),
    severity: {
      label: incident.impact,
      level: getSeverity(incident.impact),
    },
    startTime: incident.created_at,
    endTime: incident.resolved_at,
  };
}
