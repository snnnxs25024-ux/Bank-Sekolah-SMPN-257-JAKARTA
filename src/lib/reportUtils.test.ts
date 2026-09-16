import assert from 'node:assert/strict';
import { formatClassName, reportFileBase } from './reportUtils';

assert.equal(formatClassName('7A'), 'VII A');
assert.equal(formatClassName('8-A'), 'VIII A');
assert.equal(formatClassName('IX C'), 'IX C');
assert.equal(formatClassName('A', '7'), 'VII A');
assert.equal(reportFileBase('September', 2026, 'VII A'), 'Laporan_Bank_Sampah_VII_A_September_2026');

console.log('reportUtils checks passed');
