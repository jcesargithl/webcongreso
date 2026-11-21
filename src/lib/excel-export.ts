import type { CongressRequest } from "./requests";
import type { RequestLookup } from "./admin-requests";
import { formatTimestamp, paymentLabel, registrationFor, statusLabel } from "./admin-requests";

// Precomputed CRC32 lookup table for fast, allocation-free calculation
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  CRC_TABLE[i] = c >>> 0;
}

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = (c >>> 8) ^ CRC_TABLE[(c ^ bytes[i]) & 0xff];
  }
  return (c ^ 0xffffffff) >>> 0;
}

const encoder = new TextEncoder();

export type ZipEntry = {
  name: string;
  data: Uint8Array | string;
};

/**
 * Creates a valid PKZIP archive from files using uncompressed STORE mode (compression method 0).
 * Compatible with all ZIP extractors and spreadsheet applications including Microsoft Excel.
 */
export function createZipArchive(files: ZipEntry[]): Uint8Array {
  const prepared = files.map(file => {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = typeof file.data === "string" ? encoder.encode(file.data) : file.data;
    const crc = crc32(dataBytes);
    return { nameBytes, dataBytes, crc, size: dataBytes.length };
  });

  let totalLocalSize = 0;
  for (const item of prepared) totalLocalSize += 30 + item.nameBytes.length + item.size;
  let totalCdSize = 0;
  for (const item of prepared) totalCdSize += 46 + item.nameBytes.length;

  const totalSize = totalLocalSize + totalCdSize + 22;
  const buffer = new Uint8Array(totalSize);
  const view = new DataView(buffer.buffer);

  let offset = 0;
  const localOffsets: number[] = [];

  // Write Local File Headers and Data
  for (const item of prepared) {
    localOffsets.push(offset);
    view.setUint32(offset, 0x04034b50, true); // Local file header signature
    view.setUint16(offset + 4, 20, true); // Version needed (2.0)
    view.setUint16(offset + 6, 0x0800, true); // General purpose bit flag (UTF-8 filename)
    view.setUint16(offset + 8, 0, true); // Compression method (0 = STORE)
    view.setUint16(offset + 10, 0, true); // Mod time
    view.setUint16(offset + 12, 0, true); // Mod date
    view.setUint32(offset + 14, item.crc, true); // CRC-32
    view.setUint32(offset + 18, item.size, true); // Compressed size
    view.setUint32(offset + 22, item.size, true); // Uncompressed size
    view.setUint16(offset + 26, item.nameBytes.length, true); // File name length
    view.setUint16(offset + 28, 0, true); // Extra field length
    buffer.set(item.nameBytes, offset + 30);
    buffer.set(item.dataBytes, offset + 30 + item.nameBytes.length);
    offset += 30 + item.nameBytes.length + item.size;
  }

  // Write Central Directory Headers
  const cdOffset = offset;
  for (let i = 0; i < prepared.length; i++) {
    const item = prepared[i];
    const localOffset = localOffsets[i];
    view.setUint32(offset, 0x02014b50, true); // Central directory header signature
    view.setUint16(offset + 4, 20, true); // Version made by
    view.setUint16(offset + 6, 20, true); // Version needed
    view.setUint16(offset + 8, 0x0800, true); // General purpose bit flag
    view.setUint16(offset + 10, 0, true); // Compression method
    view.setUint16(offset + 12, 0, true); // Mod time
    view.setUint16(offset + 14, 0, true); // Mod date
    view.setUint32(offset + 16, item.crc, true); // CRC-32
    view.setUint32(offset + 20, item.size, true); // Compressed size
    view.setUint32(offset + 24, item.size, true); // Uncompressed size
    view.setUint16(offset + 28, item.nameBytes.length, true); // File name length
    view.setUint16(offset + 30, 0, true); // Extra field length
    view.setUint16(offset + 32, 0, true); // Comment length
    view.setUint16(offset + 34, 0, true); // Disk number start
    view.setUint16(offset + 36, 0, true); // Internal file attributes
    view.setUint32(offset + 38, 0, true); // External file attributes
    view.setUint32(offset + 42, localOffset, true); // Relative offset of local header
    buffer.set(item.nameBytes, offset + 46);
    offset += 46 + item.nameBytes.length;
  }

  // Write End of Central Directory Record (EOCD)
  view.setUint32(offset, 0x06054b50, true); // EOCD signature
  view.setUint16(offset + 4, 0, true); // Disk number
  view.setUint16(offset + 6, 0, true); // Disk where central directory starts
  view.setUint16(offset + 8, prepared.length, true); // Entries on disk
  view.setUint16(offset + 10, prepared.length, true); // Total entries
  view.setUint32(offset + 12, totalCdSize, true); // Size of central directory
  view.setUint32(offset + 16, cdOffset, true); // Offset of start of central directory
  view.setUint16(offset + 20, 0, true); // Comment length

  return buffer;
}

