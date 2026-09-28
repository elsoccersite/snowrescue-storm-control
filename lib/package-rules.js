export const PACKAGE_RULES = {
  Essential: {
    targetMin: 10,
    targetMax: 12,
    postPlowIncluded: 0,
    defaultScope: ["Seasonal driveway clearing"]
  },
  Premium: {
    targetMin: 8,
    targetMax: 10,
    postPlowIncluded: 4,
    defaultScope: ["Seasonal driveway clearing", "Primary pedestrian route to the home"]
  },
  Signature: {
    targetMin: 0,
    targetMax: 6,
    postPlowIncluded: 12,
    defaultScope: ["Seasonal driveway clearing", "Expanded agreed pedestrian access coverage"]
  }
};

export function rulesFor(packageName) {
  return PACKAGE_RULES[packageName] || PACKAGE_RULES.Essential;
}
