"use strict";

const byId = id => document.getElementById(id);
const number = new Intl.NumberFormat("es-MX");
const range = (first, last) => first === last ? first : `${first} – ${last}`;

function showMetrics(target, metrics) {
  const items = metrics.map(([label, value]) => {
    const item = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    item.append(term, description);
    return item;
  });
  byId(target).replaceChildren(...items);
}

function showCIDR() {
  const result = IPv4.calculateCIDR(byId("cidr-input").value);
  showMetrics("cidr-metrics", [
    ["Red", `${result.network}/${result.prefix}`],
    ["Máscara", result.mask],
    ["Rango de hosts", range(result.firstHost, result.lastHost)],
    ["Broadcast", result.broadcast ?? "No aplica"],
    ["Hosts disponibles", number.format(result.usableHosts)],
    ["Direcciones del bloque", number.format(result.size)]
  ]);
  showMetrics("cidr-binary", [
    ["IPv4 introducida", result.binaryAddress],
    ["Máscara", result.binaryMask]
  ]);
  const special = byId("cidr-special");
  special.textContent = result.prefix === 31
    ? "/31 representa un enlace punto a punto con dos extremos (RFC 3021)."
    : "/32 identifica una sola dirección IPv4.";
  special.hidden = result.prefix < 31;
}

function showVLSM() {
  const result = IPv4.allocateVLSM(byId("vlsm-base").value, byId("vlsm-requests").value);
  showMetrics("vlsm-metrics", [
    ["Red base", result.base],
    ["Direcciones asignadas", number.format(result.usedAddresses)],
    ["Direcciones libres", number.format(result.remainingAddresses)],
    ["Rango libre", result.remainingRange ? range(...result.remainingRange) : "Sin direcciones libres"]
  ]);

  const rows = document.createDocumentFragment();
  for (const subnet of result.subnets) {
    const row = document.createElement("tr");
    const label = document.createElement("th");
    label.scope = "row";
    label.textContent = subnet.name;
    row.append(label);
    const values = [
      number.format(subnet.hosts), `${subnet.network}/${subnet.prefix}`, subnet.mask,
      range(subnet.firstHost, subnet.lastHost), subnet.broadcast,
      number.format(subnet.usableHosts), number.format(subnet.wasted)
    ];
    for (const value of values) row.insertCell().textContent = value;
    rows.append(row);
  }
  byId("vlsm-rows").replaceChildren(rows);
}

function connectForm(name, render) {
  byId(`${name}-form`).addEventListener("submit", event => {
    event.preventDefault();
    const error = byId(`${name}-error`);
    const results = byId(`${name}-results`);
    error.hidden = true;
    results.hidden = true;
    try {
      render();
      results.hidden = false;
      byId(`${name}-result-title`).focus();
    } catch (problem) {
      error.textContent = problem.message;
      error.hidden = false;
    }
  });
}

connectForm("cidr", showCIDR);
connectForm("vlsm", showVLSM);

byId("cidr-example").addEventListener("click", () => {
  byId("cidr-input").value = "192.168.10.0/24";
  byId("cidr-input").focus();
});

byId("vlsm-example").addEventListener("click", () => {
  byId("vlsm-base").value = "192.168.0.0/24";
  byId("vlsm-requests").value = "D: 10\nB: 50\nA: 100\nC: 25";
  byId("vlsm-requests").focus();
});
