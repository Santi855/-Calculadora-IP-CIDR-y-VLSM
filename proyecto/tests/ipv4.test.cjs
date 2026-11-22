"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateCIDR, allocateVLSM } = require("../js/ipv4.js");

test("CIDR reproduce el ejemplo del enunciado", () => {
  assert.deepEqual(calculateCIDR("192.168.10.0/24"), {
    network: "192.168.10.0", prefix: 24, mask: "255.255.255.0",
    firstHost: "192.168.10.1", lastHost: "192.168.10.254", broadcast: "192.168.10.255",
    usableHosts: 254, size: 256, binaryAddress: "11000000.10101000.00001010.00000000",
    binaryMask: "11111111.11111111.11111111.00000000"
  });
});

test("CIDR acepta máscara punteada y normaliza una IP de host", () => {
  const result = calculateCIDR(" 192.168.10.65  255.255.255.192 ");
  assert.equal(result.network, "192.168.10.64");
  assert.equal(result.prefix, 26);
  assert.equal(result.broadcast, "192.168.10.127");
  assert.equal(result.usableHosts, 62);
  assert.equal(calculateCIDR("192.168.10.65 / 255.255.255.192").network, result.network);
});

test("CIDR soporta /0, /31 punto a punto y /32 individual", () => {
  const all = calculateCIDR("255.255.255.255/0");
  assert.equal(all.network, "0.0.0.0");
  assert.equal(all.mask, "0.0.0.0");
  assert.equal(all.broadcast, "255.255.255.255");
  assert.equal(all.usableHosts, 4294967294);
  const link = calculateCIDR("192.0.2.11/31");
  assert.deepEqual([link.network, link.firstHost, link.lastHost, link.usableHosts, link.broadcast],
    ["192.0.2.10", "192.0.2.10", "192.0.2.11", 2, null]);
  const host = calculateCIDR("255.255.255.255/32");
  assert.deepEqual([host.network, host.firstHost, host.lastHost, host.usableHosts, host.broadcast],
    ["255.255.255.255", "255.255.255.255", "255.255.255.255", 1, null]);
});

test("CIDR valida dirección, prefijo, máscara y formato", () => {
  assert.throws(() => calculateCIDR("300.1.2.3/24"), /IPv4 inválida/);
  assert.throws(() => calculateCIDR("01.1.2.3/24"), /IPv4 inválida/);
  assert.throws(() => calculateCIDR("10.0.0.1/33"), /entero de \/0 a \/32/);
  assert.throws(() => calculateCIDR("10.0.0.1 255.0.255.0"), /unos contiguos/);
  assert.throws(() => calculateCIDR("10.0.0.1 255.0.0.300"), /Máscara inválida/);
  assert.throws(() => calculateCIDR("10.0.0.1"), /IPv4 con prefijo/);
});

test("VLSM ordena, asigna el menor bloque y calcula el sobrante", () => {
  const result = allocateVLSM("192.168.0.9/24", "D: 10\r\nB: 50\r\n\r\nA: 100\r\nC: 25");
  assert.equal(result.base, "192.168.0.0/24");
  assert.deepEqual(result.subnets.map(row => [row.name, row.network, row.prefix, row.mask,
    row.firstHost, row.lastHost, row.broadcast, row.usableHosts, row.wasted]), [
    ["A", "192.168.0.0", 25, "255.255.255.128", "192.168.0.1", "192.168.0.126", "192.168.0.127", 126, 26],
    ["B", "192.168.0.128", 26, "255.255.255.192", "192.168.0.129", "192.168.0.190", "192.168.0.191", 62, 12],
    ["C", "192.168.0.192", 27, "255.255.255.224", "192.168.0.193", "192.168.0.222", "192.168.0.223", 30, 5],
    ["D", "192.168.0.224", 28, "255.255.255.240", "192.168.0.225", "192.168.0.238", "192.168.0.239", 14, 4]
  ]);
  assert.equal(result.usedAddresses, 240);
  assert.equal(result.remainingAddresses, 16);
  assert.deepEqual(result.remainingRange, ["192.168.0.240", "192.168.0.255"]);
});

test("VLSM acepta un ajuste exacto y conserva el orden en empates", () => {
  const result = allocateVLSM("255.255.255.248/29", "Z: 2\nA: 2");
  assert.deepEqual(result.subnets.map(row => [row.name, row.network, row.broadcast, row.wasted]), [
    ["Z", "255.255.255.248", "255.255.255.251", 0],
    ["A", "255.255.255.252", "255.255.255.255", 0]
  ]);
  assert.equal(result.remainingAddresses, 0);
  assert.equal(result.remainingRange, null);
});

test("VLSM rechaza exceso tanto individual como acumulado", () => {
  assert.throws(() => allocateVLSM("192.168.0.0/24", "A: 255"),
    /Espacio insuficiente.*512 direcciones y quedan 256/);
  assert.throws(() => allocateVLSM("10.0.0.0/28", "A: 10\nB: 2"),
    /Espacio insuficiente.*B.*quedan 0/);
  assert.throws(() => allocateVLSM("10.0.0.0/31", "A: 1"),
    /Espacio insuficiente.*4 direcciones y quedan 2/);
});

test("VLSM informa la línea con formato o cantidad inválidos", () => {
  assert.throws(() => allocateVLSM("10.0.0.0/24", "\nA - 10"), /Línea 2.*formato/);
  for (const invalid of ["0", "-1", "2.5", "1e2", "4294967295"]) {
    assert.throws(() => allocateVLSM("10.0.0.0/24", `A: ${invalid}`), /Línea 1.*entero/);
  }
  assert.throws(() => allocateVLSM("10.0.0.0/24", "\n "), /al menos una subred/);
});

test("VLSM maneja el espacio IPv4 completo sin desbordamiento", () => {
  const result = allocateVLSM("0.0.0.0/0", "Global: 4294967294");
  assert.equal(result.subnets[0].prefix, 0);
  assert.equal(result.subnets[0].broadcast, "255.255.255.255");
  assert.equal(result.usedAddresses, 4294967296);
  assert.equal(result.remainingAddresses, 0);
});
