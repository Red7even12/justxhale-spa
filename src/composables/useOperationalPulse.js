/**
 * Operational Pulse — shared key-case tolerant accessors.
 *
 * The Daily Pulse telemetry stream is sourced from the
 * vw_unresolved_operational_defects SQL view and returned through the global
 * CamelCaseResponseMiddleware, so object keys arrive camelCased. These
 * accessors read camelCase first and fall back to snake_case, guaranteeing that
 * every Pulse surface behaves identically across deployments:
 *
 *   - CaseIndex.vue                 (Operational Exceptions tab)
 *   - OperationalPulseDashboard.vue (standalone /telemetry/pulse page)
 */

/**
 * A defect that must be red-tagged / float to the top of the queue.
 */
export const isSafetyCriticalDefect = (item) => {
  const severity = item?.defectSeverity ?? item?.defect_severity;
  return severity === 'safety_critical_ground';
};

/**
 * Stable list key + CAPA resolve endpoint id: logId (camelCase), log_id, id.
 * Falls back to the list index so a v-for :key is always defined.
 */
export const pulseDefectId = (item, index) => item?.logId ?? item?.log_id ?? item?.id ?? index;

/**
 * Composable entry point.
 *
 * const { isSafetyCriticalDefect, pulseDefectId } = useOperationalPulse();
 */
export function useOperationalPulse() {
  return {
    isSafetyCriticalDefect,
    pulseDefectId,
  };
}
