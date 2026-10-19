'use strict';
/* IPv6-Hilfsfunktionen (Parsen, Kürzen, Subnetting, Typ-Erkennung, EUI-64) */
const IPv6 = {
  /** "2001:db8::1" -> [0x2001, 0xdb8, 0, 0, 0, 0, 0, 1] */
  parse(str) {
    let s = String(str).trim().toLowerCase().replace(/^\[|\]$/g, '').split('%')[0];
    const slash = s.indexOf('/');
    if (slash >= 0) s = s.slice(0, slash);
    if (!s) throw new Error('Bitte eine Adresse eingeben');
    if (!/^[0-9a-f:]+$/.test(s)) throw new Error('Nur Hex-Ziffern 0–9, a–f und „:“ erlaubt');
    const dbl = s.split('::');
    if (dbl.length > 2) throw new Error('„::“ darf nur EINMAL vorkommen');
    const left = dbl[0] ? dbl[0].split(':') : [];
    const right = dbl.length === 2 && dbl[1] ? dbl[1].split(':') : [];
    if ([...left, ...right].some(g => g.length < 1 || g.length > 4)) throw new Error('Jeder Block hat 1 bis 4 Hex-Ziffern (Doppelpunkte prüfen)');
    let groups;
    if (dbl.length === 2) {
      const miss = 8 - left.length - right.length;
      if (miss < 1) throw new Error('Zu viele Blöcke – mit „::“ müssen es weniger als 8 sein');
      groups = [...left, ...Array(miss).fill('0'), ...right];
    } else {
      if (left.length !== 8) throw new Error(`Ohne „::“ braucht man genau 8 Blöcke (gefunden: ${left.length})`);
      groups = left;
    }
    return groups.map(g => parseInt(g, 16));
  },
  hex4: v => v.toString(16).padStart(4, '0'),
  expand(x) { const g = Array.isArray(x) ? x : this.parse(x); return g.map(this.hex4).join(':'); },
  stripZeros(x) { const g = Array.isArray(x) ? x : this.parse(x); return g.map(v => v.toString(16)).join(':'); },
  /** längste Folge von 0-Blöcken (bei Gleichstand die erste) */
  zeroRun(g) {
    let bs = -1, bl = 0, cs = -1, cl = 0;
    for (let i = 0; i < 8; i++) {
      if (g[i] === 0) { if (cs < 0) { cs = i; cl = 1; } else cl++; if (cl > bl) { bl = cl; bs = cs; } }
      else { cs = -1; cl = 0; }
    }
    return { start: bs, len: bl };
  },
  /** Kürzen nach RFC 5952 */
  compress(x) {
    const g = Array.isArray(x) ? x : this.parse(x);
    const hex = g.map(v => v.toString(16));
    const { start, len } = this.zeroRun(g);
    if (len < 2) return hex.join(':');
    return hex.slice(0, start).join(':') + '::' + hex.slice(start + len).join(':');
  },
  toBig(g) { return g.reduce((a, v) => (a << 16n) | BigInt(v), 0n); },
  fromBig(n) { const g = []; for (let i = 0; i < 8; i++) { g.unshift(Number(n & 0xffffn)); n >>= 16n; } return g; },
  network(g, len) {
    const mask = len === 0 ? 0n : ((1n << BigInt(len)) - 1n) << BigInt(128 - len);
    return this.fromBig(this.toBig(g) & mask);
  },
  subnet(g, baseLen, newLen, idx) {
    return this.fromBig(this.toBig(this.network(g, baseLen)) + (BigInt(idx) << BigInt(128 - newLen)));
  },
  lastAddr(g, len) {
    return this.fromBig(this.toBig(this.network(g, len)) + (1n << BigInt(128 - len)) - 1n);
  },
  splitPrefix(str) {
    const m = String(str).trim().match(/^(.*?)(?:\/(\d{1,3}))?$/);
    return { addr: m[1], len: m[2] !== undefined ? +m[2] : null };
  },

  TYPES: {
    gua: { name: 'Global Unicast (GUA)', prefix: '2000::/3', desc: 'Weltweit eindeutig und im Internet routbar – die „öffentliche“ IPv6-Adresse.' },
    doc: { name: 'Global Unicast – Dokumentation', prefix: '2001:db8::/32', desc: 'Reserviert für Beispiele in Büchern und Schulungen. Wird im Internet nicht geroutet.' },
    lla: { name: 'Link-Local (LLA)', prefix: 'fe80::/10', desc: 'Nur im eigenen Netzsegment gültig, wird nie geroutet. Jede IPv6-Schnittstelle hat automatisch eine.' },
    ula: { name: 'Unique Local (ULA)', prefix: 'fc00::/7 (genutzt: fd00::/8)', desc: 'Private Adressen fürs Firmennetz – vergleichbar mit 192.168.x.x. Nicht im Internet routbar.' },
    lo: { name: 'Loopback', prefix: '::1/128', desc: 'Der Rechner selbst (wie 127.0.0.1 bei IPv4).' },
    unspec: { name: 'Unspecified (unspezifiziert)', prefix: '::/128', desc: '„Noch keine Adresse“ – Quelladresse z. B. bei DAD. Entspricht 0.0.0.0.' },
    mc: { name: 'Multicast', prefix: 'ff00::/8', desc: 'Ein Paket an eine Gruppe von Empfängern. Ersetzt in IPv6 den Broadcast.' },
    mapped: { name: 'IPv4-mapped', prefix: '::ffff:0:0/96', desc: 'Stellt eine IPv4-Adresse im IPv6-Format dar (Dual-Stack-Sockets).' },
    site: { name: 'Site-Local (veraltet)', prefix: 'fec0::/10', desc: 'Vorgänger der ULA – seit RFC 3879 abgeschafft.' },
    other: { name: 'Reserviert / nicht zugewiesen', prefix: '–', desc: 'Dieser Bereich ist aktuell nicht für normale Adressen vorgesehen.' },
  },
  MC_SCOPE: { 1: 'Interface-Local', 2: 'Link-Local', 4: 'Admin-Local', 5: 'Site-Local', 8: 'Organisation-Local', 14: 'Global' },
  classify(s) {
    const g = Array.isArray(s) ? s : this.parse(s);
    const T = this.TYPES;
    if (g.every(v => v === 0)) return { key: 'unspec', ...T.unspec };
    if (g.slice(0, 7).every(v => v === 0) && g[7] === 1) return { key: 'lo', ...T.lo };
    if (g.slice(0, 5).every(v => v === 0) && g[5] === 0xffff) return { key: 'mapped', ...T.mapped };
    if ((g[0] & 0xff00) === 0xff00) {
      const scope = g[0] & 0xf;
      const full = this.compress(g);
      const known = { 'ff02::1': 'Alle Knoten im Link (All-Nodes)', 'ff02::2': 'Alle Router im Link (All-Routers)', 'ff02::1:2': 'Alle DHCPv6-Server und -Relays', 'ff05::1:3': 'Alle DHCPv6-Server (Site)', 'ff02::fb': 'mDNS', 'ff02::5': 'OSPFv3-Router', 'ff02::6': 'OSPFv3 DR', 'ff02::9': 'RIPng-Router', 'ff02::a': 'EIGRP-Router', 'ff01::1': 'Alle Knoten (Interface)' };
      let extra = known[full] || '';
      if (g[0] === 0xff02 && g[1] === 0 && g[2] === 0 && g[3] === 0 && g[4] === 0 && g[5] === 1 && (g[6] & 0xff00) === 0xff00) extra = 'Solicited-Node-Multicast (für Neighbor Discovery / DAD)';
      return { key: 'mc', ...T.mc, extra: `Scope ${scope.toString(16)} = ${this.MC_SCOPE[scope] || 'unbekannt'}${extra ? ' · ' + extra : ''}` };
    }
    if ((g[0] & 0xffc0) === 0xfe80) return { key: 'lla', ...T.lla };
    if ((g[0] & 0xffc0) === 0xfec0) return { key: 'site', ...T.site };
    if ((g[0] & 0xfe00) === 0xfc00) return { key: 'ula', ...T.ula, extra: (g[0] & 0x100) ? 'L-Bit = 1 → lokal erzeugte ULA (fd…), so wird es in der Praxis gemacht.' : 'fc00::/8 ist reserviert – in der Praxis nutzt man fd00::/8.' };
    if (g[0] === 0x2001 && g[1] === 0x0db8) return { key: 'doc', ...T.doc };
    if ((g[0] & 0xe000) === 0x2000) return { key: 'gua', ...T.gua };
    return { key: 'other', ...T.other };
  },
  /** EUI-64 aus MAC-Adresse */
  eui64(mac) {
    const hex = String(mac).toLowerCase().replace(/[\s:.\-]/g, '');
    if (!/^[0-9a-f]{12}$/.test(hex)) throw new Error('Eine MAC-Adresse hat genau 12 Hex-Ziffern (48 Bit), z. B. 00:1A:2B:3C:4D:5E');
    const b = hex.match(/../g).map(x => parseInt(x, 16));
    const flipped = b[0] ^ 0x02;
    const bytes = [flipped, b[1], b[2], 0xff, 0xfe, b[3], b[4], b[5]];
    const groups = [];
    for (let i = 0; i < 8; i += 2) groups.push((bytes[i] << 8) | bytes[i + 1]);
    return { mac: b, flipped, bytes, groups, iid: groups.map(v => v.toString(16)).join(':'), iidFull: groups.map(this.hex4).join(':') };
  },
  solicitedNode(g) { return [0xff02, 0, 0, 0, 0, 1, 0xff00 | (g[6] & 0xff), g[7]]; },
  randGroup() { const r = Math.random(); return r < 0.4 ? 0 : r < 0.6 ? rnd(0x100) : r < 0.75 ? rnd(0x1000) : rnd(0x10000); },
  randAddr() {
    const g = Array.from({ length: 8 }, () => this.randGroup());
    g[0] = pick([0x2001, 0x2a02, 0x2003, 0xfd00 | rnd(256), 0xfe80]);
    if (g[0] === 0xfe80) { g[1] = g[2] = g[3] = 0; }
    if (g[0] === 0x2001 && Math.random() < .6) g[1] = 0x0db8;
    return g;
  },
};