export function colLetter(index: number): string {
  let name = "";
  let n = index;
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

export function escapeXmlText(value: unknown): string {
  let text = String(value ?? "");
  // Neutralize spreadsheet formula injection from participant-controlled fields
  if (/^\s*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

/**
 * Generates an OpenXML Excel (.xlsx) file as a Uint8Array containing all filtered requests.
 */
export function buildRequestsExcel(rows: CongressRequest[], lookup: RequestLookup): Uint8Array {
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <bookViews>
    <workbookView xWindow="0" yWindow="0" windowWidth="20480" windowHeight="10240"/>
  </bookViews>
  <sheets>
    <sheet name="Solicitudes" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><color theme="1"/><name val="Segoe UI"/><family val="2"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Segoe UI"/><family val="2"/></font>
  </fonts>
  <fills count="4">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0F2756"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFD1D5DB"/></left>
      <right style="thin"><color rgb="FFD1D5DB"/></right>
      <top style="thin"><color rgb="FFD1D5DB"/></top>
      <bottom style="thin"><color rgb="FFD1D5DB"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="8">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center" wrapText="1"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <xf numFmtId="2" fontId="0" fillId="0" borderId="1" applyFont="1" applyNumberFormat="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="right" vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <xf numFmtId="2" fontId="0" fillId="3" borderId="1" applyFont="1" applyNumberFormat="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="right" vertical="center"/>
    </xf>
  </cellXfs>
</styleSheet>`;

  const headers = [
    "ID", "Tipo", "Nombre", "Correo", "Celular", "Tipo de documento", "Documento", "Institución",
    "Categoría", "Modalidad", "Título de ponencia", "Estado de solicitud", "Estado de pago",
    "Tarifa (S/.)", "Cargo inst. (S/.)", "Monto declarado (S/.)", "Secuencia", "Fecha de pago", "Fecha de registro",
  ];

  const colWidths = [38, 14, 30, 30, 18, 18, 16, 32, 32, 14, 38, 22, 22, 14, 16, 20, 16, 16, 22];
  const colsXml = `<cols>` + colWidths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("") + `</cols>`;

  const headerCells = headers
    .map((h, i) => `<c r="${colLetter(i + 1)}1" s="1" t="inlineStr"><is><t xml:space="preserve">${escapeXmlText(h)}</t></is></c>`)
    .join("");
  const headerRow = `<row r="1" ht="28" customHeight="1">${headerCells}</row>`;

  const dataRowsXml = rows.map((request, rowIndex) => {
    const rowNum = rowIndex + 2;
    const isZebra = rowIndex % 2 === 1;
    const textStyle = isZebra ? 5 : 2;
    const centerStyle = isZebra ? 6 : 3;
    const numStyle = isZebra ? 7 : 4;

    const registration = registrationFor(request, lookup);

    const cells: string[] = [];

    function addText(colIdx: number, val: unknown, style: number) {
      const col = colLetter(colIdx);
      const str = String(val ?? "").trim();
      if (!str) {
        cells.push(`<c r="${col}${rowNum}" s="${style}"/>`);
        return;
      }
      cells.push(`<c r="${col}${rowNum}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${escapeXmlText(str)}</t></is></c>`);
    }

    function addNumber(colIdx: number, val: unknown) {
      const col = colLetter(colIdx);
      const num = typeof val === "number" ? val : (val != null && val !== "" ? Number(val) : NaN);
      if (Number.isNaN(num)) {
        cells.push(`<c r="${col}${rowNum}" s="${numStyle}"/>`);
        return;
      }
      cells.push(`<c r="${col}${rowNum}" s="${numStyle}"><v>${num.toFixed(2)}</v></c>`);
    }

    // Col 1: ID
    addText(1, request.id, textStyle);
    // Col 2: Tipo
    addText(2, request.kind === "paper" ? "Ponencia" : "Inscripción", centerStyle);
    // Col 3: Nombre
    addText(3, request.name, textStyle);
    // Col 4: Correo
    addText(4, request.email, textStyle);
    // Col 5: Celular
    addText(5, request.phone, centerStyle);
    // Col 6: Tipo de documento
    addText(6, request.doc_type, centerStyle);
    // Col 7: Documento (Preserve leading zero as text)
    addText(7, request.doc_number, centerStyle);
    // Col 8: Institución
    addText(8, request.institution, textStyle);
    // Col 9: Categoría
    addText(9, request.category, textStyle);
    // Col 10: Modalidad
    addText(10, request.mode, centerStyle);
    // Col 11: Título de ponencia
    addText(11, request.topic || "", textStyle);
    // Col 12: Estado de solicitud
    addText(12, statusLabel(request.status, request.kind), centerStyle);
    // Col 13: Estado de pago
    addText(13, paymentLabel(registration?.payment_status), centerStyle);
    // Col 14: Tarifa (S/.)
    addNumber(14, registration?.registration_fee);
    // Col 15: Cargo inst. (S/.)
    addNumber(15, registration?.institutional_fee);
    // Col 16: Monto declarado (S/.)
    addNumber(16, registration?.payment_amount);
    // Col 17: Secuencia
    addText(17, registration?.payment_sequence || "", centerStyle);
    // Col 18: Fecha de pago
    addText(18, registration?.payment_date || "", centerStyle);
    // Col 19: Fecha de registro
    addText(19, formatTimestamp(request.created_at), centerStyle);

    return `<row r="${rowNum}" ht="22" customHeight="1">${cells.join("")}</row>`;
  }).join("");

  const maxRow = Math.max(1, rows.length + 1);
  const sheetData = `<sheetData>${headerRow}${dataRowsXml}</sheetData>`;

  const sheet1 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView tabSelected="1" workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  ${colsXml}
  ${sheetData}
  <autoFilter ref="A1:S${maxRow}"/>
</worksheet>`;

  const files: ZipEntry[] = [
    { name: "[Content_Types].xml", data: contentTypes },
    { name: "_rels/.rels", data: rels },
    { name: "xl/_rels/workbook.xml.rels", data: wbRels },
    { name: "xl/workbook.xml", data: workbook },
    { name: "xl/styles.xml", data: styles },
    { name: "xl/worksheets/sheet1.xml", data: sheet1 },
  ];

  return createZipArchive(files);
}
