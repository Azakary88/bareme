const STORAGE_KEYS = {
  candidates: "sport_candidates_v1",
  scale: "sport_scale_secondaire_session_2022_v1"
};

const DEFAULT_SCALE = buildDefaultScale();

const state = {
  scale: loadScale(),
  candidates: loadCandidates(),
  currentResult: null
};

const els = {
  form: document.querySelector("#candidateForm"),
  fullName: document.querySelector("#fullName"),
  candidateId: document.querySelector("#candidateId"),
  sex: document.querySelector("#sex"),
  category: document.querySelector("#category"),
  ageGroup: document.querySelector("#ageGroup"),
  event: document.querySelector("#event"),
  performance: document.querySelector("#performance"),
  scoreBadge: document.querySelector("#scoreBadge"),
  roundedPerformance: document.querySelector("#roundedPerformance"),
  computedScore: document.querySelector("#computedScore"),
  candidateRows: document.querySelector("#candidateRows"),
  emptyState: document.querySelector("#emptyState"),
  clearAllBtn: document.querySelector("#clearAllBtn"),
  exportPdfBtn: document.querySelector("#exportPdfBtn"),
  exportExcelBtn: document.querySelector("#exportExcelBtn"),
  scaleDialog: document.querySelector("#scaleDialog"),
  openScaleBtn: document.querySelector("#openScaleBtn"),
  scaleEditor: document.querySelector("#scaleEditor"),
  saveScaleBtn: document.querySelector("#saveScaleBtn"),
  resetScaleBtn: document.querySelector("#resetScaleBtn"),
  downloadScaleBtn: document.querySelector("#downloadScaleBtn"),
  scaleImport: document.querySelector("#scaleImport")
};

init();

function init() {
  populateSelectors();
  renderCandidates();
  updateCalculation();

  els.form.addEventListener("input", updateCalculation);
  els.sex.addEventListener("change", () => {
    populateCategories();
    populateAgeGroups();
    populateEvents();
    updateCalculation();
  });
  els.category.addEventListener("change", () => {
    populateAgeGroups();
    populateEvents();
    updateCalculation();
  });
  els.ageGroup.addEventListener("change", () => {
    populateEvents();
    updateCalculation();
  });
  els.event.addEventListener("change", updateCalculation);
  els.form.addEventListener("submit", saveCandidate);
  els.form.addEventListener("reset", () => {
    setTimeout(updateCalculation, 0);
  });
  els.clearAllBtn.addEventListener("click", clearCandidates);
  els.exportExcelBtn.addEventListener("click", exportExcel);
  els.exportPdfBtn.addEventListener("click", exportPdf);
  els.openScaleBtn.addEventListener("click", openScaleEditor);
  els.saveScaleBtn.addEventListener("click", saveScaleFromEditor);
  els.resetScaleBtn.addEventListener("click", resetScale);
  els.downloadScaleBtn.addEventListener("click", downloadScaleCsv);
  els.scaleImport.addEventListener("change", importScaleCsv);
}

function buildDefaultScale() {
  const session2022Scale = buildSession2022Scale();
  if (Array.isArray(window.SECONDARY_SCALE) && window.SECONDARY_SCALE.length) {
    return [...session2022Scale, ...window.SECONDARY_SCALE];
  }

  return session2022Scale;
}

