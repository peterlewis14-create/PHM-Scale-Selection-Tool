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
}

// ---------- MAIN ENGINE ----------
export async function runEngine(inputs) {

  await loadSpec();

  const { prototype, lab, context } = inputs;

  let results = [];

  for (let N = 5; N <= 100; N += 5) {

    let Lm = prototype.L / N;
    let Wm = prototype.W / N;
    let Qm = (prototype.Q / Math.pow(N, 2.5)) * 1000;
    let Hm = ((prototype.Hmax - prototype.Emin) / N) + 0.2;

    let feasible = isFeasible({ Lm, Wm, Qm, Hm }, lab);

    let utilFoot = Math.max(Lm / lab.L, Wm / lab.W);
    let utilFlow = Qm / lab.Q;
    let utilHeight = Hm / lab.H;

    let utilMax = Math.max(utilFoot, utilFlow, utilHeight);

    results.push({
      scale: N,
      feasible,
      utilMax
    });
  }

  let feasible = results.filter(r => r.feasible);

  if (feasible.length === 0) {
    return {
      error: "No feasible scale",
      rule: "S1"
    };
  }

  // ✅ Rule S1 (largest feasible scale)
  let recommended = feasible.reduce((a, b) =>
    a.scale < b.scale ? a : b
  );

  // ---------- WARNINGS ----------
  let warnings = [];

  spec.warnings.forEach(w => {

    let applies =
      !w.appliesTo ||
      w.appliesTo.includes("all") ||
      (context.issues && w.appliesTo.some(x => context.issues.includes(x)));

    if (!applies) return;

    if (checkCondition(w.condition, {
      scale: recommended.scale,
      utilMax: recommended.utilMax
    })) {
      warnings.push({
        id: w.id,
        message: w.impact,
        source: "Section 7"
      });
    }
  });

  return {
    rule: "S1",
    standardVersion: "2.0",
    recommendedScale: recommended.scale,
    feasibleRange: feasible.map(f => f.scale),
    governingUtilisation: recommended.utilMax,
    warnings
  };
}
