import XLSX from 'xlsx';
import fs from 'fs';

const workbook = XLSX.readFile('./OVA_TRACKER.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
const headerRowIndex = rows.findIndex((row) =>
  Array.isArray(row) && row.some((cell) => String(cell).toLowerCase().includes('nombre protocolo'))
);
const headerRow = rows[headerRowIndex] || [];

const findCol = (needle) => {
  const n = String(needle).toLowerCase();
  return headerRow.findIndex((h) => String(h).toLowerCase().includes(n));
};

const colCategoria = findCol('categoria');
const colNombreProtocolo = findCol('nombre protocolo');
const colObjetivo = findCol('objetivo');
const colMateriales = findCol('materiales');
const colDescripcion = findCol('descripcion');
const colChecklist = findCol('lista de chequeo');
const colPasoAPaso = findCol('protocolo (paso a paso');
const colVideoPaso = findCol('video animado');
const colCriterios = findCol('criterios');
const colRegistro = findCol('registro');

const normalizar = (s) => {
  const t = String(s || '').trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const u = t.toUpperCase();
  if (u === 'NA' || u === 'N/A' || u === 'N.A.' || u === 'N.A') return '';
  return t;
};

const slug = (s) => normalizar(s)
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')
  .replace(/-+/g, '-');

const mapCategoria = (raw) => {
  const t = normalizar(raw).toUpperCase();
  if (t.includes('COMPOSICI')) return 'composicion-corporal';
  if (t.includes('CALENTAMIENTO')) return 'calentamiento';
  if (t.includes('FUERZA')) return 'fuerza-potencia';
  if (t.includes('FLEXIBILIDAD')) return 'flexibilidad-movilidad';
  if (t.includes('RESISTENCIA')) return 'resistencia-cardiorrespiratoria';
  return 'composicion-corporal';
};

const parsePaso = (raw) => {
  const t = normalizar(raw);
  const m = t.match(/Paso\s*([0-9]+)\s*:?/i);
  if (!m) return null;
  const numero = Number(m[1]);
  const descripcion = t.replace(m[0], '').trim();
  return { numero, descripcion };
};

const inferirUnidad = (texto) => {
  const t = normalizar(texto).toLowerCase();
  if (t.includes('kilogram')) return 'kg';
  if (t.includes('cent')) return 'cm';
  if (t.includes('metro')) return 'm';
  if (t.includes('segund')) return 's';
  if (t.includes('grado')) return '°';
  return '';
};

const protocolos = [];
let actual = null;
let contadorOrden = 0;
let categoriaActual = '';

for (let i = Math.max(0, headerRowIndex + 1); i < rows.length; i += 1) {
  const r = rows[i] || [];
  const nombre = colNombreProtocolo >= 0 ? normalizar(r[colNombreProtocolo]) : '';

  if (nombre) {
    if (actual) protocolos.push(actual);

    const categoriaRaw = colCategoria >= 0 ? normalizar(r[colCategoria]) : '';
    if (categoriaRaw) categoriaActual = categoriaRaw;
    contadorOrden += 1;
    actual = {
      id: slug(nombre),
      order: contadorOrden,
      category: mapCategoria(categoriaActual),
      title: normalizar(nombre),
      objective: colObjetivo >= 0 ? normalizar(r[colObjetivo]) : '',
      materials: [],
      description: colDescripcion >= 0 ? normalizar(r[colDescripcion]) : '',
      checklist: [],
      steps: [],
      interruptionCriteria: [],
      dataRegistry: {},
    };

    const crit = colCriterios >= 0 ? normalizar(r[colCriterios]) : '';
    if (crit) actual.interruptionCriteria.push(crit);

    const reg = colRegistro >= 0 ? normalizar(r[colRegistro]) : '';
    if (reg) {
      const unit = inferirUnidad(reg);
      actual.dataRegistry = { title: 'Registro de datos', description: reg, ...(unit ? { unit } : {}) };
    }
  }

  if (!actual) continue;

  const mat = colMateriales >= 0 ? normalizar(r[colMateriales]) : '';
  if (mat) {
    actual.materials.push({ name: mat, image: `/assets/placeholders/${slug(mat)}.webp` });
  }

  const chk = colChecklist >= 0 ? normalizar(r[colChecklist]) : '';
  if (chk) actual.checklist.push(chk);

  const pasoRaw = colPasoAPaso >= 0 ? normalizar(r[colPasoAPaso]) : '';
  if (pasoRaw) {
    const parsed = parsePaso(pasoRaw);
    if (parsed) {
      const video = colVideoPaso >= 0 ? normalizar(r[colVideoPaso]) : '';
      actual.steps.push({
        step: parsed.numero,
        title: `Paso ${parsed.numero}`,
        description: parsed.descripcion,
        video: video || `/assets/placeholders/${actual.id}-paso-${parsed.numero}.mp4`,
      });
    }
  }
}

if (actual) protocolos.push(actual);

const sync = process.argv.includes('--sync');
if (!sync) {
  console.log(JSON.stringify({
    hoja: sheetName,
    total: protocolos.length,
    columnas: {
      categoria: colCategoria,
      nombreProtocolo: colNombreProtocolo,
      objetivo: colObjetivo,
      materiales: colMateriales,
      descripcion: colDescripcion,
      checklist: colChecklist,
      pasoAPaso: colPasoAPaso,
      videoPaso: colVideoPaso,
      criterios: colCriterios,
      registro: colRegistro,
    },
    protocolos: protocolos.map((p) => ({ id: p.id, title: p.title, category: p.category, order: p.order })),
  }, null, 2));
  process.exit(0);
}

const outDir = './src/data/protocols';
fs.mkdirSync(outDir, { recursive: true });

const escritos = [];
for (const p of protocolos) {
  const outPath = `${outDir}/${p.id}.json`;
  fs.writeFileSync(outPath, JSON.stringify(p, null, 2) + '\n', 'utf8');
  escritos.push(outPath);
}

console.log(JSON.stringify({ total: protocolos.length, escritos }, null, 2));