function buildSession2022Scale() {
  const performanceRows = [
    { sprint: 8.4, height: 1.40, length: 4.20 },
    { sprint: 8.6, height: 1.37, length: 4.10 },
    { sprint: 8.8, height: 1.33, length: 4.00 },
    { sprint: 8.9, height: 1.30, length: 3.90 },
    { sprint: 9.1, height: 1.25, length: 3.80 },
    { sprint: 9.2, height: 1.23, length: 3.70 },
    { sprint: 9.3, height: 1.20, length: 3.60 },
    { sprint: 9.5, height: 1.17, length: 3.50 },
    { sprint: 9.6, height: 1.13, length: 3.40 },
    { sprint: 9.8, height: 1.11, length: 3.30 },
    { sprint: 10.0, height: 1.08, length: 3.20 },
    { sprint: 10.1, height: 1.05, length: 3.10 },
    { sprint: 10.3, height: 1.02, length: 3.00 },
    { sprint: 10.4, height: 0.99, length: 2.90 },
    { sprint: 10.6, height: 0.97, length: 2.80 },
    { sprint: 10.8, height: 0.94, length: 2.70 },
    { sprint: 11.0, height: 0.92, length: 2.60 },
    { sprint: 11.1, height: 0.89, length: 2.50 },
    { sprint: 11.3, height: 0.87, length: 2.40 },
    { sprint: 11.5, height: 0.85, length: 2.30 },
    { sprint: 11.7, height: 0.83, length: 2.20 },
    { sprint: 11.9, height: 0.80, length: 2.10 },
    { sprint: 12.1, height: 0.78, length: 2.00 },
    { sprint: 12.3, height: 0.75, length: 1.90 },
    { sprint: 12.7, height: 0.72, length: 1.80 }
  ];
  const events = [
    { name: "Course 60 m", key: "sprint", direction: "lower", unit: "s" },
    { name: "Saut en hauteur", key: "height", direction: "higher", unit: "m" },
    { name: "Saut en longueur", key: "length", direction: "higher", unit: "m" }
  ];
  const scales = [
    { sex: "Fille", age: "15 ans et plus", firstRow: 3 },
    { sex: "Fille", age: "12, 13 et 14 ans", firstRow: 4 },
    { sex: "Fille", age: "Moins de 12 ans", firstRow: 6 },
    { sex: "Garçon", age: "Moins de 12 ans", firstRow: 5 },
    { sex: "Garçon", age: "12, 13 et 14 ans", firstRow: 3 },
    { sex: "Garçon", age: "15 ans et plus", firstRow: 1 }
  ];

  return scales.flatMap((scale) =>
    events.flatMap((event) =>
      performanceRows.slice(scale.firstRow - 1, scale.firstRow + 19).map((row, index) => ({
        category: "CEP",
        sex: scale.sex,
        age: scale.age,
        event: event.name,
        direction: event.direction,
        performance: row[event.key],
        note: 20 - index,
        unit: event.unit
      }))
    )
  );
}

function loadScale() {
  const stored = localStorage.getItem(STORAGE_KEYS.scale);
  if (!stored) return DEFAULT_SCALE;
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_SCALE;
  } catch {
    return DEFAULT_SCALE;
  }
}

function loadCandidates() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.candidates)) || [];
  } catch {
    return [];
  }
}

function saveCandidates() {
  localStorage.setItem(STORAGE_KEYS.candidates, JSON.stringify(state.candidates));
}

function saveScale() {
  localStorage.setItem(STORAGE_KEYS.scale, JSON.stringify(state.scale));
}

function unique(values) {
  return [...new Set(values)].filter(Boolean);
}

function populateSelectors() {
  els.sex.innerHTML = unique(state.scale.map((row) => row.sex))
    .map((value) => option(value))
    .join("");
  populateCategories();
  populateAgeGroups();
  populateEvents();
}

function populateCategories() {
  const selectedSex = els.sex.value;
  const previous = els.category.value;
  const categories = unique(state.scale
    .filter((row) => row.sex === selectedSex)
    .map((row) => row.category || "Barème général"));
  els.category.innerHTML = categories.map((value) => option(value, value === previous)).join("");
}

function populateAgeGroups() {
  const selectedSex = els.sex.value;
  const selectedCategory = els.category.value;
  const previous = els.ageGroup.value;
  const ages = unique(state.scale
    .filter((row) => row.sex === selectedSex && (row.category || "Barème général") === selectedCategory)
    .map((row) => row.age));
  els.ageGroup.innerHTML = ages.map((value) => option(value, value === previous)).join("");
}

function populateEvents() {
  const previous = els.event.value;
  const rows = rowsForSelection(false);
  const events = unique(rows.map((row) => row.event));
  els.event.innerHTML = events.map((value) => option(value, value === previous)).join("");
}

function option(value, selected = false) {
  return `<option value="${escapeHtml(value)}"${selected ? " selected" : ""}>${escapeHtml(value)}</option>`;
}

function rowsForSelection(includeEvent = true) {
  return state.scale.filter((row) => {
    const base = row.sex === els.sex.value &&
      (row.category || "Barème général") === els.category.value &&
      row.age === els.ageGroup.value;
    return includeEvent ? base && row.event === els.event.value : base;
  });
}

