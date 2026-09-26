export const STATUS_OPTIONS = [
  { value: "standby", label: "STANDBY" },
  { value: "watch", label: "WATCH" },
  { value: "activated", label: "ACTIVATED" },
  { value: "clearing", label: "INITIAL CLEARING" },
  { value: "post_plow", label: "POST-PLOW" },
  { value: "complete", label: "COMPLETE" }
];

export const SNOWFALL_OPTIONS = [
  "5 cm",
  "10 cm",
  "15 cm",
  "20+ cm",
  "Heavy / wet snow",
  "Drifting",
  "Freezing rain",
  "Custom"
];

export const AREA_OPTIONS = ["Milton", "Oakville", "Burlington", "West Mississauga"];
export const BUFFER_OPTIONS = [15, 20, 30, 45, 60];
export const DELAY_OPTIONS = [0, 15, 30, 60];

export const MESSAGE_PRESETS = {
  "standard-standby": {
    label: "Standard standby",
    title: "NO ACTIVE SERVICE EVENT",
    chip: "STANDBY",
    stage: "Monitoring",
    message: "No qualifying SnowRescue service event is active at this time. We continue monitoring winter conditions across our active service areas."
  },
  "storm-watch": {
    label: "Storm watch",
    title: "WINTER EVENT WATCH",
    chip: "WATCH",
    stage: "Monitoring",
    message: "SnowRescue is monitoring a developing winter system that may reach the service activation threshold. Routes are not yet active."
  },
  "service-activated": {
    label: "Service activated",
    title: "SERVICE ACTIVATED",
    chip: "ACTIVATED",
    stage: "Activated",
    message: "Qualifying conditions have activated SnowRescue service. Crews are preparing to enter residential routes."
  },
  "initial-clearing": {
    label: "Initial clearing active",
    title: "INITIAL CLEARING ACTIVE",
    chip: "CLEARING",
    stage: "Initial Clearing",
    message: "SnowRescue crews are actively servicing residential properties across active routes."
  },
  "heavy-accumulation": {
    label: "Heavy accumulation delay",
    title: "INITIAL CLEARING ACTIVE",
    chip: "CLEARING",
    stage: "Initial Clearing",
    message: "SnowRescue routes remain active. Heavy accumulation is extending normal service timing while crews continue residential clearing."
  },
  "road-access-delay": {
    label: "Road access delay",
    title: "ROUTES ACTIVE — TIMING ADJUSTED",
    chip: "ACTIVE",
    stage: "Initial Clearing",
    message: "SnowRescue routes remain active. Road access and municipal plow activity are affecting travel times, so customer timing is being adjusted."
  },
  "post-plow": {
    label: "Post-plow monitoring",
    title: "POST-PLOW MONITORING",
    chip: "POST-PLOW",
    stage: "Post-Plow Monitoring",
    message: "Initial clearing is progressing and municipal plow activity is being monitored for eligible post-plow service."
  },
  "event-complete": {
    label: "Event complete",
    title: "SERVICE EVENT COMPLETE",
    chip: "COMPLETE",
    stage: "Event Complete",
    message: "The active SnowRescue service event has been completed. Property-specific follow-up will continue where required."
  },
  "custom": {
    label: "Custom message",
    title: "SNOWRESCUE SERVICE UPDATE",
    chip: "UPDATE",
    stage: "Service Update",
    message: "SnowRescue has posted a service update for the current winter event."
  }
};

export const STATUS_DEFAULT_PRESET = {
  standby: "standard-standby",
  watch: "storm-watch",
  activated: "service-activated",
  clearing: "initial-clearing",
  post_plow: "post-plow",
  complete: "event-complete"
};

export function publicPresentation(state) {
  const preset = MESSAGE_PRESETS[state.messagePreset] || MESSAGE_PRESETS[STATUS_DEFAULT_PRESET[state.status]] || MESSAGE_PRESETS["standard-standby"];
  const message = state.customMessage?.trim() || preset.message;
  return {
    title: preset.title,
    chip: preset.chip,
    stage: preset.stage,
    message
  };
}
