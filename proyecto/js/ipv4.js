"use strict";

const IPv4 = (() => {
  const addressSpace = 2 ** 32;
  const maxHosts = addressSpace - 2;
  const octet = /^(?:0|[1-9]\d{0,2})$/;

  function toInteger(ip) {
    const parts = ip.split(".");
    if (parts.length !== 4 || parts.some(part => !octet.test(part) || Number(part) > 255)) {
      throw new Error(`Dirección IPv4 inválida: «${ip}». Usa cuatro octetos de 0 a 255, sin ceros iniciales.`);
    }
    return parts.reduce((value, part) => value * 256 + Number(part), 0);
  }

  function toDotted(value) {
    return [24, 16, 8, 0].map(bits => Math.floor(value / 2 ** bits) % 256).join(".");
  }

  function toBinary(value) {
    return toDotted(value).split(".").map(part => Number(part).toString(2).padStart(8, "0")).join(".");
  }

  function parsePrefix(mask) {
    if (/^(?:[0-9]|[12][0-9]|3[0-2])$/.test(mask)) return Number(mask);
    if (!mask.includes(".")) throw new Error("El prefijo debe ser un entero de /0 a /32.");

    let value;
    try {
      value = toInteger(mask);
    } catch {
      throw new Error("Máscara inválida. Escribe cuatro octetos, por ejemplo 255.255.255.0.");
    }
    const bits = value.toString(2).padStart(32, "0");
    if (!/^1*0*$/.test(bits)) throw new Error("La máscara debe tener unos contiguos seguidos de ceros.");
    return bits.indexOf("0") === -1 ? 32 : bits.indexOf("0");
  }

  function parseNetwork(input) {
    const parts = input.trim().split(/\s*\/\s*|\s+/);
    if (parts.length !== 2 || parts.some(part => part === "")) {
      throw new Error("Escribe una IPv4 con prefijo (192.168.1.0/24) o con máscara (192.168.1.0 255.255.255.0).");
    }
    const address = toInteger(parts[0]);
    const prefix = parsePrefix(parts[1]);
    const size = 2 ** (32 - prefix);
    // La división elimina los bits de host sin usar operadores de 32 bits con signo.
    return { address, prefix, size, network: Math.floor(address / size) * size };
  }

  function describeBlock(network, prefix, size) {
    const last = network + size - 1;
    const reserved = prefix <= 30 ? 1 : 0;
    return {
      network: toDotted(network),
      prefix,
      mask: toDotted(addressSpace - size),
      firstHost: toDotted(network + reserved),
      lastHost: toDotted(last - reserved),
      broadcast: reserved ? toDotted(last) : null,
      usableHosts: size - 2 * reserved,
      size
    };
  }

  function calculateCIDR(input) {
    const { address, prefix, size, network } = parseNetwork(input);
    return {
      ...describeBlock(network, prefix, size),
      binaryAddress: toBinary(address),
      binaryMask: toBinary(addressSpace - size)
    };
  }

  function parseRequirements(input) {
    const lines = input.split(/\r?\n/);
    const requests = [];
    for (const [index, line] of lines.entries()) {
      if (!line.trim()) continue;
      const match = /^([^:]+):([^:]+)$/.exec(line.trim());
      if (!match || !match[1].trim()) {
        throw new Error(`Línea ${index + 1}: usa el formato «Nombre: cantidad».`);
      }
      const quantity = match[2].trim();
      const hosts = Number(quantity);
      if (!/^\d+$/.test(quantity) || hosts < 1 || hosts > maxHosts) {
        throw new Error(`Línea ${index + 1}: la cantidad de hosts debe ser un entero entre 1 y ${maxHosts}.`);
      }
      requests.push({ name: match[1].trim(), hosts });
    }
    if (requests.length === 0) throw new Error("Agrega al menos una subred con sus hosts requeridos.");
    return requests;
  }

  function allocateVLSM(baseInput, requirementsInput) {
    const base = parseNetwork(baseInput);
    const requests = parseRequirements(requirementsInput).sort((a, b) => b.hosts - a.hosts);
    const end = base.network + base.size;
    let cursor = base.network;

    const subnets = requests.map(({ name, hosts }) => {
      // VLSM reserva una dirección de red y una de broadcast por subred.
      const hostBits = Math.ceil(Math.log2(hosts + 2));
      const size = 2 ** hostBits;
      if (cursor + size > end) {
        throw new Error(`Espacio insuficiente para «${name}»: requiere un bloque de ${size} direcciones y quedan ${end - cursor}.`);
      }
      // Cada bloque previo es un múltiplo del actual, así que el puntero queda alineado.
      const block = describeBlock(cursor, 32 - hostBits, size);
      cursor += size;
      return { name, hosts, ...block, wasted: block.usableHosts - hosts };
    });

    return {
      base: `${toDotted(base.network)}/${base.prefix}`,
      usedAddresses: cursor - base.network,
      remainingAddresses: end - cursor,
      remainingRange: cursor < end ? [toDotted(cursor), toDotted(end - 1)] : null,
      subnets
    };
  }

  return { calculateCIDR, allocateVLSM };
})();

if (typeof module !== "undefined") module.exports = IPv4;