function updateCalculation() {
  const performance = Number(els.performance.value);
  const rows = rowsForSelection(true);

  if (!Number.isFinite(performance) || !rows.length) {
    state.currentResult = null;
    els.scoreBadge.value = "-- / 20";
    els.roundedPerformance.textContent = "--";
    els.computedScore.textContent = "--";
    return;
  }

  state.currentResult = calculateScore(rows, performance);
  const unit = rows[0]?.unit || "";
  els.scoreBadge.value = `${state.currentResult.note} / 20`;
  els.roundedPerformance.textContent = `${formatNumber(state.currentResult.performance)} ${unit}`.trim();
  els.computedScore.textContent = `${state.currentResult.note} / 20`;
}

function calculateScore(rows, performance) {
  const direction = rows[0].direction;
  const sorted = [...rows].sort((a, b) => a.performance - b.performance);
  let retained;

  if (direction === "higher") {
    retained = sorted.filter((row) => row.performance <= performance).at(-1) || sorted[0];
  } else {
    retained = sorted.find((row) => row.performance >= performance) || sorted.at(-1);
  }

  return {
    performance: retained.performance,
    note: retained.note
  };
}

function saveCandidate(event) {
  event.preventDefault();
  updateCalculation();
  if (!state.currentResult) return;

  const rows = rowsForSelection(true);
  const unit = rows[0]?.unit || "";
  const candidate = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    fullName: els.fullName.value.trim(),
    candidateId: els.candidateId.value.trim(),
    sex: els.sex.value,
    category: els.category.value,
    age: els.ageGroup.value,
    event: els.event.value,
    rawPerformance: Number(els.performance.value),
    retainedPerformance: state.currentResult.performance,
    note: state.currentResult.note,
    unit
  };

  state.candidates.unshift(candidate);
  saveCandidates();
  renderCandidates();
  els.form.reset();
  updateCalculation();
}

function renderCandidates() {
  els.emptyState.hidden = state.candidates.length > 0;
  els.candidateRows.innerHTML = state.candidates.map((candidate) => `
    <tr>
      <td data-label="Nom">${escapeHtml(candidate.fullName)}</td>
      <td data-label="Matricule">${escapeHtml(candidate.candidateId || "-")}</td>
      <td data-label="Sexe">${escapeHtml(candidate.sex)}</td>
      <td data-label="Barème">${escapeHtml(candidate.category || "-")}</td>
      <td data-label="Classe / âge">${escapeHtml(candidate.age)}</td>
      <td data-label="Épreuve">${escapeHtml(candidate.event)}</td>
      <td data-label="Performance">${formatNumber(candidate.rawPerformance)} ${escapeHtml(candidate.unit)}</td>
      <td data-label="Retenue">${formatNumber(candidate.retainedPerformance)} ${escapeHtml(candidate.unit)}</td>
      <td data-label="Note"><strong>${candidate.note} / 20</strong></td>
      <td data-label="Action"><button class="danger" type="button" data-delete="${candidate.id}">Supprimer</button></td>
    </tr>
  `).join("");

  els.candidateRows.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteCandidate(button.dataset.delete));
  });
}

function deleteCandidate(id) {
  state.candidates = state.candidates.filter((candidate) => candidate.id !== id);
  saveCandidates();
  renderCandidates();
}

function clearCandidates() {
  if (!state.candidates.length) return;
  if (!confirm("Vider la liste des candidats enregistrés ?")) return;
  state.candidates = [];
  saveCandidates();
  renderCandidates();
}

function openScaleEditor() {
  els.scaleEditor.value = scaleToCsv(state.scale);
  els.scaleDialog.showModal();
}

