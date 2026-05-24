let spec = null;

// ---------- LOAD SPEC ----------
async function loadSpec() {
  if (!spec) {
    const response = await fetch("./spec/spec_rev2.json");
    spec = await response.json();
  }
}

// ---------- CHECK CONDITIONS ----------
function checkCondition(rule, context) {

  if (rule.scale && rule.scale[">"]) {
    return context.scale > rule.scale[">"];
  }

  if (rule.utilisation_max && rule.utilisation_max[">"]) {
    return context.utilMax > rule.utilisation_max[">"];
  }

  if (rule.utilisation_max && rule.utilisation_max["<"]) {
    return context.utilMax < rule.utilisation_max["<"];
  }

  return false;
}

// ---------- FEASIBILITY ----------
function isFeasible(s, lab) {
  return (
    s.Lm <= lab.L &&
    s.Wm <= lab.W &&
    s.Hm <= lab.H &&
    s.Qm <= lab.Q
  );
