/* SRC-20 payload validator.
   Reproduces the field-level rules of the Bitcoin Stamps indexer (btc_stamps 1.9.3)
   for Bitcoin mainnet. Entirely client-side: nothing typed here leaves the page,
   is stored, or is logged. */
(function () {
  'use strict';

  var UINT64_MAX = 18446744073709551615n;

  var ALLOWED_ASCII = ".!#$%&()*0123456789<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ^_abcdefghijklmnopqrstuvwxyz~";

  /* The indexer's emoji allowlist, delta encoded in base 36 from config.SUPPORTED_UNICODE.
     1154 single code points. Composed sequences are deliberately absent. */
  var EMOJI_DELTAS = "2pz8.5n.4h.1.d.1.f.3.1.1.1.1.1.1.1.1.1.2v.1.o.l.3.1.1.1.1.1.1.1.1.m.1.4v.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.3.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.3.1.2.1.1.3.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.3.1.1.2.1.1.1.6.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.2.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.c.1.1.1.1.1.2.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.8.1.3.1.1.1.1.1.1.1.d.3.1.1.1.3.5.1.e.1.3.9.1.a.6.1.1.d.1.1.9.1.1.3.2.5.7.4.7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1d.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.6.1.1.1.1.1.1.1.3.1.1.9.1.1.1.1.1.4.2.1.4.3.1.1.1.1.1.1.1.1.1.6c.1.1.1.1.1.1.1.1.1.1.1.81.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.2.1.1.1.1.1.1.1.1.1.2.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.2.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.2.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.35.1.1.1.1.4.1.1.6.1.1.1.1.1.1.a.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.8.1.1.1.1.1.1.a.1.1.e.1.1.1.1.1.1";

  var EMOJI = (function () {
    var set = Object.create(null);
    var parts = EMOJI_DELTAS.split('.');
    var cp = 0;
    for (var i = 0; i < parts.length; i++) {
      cp += parseInt(parts[i], 36);
      set[cp] = true;
    }
    return set;
  })();

  var OPS = ['DEPLOY', 'MINT', 'TRANSFER'];
  var KEYSETS = {
    DEPLOY: ['op', 'tick', 'max', 'lim'],
    MINT: ['op', 'tick', 'amt'],
    TRANSFER: ['op', 'tick', 'amt']
  };
  var META = ['desc', 'x', 'web', 'email', 'tg'];

  /* ---------- helpers ---------- */

  /* impact is only meaningful on a failing check:
     'exclude' means the transaction never becomes an SRC-20 record,
     'invalid' means it is recorded with a status code but moves no balance. */
  function check(state, name, detail, rule, impact) {
    return { state: state, name: name, detail: detail, rule: rule || '', impact: impact || null };
  }

  /* Find an unquoted JSON number literal using an exponent. The indexer raises
     during JSON parsing on these, which excludes the transaction outright. */
  function hasSciLiteral(text) {
    var inStr = false, esc = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (esc) { esc = false; continue; }
      if (c === '\\') { if (inStr) esc = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (c === 'e' || c === 'E') {
        // an exponent marker outside a string, immediately after a digit or dot
        var prev = text[i - 1];
        if (prev && (/[0-9.]/).test(prev)) return true;
      }
    }
    return false;
  }

  /* Render a JS number the way the indexer does: fixed notation, no exponent. */
  function numToText(n) {
    if (!isFinite(n)) return null;
    if (Number.isInteger(n) && Math.abs(n) < 1e21) return n.toFixed(0);
    var s = String(n);
    if (s.indexOf('e') === -1 && s.indexOf('E') === -1) return s;
    return n.toFixed(20).replace(/0+$/, '').replace(/\.$/, '');
  }

  function valueText(v) {
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return numToText(v);
    return null;
  }

  var NUMERIC_RE = /^[0-9]*(\.[0-9]*)?$/;
  var DEC_RE = /^[0-9]+$/;

  /* Compare a non-negative decimal string against the uint64 ceiling. */
  function withinUint64(text) {
    var parts = text.split('.');
    var ip = parts[0].replace(/^0+(?=\d)/, '') || '0';
    if (ip.length > 20) return false;
    var iv;
    try { iv = BigInt(ip); } catch (e) { return false; }
    if (iv > UINT64_MAX) return false;
    if (iv === UINT64_MAX && parts[1] && /[1-9]/.test(parts[1])) return false;
    return true;
  }

  function hasDigit(text) { return /[0-9]/.test(text); }

  function truncateDown(text) {
    return (text.split('.')[0].replace(/^0+(?=\d)/, '') || '0');
  }

  /* Decimal places after normalisation, that is, with trailing zeros removed. */
  function decimalPlaces(text) {
    var frac = text.split('.')[1];
    if (!frac) return 0;
    frac = frac.replace(/0+$/, '');
    return frac.length;
  }

  function codePoints(s) { return Array.from(s); }

  function describeChar(ch) {
    var cp = ch.codePointAt(0);
    var hex = cp.toString(16).toUpperCase();
    while (hex.length < 4) hex = '0' + hex;
    return 'U+' + hex;
  }

  /* ---------- the validator ---------- */

  function validate(text) {
    var out = { checks: [], notes: [], verdict: 'excluded', op: null };
    var add = function (c) { out.checks.push(c); };

    var raw = String(text || '').trim();
    if (!raw) { out.verdict = 'empty'; return out; }

    /* 1. Scientific notation, checked before parsing. */
    if (hasSciLiteral(raw)) {
      add(check('fail', 'Scientific notation',
        'An unquoted number uses an exponent. The indexer raises during JSON parsing, so the transaction is excluded entirely and never becomes an SRC-20 record.', 'P-2', 'exclude'));
      out.verdict = 'excluded';
      return out;
    }
    add(check('pass', 'Scientific notation', 'No unquoted exponent literal present.', 'P-2'));

    /* 2. JSON. */
    var obj;
    try {
      obj = JSON.parse(raw);
    } catch (e) {
      add(check('fail', 'JSON parse', 'Not valid JSON: ' + e.message + '. The transaction is excluded.', 'P-1', 'exclude'));
      out.verdict = 'excluded';
      return out;
    }
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
      add(check('fail', 'JSON parse', 'The payload must be a single JSON object, not an array or a bare value.', 'P-1', 'exclude'));
      out.verdict = 'excluded';
      return out;
    }
    add(check('pass', 'JSON parse', 'Parsed as a JSON object.', 'P-1'));

    /* 3. Empty strings normalise to absent. */
    var emptied = [];
    var val = {};
    Object.keys(obj).forEach(function (k) {
      if (obj[k] === '') { emptied.push(k); val[k] = null; }
      else val[k] = obj[k];
    });
    if (emptied.length) {
      add(check('info', 'Empty fields normalised',
        'Treated as absent: ' + emptied.map(function (k) { return '"' + k + '"'; }).join(', ') + '.', 'P-6'));
    }

    /* 4. p */
    var p = val.p;
    if (typeof p !== 'string') {
      add(check('fail', 'Protocol field "p"', 'Missing, or not a string. Without a readable "p" the payload is not recognised as SRC-20.', 'P-3', 'exclude'));
      out.verdict = 'excluded';
      return out;
    }
    if (p.toLowerCase() === 'src-20') {
      add(check('pass', 'Protocol field "p"', '"' + p + '" lowercases to "src-20". The comparison is case-insensitive.', 'P-3'));
    } else {
      var hint = '';
      if (p.toLowerCase() === 'brc-20') hint = ' This is a BRC-20 payload. BRC-20 lives in inscription witness data and follows different ticker and numeric rules.';
      else if (p.toLowerCase().replace('-', '') === 'src20') hint = ' The hyphen is required: "src20" is not accepted, only "src-20".';
      add(check('fail', 'Protocol field "p"', '"' + p + '" does not lowercase to "src-20".' + hint, 'P-3', 'exclude'));
      out.verdict = 'excluded';
      return out;
    }

    /* 5. tick */
    var tick = val.tick;
    if (typeof tick !== 'string' || tick === '') {
      add(check('fail', 'Ticker "tick"', 'Missing or empty. Every SRC-20 operation names a ticker, and a payload without one is excluded at the carrier check.', 'T-1', 'exclude'));
    } else {
      var cps = codePoints(tick);
      if (cps.length > 5) {
        add(check('fail', 'Ticker length', 'The ticker is ' + cps.length + ' code points. The limit is 5, so the transaction is excluded.', 'T-1', 'exclude'));
      } else {
        add(check('pass', 'Ticker length', cps.length + ' of a maximum 5 code points.', 'T-1'));
        var bad = [];
        for (var i = 0; i < cps.length; i++) {
          var ch = cps[i];
          var okChar = (ch.length === 1 && ALLOWED_ASCII.indexOf(ch) !== -1) || EMOJI[ch.codePointAt(0)] === true;
          if (!okChar) bad.push(ch + ' (' + describeChar(ch) + ')');
        }
        if (bad.length) {
          add(check('fail', 'Ticker characters',
            'Not in the allowed set: ' + bad.join(', ') + '. The set is a fixed ASCII list plus a fixed allowlist of 1154 single emoji code points. Space, hyphen, comma, plus, slash, colon and all bracket and quote characters are excluded, as are composed emoji sequences.', 'T-2, T-3', 'exclude'));
        } else {
          add(check('pass', 'Ticker characters', 'Every character is in the allowed set.', 'T-2, T-3'));
        }
      }
      if (tick !== tick.toLowerCase()) {
        add(check('info', 'Ticker case',
          '"' + tick + '" is stored and compared as "' + tick.toLowerCase() + '". Tickers are case-insensitive.', 'T-4'));
      }
    }

    /* 6. op */
    var op = val.op;
    var opUpper = typeof op === 'string' ? op.toUpperCase() : null;
    if (!opUpper) {
      add(check('fail', 'Operation "op"',
        'Missing, or not a string. The payload is still recorded and marked invalid with status UO.', 'P-4', 'invalid'));
    } else if (OPS.indexOf(opUpper) === -1) {
      var uohint = opUpper === 'BULK_XFER'
        ? ' BULK_XFER exists in the indexer source but is unreachable: operation dispatch matches only DEPLOY, MINT and TRANSFER, so it always lands here.'
        : '';
      add(check('fail', 'Operation "op"',
        '"' + op + '" is not a recognised operation. It is recorded and marked invalid with status UO.' + uohint, 'P-4', 'invalid'));
      out.op = opUpper;
    } else {
      add(check('pass', 'Operation "op"', '"' + op + '" uppercases to ' + opUpper + '. Recognised.', 'P-4'));
      out.op = opUpper;
    }

    /* 7. required keys */
    var keys = Object.keys(val).filter(function (k) { return val[k] !== null; });
    var missing = [];
    if (out.op && KEYSETS[out.op]) {
      KEYSETS[out.op].forEach(function (k) { if (keys.indexOf(k) === -1) missing.push(k); });
      if (missing.length) {
        var mimpact = out.op === 'DEPLOY'
          ? 'The payload is recorded and marked invalid with status DE.'
          : 'The payload is recorded and marked invalid with status NA.';
        add(check('fail', 'Required fields for ' + out.op,
          'Missing: ' + missing.join(', ') + '. ' + mimpact, 'P-5', 'invalid'));
      } else {
        add(check('pass', 'Required fields for ' + out.op,
          KEYSETS[out.op].join(', ') + ' all present.', 'P-5'));
      }
      var extra = keys.filter(function (k) {
        return ['p', 'op', 'tick', 'max', 'lim', 'amt', 'dec'].indexOf(k) === -1;
      });
      if (extra.length) {
        var known = extra.filter(function (k) { return META.indexOf(k) !== -1; });
        var unknown = extra.filter(function (k) { return META.indexOf(k) === -1; });
        var d = '';
        if (known.length) d += 'Metadata stored on DEPLOY, no protocol effect: ' + known.join(', ') + '. ';
        if (unknown.length) d += 'Unrecognised, carried along and ignored: ' + unknown.join(', ') + '. ';
        add(check('info', 'Extra fields', d + 'Field presence is a superset test, so extra keys never invalidate a payload.', 'P-5'));
      }
    }

    /* 8. numeric fields */
    var decValue = null;

    if (val.dec !== undefined && val.dec !== null) {
      var decText = valueText(val.dec);
      if (decText === null || !DEC_RE.test(decText)) {
        add(check('fail', 'Decimals "dec"',
          'Must be a non-negative integer with no decimal point. The payload is recorded, dec is set to null, and the status is NN.', 'N-5', 'invalid'));
      } else if (Number(decText) > 18) {
        add(check('fail', 'Decimals "dec"',
          decText + ' is above the maximum of 18. The payload is recorded and marked invalid with status NN.', 'N-5', 'invalid'));
      } else {
        decValue = Number(decText);
        add(check('pass', 'Decimals "dec"', decText + ' is within 0 to 18.', 'N-5'));
      }
    } else if (out.op === 'DEPLOY') {
      decValue = 18;
      add(check('info', 'Decimals "dec"', 'Not supplied, so this token would deploy with 18 decimals. That is the default, and it is not the same as 0.', 'N-5'));
    }

    ['max', 'lim', 'amt'].forEach(function (key) {
      if (val[key] === undefined || val[key] === null) return;
      var t = valueText(val[key]);
      if (t === null) {
        add(check('fail', 'Numeric "' + key + '"',
          'Must be a JSON string or number. Any other type excludes the transaction.', 'P-7', 'exclude'));
        return;
      }
      if (!hasDigit(t)) {
        add(check('fail', 'Numeric "' + key + '"',
          '"' + t + '" contains no digits and cannot be read as a decimal. The transaction is excluded.', 'N-2', 'exclude'));
        return;
      }
      if (!NUMERIC_RE.test(t)) {
        /* Two different outcomes. The carrier check parses the string as a decimal:
           text a decimal parser accepts (a quoted exponent) survives that and then
           fails the stricter regex, giving a recorded NN. Text it rejects, or a value
           outside the range, excludes the transaction instead. */
        var quotedExp = /^[0-9]*\.?[0-9]+[eE][+-]?[0-9]+$/.test(t);
        if (quotedExp && withinUint64(numToText(Number(t)) || '0')) {
          add(check('fail', 'Numeric "' + key + '"',
            '"' + t + '" is a quoted exponent. A decimal parser reads it, so the carrier check passes, but it then fails the stricter regex ^[0-9]*(\\.[0-9]*)?$. The payload is recorded and marked invalid with status NN.', 'N-2', 'invalid'));
          return;
        }
        var why = '';
        if (/,/.test(t)) why = ' Thousands separators are rejected at or above height 833000. Below that height every non-digit was silently stripped, so this same payload was read as ' + t.replace(/[^0-9.]/g, '') + '.';
        else if (/^[+-]/.test(t)) why = ' A signed value falls outside the permitted range of 0 to the uint64 maximum.';
        else if (/\s/.test(t)) why = ' Whitespace is not allowed.';
        add(check('fail', 'Numeric "' + key + '"',
          '"' + t + '" does not match ^[0-9]*(\\.[0-9]*)?$ and is not readable as an in-range decimal, so the transaction is excluded.' + why, 'N-2, N-6', 'exclude'));
        return;
      }
      if (!withinUint64(t)) {
        add(check('fail', 'Numeric "' + key + '"',
          '"' + t + '" exceeds the ceiling of 18446744073709551615, so the transaction is excluded.', 'N-1', 'exclude'));
        return;
      }
      if (key === 'max' || key === 'lim') {
        var tr = truncateDown(t);
        if (tr !== t.replace(/\.0*$/, '') && t.indexOf('.') !== -1 && decimalPlaces(t) > 0) {
          add(check('info', 'Numeric "' + key + '"',
            '"' + t + '" is truncated down to ' + tr + '. Rounding down applies to max and lim, never to amt.', 'N-3'));
        } else {
          add(check('pass', 'Numeric "' + key + '"', 'Within range and integral.', 'N-1, N-3'));
        }
        if (tr === '0') {
          add(check('fail', 'Zero "' + key + '"',
            key + ' resolves to 0. A DEPLOY needs both max and lim to be non-zero, otherwise it is recorded and marked invalid with status DE.', 'V-1', 'invalid'));
        }
      } else {
        var dp = decimalPlaces(t);
        add(check('pass', 'Numeric "amt"', 'Within range. ' + (dp ? dp + ' decimal place' + (dp === 1 ? '' : 's') + ' after normalisation.' : 'Integral.') + ' amt is never truncated.', 'N-1, N-4'));
        if (dp > 0 && decValue !== null && dp > decValue) {
          add(check('fail', 'Decimal precision',
            'amt has ' + dp + ' decimal places but the token allows ' + decValue + '. The payload is recorded and marked invalid with status ID.', 'N-7', 'invalid'));
        }
      }
    });

    /* 9. DEPLOY specifics */
    if (out.op === 'DEPLOY' && missing.indexOf('lim') === -1 && missing.indexOf('max') === -1 &&
        val.max !== undefined && val.lim !== undefined && val.max !== null && val.lim !== null) {
      var maxT = valueText(val.max), limT = valueText(val.lim);
      if (maxT && limT && NUMERIC_RE.test(maxT) && NUMERIC_RE.test(limT) && hasDigit(maxT) && hasDigit(limT)) {
        var mi = BigInt(truncateDown(maxT)), li = BigInt(truncateDown(limT));
        if (li > mi && mi > 0n) {
          add(check('info', 'lim above max',
            'lim (' + li + ') is larger than max (' + mi + '). This deploys, but the effective per-mint limit becomes min(lim, max) = ' + mi + '.', 'V-7'));
        }
      }
    }
    if (out.op === 'DEPLOY' && missing.length) {
      add(check('info', 'Confusing status ahead',
        'A DEPLOY missing max or lim is not excluded. It is recorded and marked invalid with status DE, whose message reads "DEPLOY EXISTS" even when no earlier deploy exists. The status name is misleading; the cause is the missing field.', 'V-1'));
    }

    /* 10. verdict. Exclusion beats invalidity: an excluded transaction never
       reaches the stage where a status code could be recorded. */
    var fails = out.checks.filter(function (c) { return c.state === 'fail'; });
    if (!fails.length) out.verdict = 'wellformed';
    else if (fails.some(function (c) { return c.impact === 'exclude'; })) out.verdict = 'excluded';
    else out.verdict = 'invalid';

    /* 11. what this tool cannot know */
    if (out.op === 'DEPLOY') {
      out.notes.push('Whether this ticker is already deployed. First deploy wins, and a later one is invalid with status DE.');
    }
    if (out.op === 'MINT') {
      out.notes.push('Whether the ticker is deployed at all, which decides status ND.');
      out.notes.push('The remaining supply and the per-mint limit. If amt exceeds either, it is clamped and the mint is still VALID, with status OMA or ODL. Only a mint against a token whose supply is already exhausted is invalid, with status OM.');
      out.notes.push('The token\'s declared dec, which decides whether amt has too many decimal places.');
    }
    if (out.op === 'TRANSFER') {
      out.notes.push('Whether the ticker is deployed at all, which decides status ND.');
      out.notes.push('The sender\'s balance. A transfer larger than the balance is invalid with status BB, and nothing moves. There is no partial transfer.');
      out.notes.push('The token\'s declared dec, which decides whether amt has too many decimal places.');
    }
    out.notes.push('The transaction carrier. A well-formed payload still needs a valid bare multisig or OLGA P2WSH encoding, and for multisig a recognised burn key.');

    return out;
  }

  /* ---------- UI ---------- */

  var SAMPLES = {
    deploy: '{\n  "p": "src-20",\n  "op": "DEPLOY",\n  "tick": "PLATE",\n  "max": "21000000",\n  "lim": "1000",\n  "dec": "8"\n}',
    mint: '{\n  "p": "src-20",\n  "op": "MINT",\n  "tick": "PLATE",\n  "amt": "1000"\n}',
    transfer: '{\n  "p": "src-20",\n  "op": "TRANSFER",\n  "tick": "PLATE",\n  "amt": "250.5"\n}',
    brc20: '{\n  "p": "brc-20",\n  "op": "deploy",\n  "tick": "ordi",\n  "max": "21000000",\n  "lim": "1000"\n}',
    commas: '{\n  "p": "src-20",\n  "op": "DEPLOY",\n  "tick": "COMMA",\n  "max": "21,000,000",\n  "lim": "1,000"\n}',
    sci: '{\n  "p": "src-20",\n  "op": "DEPLOY",\n  "tick": "SCI",\n  "max": 1e6,\n  "lim": 1000\n}',
    longtick: '{\n  "p": "src-20",\n  "op": "MINT",\n  "tick": "TOOLONG",\n  "amt": "1"\n}',
    fractional: '{\n  "p": "src-20",\n  "op": "DEPLOY",\n  "tick": "TRUNC",\n  "max": "1000.9",\n  "lim": "10.75",\n  "dec": "0"\n}',
    bulk: '{\n  "p": "src-20",\n  "op": "BULK_XFER",\n  "tick": "PLATE",\n  "amt": "1",\n  "destinations": []\n}'
  };

  var VERDICTS = {
    empty: ['Waiting for a payload', 'Paste an SRC-20 JSON operation, or pick an example below.'],
    excluded: ['Excluded', 'This never becomes an SRC-20 record. It is not listed, not counted, and carries no status code.'],
    invalid: ['Recognised but invalid', 'The indexer records this operation and shows it in activity feeds, but it changes no balance.'],
    wellformed: ['Well formed', 'Every field-level rule passes. Chain state decides the rest.']
  };

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var input = document.getElementById('payload');
    var verdictEl = document.getElementById('verdict');
    var checksEl = document.getElementById('checks');
    var notesEl = document.getElementById('notes');
    var notesWrap = document.getElementById('notes-wrap');
    var noscript = document.getElementById('tool-noscript');
    var panel = document.getElementById('tool-panel');
    if (!input || !verdictEl || !checksEl) return;

    if (noscript) noscript.hidden = true;
    if (panel) panel.hidden = false;

    function render() {
      var res = validate(input.value);
      var v = VERDICTS[res.verdict] || VERDICTS.empty;

      verdictEl.setAttribute('data-state',
        res.verdict === 'wellformed' ? 'valid' : (res.verdict === 'empty' ? 'idle' : 'invalid'));
      verdictEl.innerHTML = '';
      var strong = document.createElement('span');
      strong.textContent = v[0];
      var sub = document.createElement('span');
      sub.className = 'verdict-sub';
      sub.textContent = v[1];
      verdictEl.appendChild(strong);
      verdictEl.appendChild(sub);

      checksEl.innerHTML = '';
      res.checks.forEach(function (c) {
        var li = document.createElement('li');
        li.className = c.state;
        var mark = document.createElement('span');
        mark.className = 'mark';
        mark.setAttribute('aria-hidden', 'true');
        mark.textContent = c.state === 'pass' ? '✓' : (c.state === 'fail' ? '✗' : 'i');
        var name = document.createElement('span');
        name.className = 'c-name';
        name.textContent = (c.state === 'pass' ? 'Pass: ' : c.state === 'fail' ? 'Fail: ' : 'Note: ') + c.name +
          (c.rule ? ' (' + c.rule + ')' : '');
        var det = document.createElement('span');
        det.className = 'c-detail';
        det.textContent = c.detail;
        li.appendChild(mark);
        li.appendChild(name);
        li.appendChild(document.createElement('span'));
        li.appendChild(det);
        checksEl.appendChild(li);
      });

      if (notesEl && notesWrap) {
        notesEl.innerHTML = '';
        notesWrap.hidden = res.verdict === 'empty' || !res.notes.length;
        res.notes.forEach(function (n) {
          var li = document.createElement('li');
          li.textContent = n;
          notesEl.appendChild(li);
        });
      }
    }

    var t = null;
    input.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(render, 120);
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-sample]'), function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-sample');
        if (SAMPLES[key]) {
          input.value = SAMPLES[key];
          render();
          input.focus();
        }
      });
    });

    render();
  });
})();