function scaleToCsv(scale) {
  const lines = ["categorie;sexe;age;epreuve;sens;performance;note;unite"];
  scale.forEach((row) => {
    lines.push([
      row.category || "Barème général",
      row.sex,
      row.age,
      row.event,
      row.direction,
      row.performance,
      row.note,
      row.unit || ""
    ].map(csvCell).join(";"));
  });
  return lines.join("\n");
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[;"\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function parseScaleCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  const firstLine = lines[0]?.toLowerCase() || "";
  const hasHeader = firstLine.startsWith("categorie;") || firstLine.startsWith("sexe;");
  const hasCategory = firstLine.startsWith("categorie;");
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const parsed = dataLines.map(parseCsvLine).map((cells) => {
    const offset = hasCategory ? 1 : 0;
    return {
      category: hasCategory ? cells[0]?.trim() : "Barème général",
      sex: cells[offset]?.trim(),
      age: cells[offset + 1]?.trim(),
      event: cells[offset + 2]?.trim(),
      direction: cells[offset + 3]?.trim(),
      performance: Number(String(cells[offset + 4]).replace(",", ".")),
      note: Number(cells[offset + 5]),
      unit: cells[offset + 6]?.trim() || ""
    };
  }).filter((row) =>
    row.category &&
    row.sex &&
    row.age &&
    row.event &&
    ["higher", "lower"].includes(row.direction) &&
    Number.isFinite(row.performance) &&
    Number.isFinite(row.note)
  );

  if (!parsed.length) {
    throw new Error("Barème vide ou invalide.");
  }
  return parsed;
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ";" && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

function saveScaleFromEditor() {
  try {
    state.scale = parseScaleCsv(els.scaleEditor.value);
    saveScale();
    populateSelectors();
    updateCalculation();
    els.scaleDialog.close();
  } catch (error) {
    alert(error.message);
  }
}

function resetScale() {
  if (!confirm("Remettre le barème exemple ?")) return;
  state.scale = DEFAULT_SCALE;
  saveScale();
  els.scaleEditor.value = scaleToCsv(state.scale);
  populateSelectors();
  updateCalculation();
}

function downloadScaleCsv() {
  downloadFile("bareme-sportif.csv", scaleToCsv(state.scale), "text/csv;charset=utf-8");
}

function importScaleCsv(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    els.scaleEditor.value = String(reader.result || "");
  };
  reader.readAsText(file);
}

function exportExcel() {
  if (!state.candidates.length) return alert("Aucun candidat à exporter.");
  const html = `
    <html>
      <head><meta charset="utf-8"></head>
      <body>${buildExportTable()}</body>
    </html>
  `;
  downloadFile(`notes-sportives-${dateStamp()}.xls`, html, "application/vnd.ms-excel");
}

function exportPdf() {
  if (!state.candidates.length) return alert("Aucun candidat à exporter.");
  const pdf = buildSimplePdf([
    "Notes sportives",
    `Export du ${new Date().toLocaleString("fr-FR")}`,
    "",
    ...state.candidates.flatMap((candidate) => [
      `${candidate.fullName} | ${candidate.candidateId || "-"} | ${candidate.sex} | ${candidate.category || "-"} | ${candidate.age}`,
      `${candidate.event} | perf. ${formatNumber(candidate.rawPerformance)} ${candidate.unit} | retenue ${formatNumber(candidate.retainedPerformance)} ${candidate.unit} | note ${candidate.note}/20`,
      ""
    ])
  ]);
  downloadFile(`notes-sportives-${dateStamp()}.pdf`, pdf, "application/pdf");
}

function buildExportTable() {
  const headings = ["Nom", "Matricule", "Sexe", "Barème", "Classe / age", "Epreuve", "Performance", "Performance retenue", "Note", "Date"];
  const rows = state.candidates.map((candidate) => [
    candidate.fullName,
    candidate.candidateId || "-",
    candidate.sex,
    candidate.category || "-",
    candidate.age,
    candidate.event,
    `${formatNumber(candidate.rawPerformance)} ${candidate.unit}`,
    `${formatNumber(candidate.retainedPerformance)} ${candidate.unit}`,
    `${candidate.note} / 20`,
    new Date(candidate.createdAt).toLocaleString("fr-FR")
  ]);
  return `<table border="1"><thead><tr>${headings.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function buildSimplePdf(lines) {
  const encoder = new TextEncoder();
  const content = [
    "BT",
    "/F1 12 Tf",
    "50 790 Td",
    "14 TL",
    ...lines.map((line) => `(${pdfEscape(line.slice(0, 92))}) Tj T*`),
    "ET"
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(encoder.encode(pdf).length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = encoder.encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

function pdfEscape(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function downloadFile(filename, content, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function formatNumber(value) {
  return Number(value).toLocaleString("fr-FR", { maximumFractionDigits: 2 });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
