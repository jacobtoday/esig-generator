'use strict';
/*
 * Born Signature Studio — server
 * Env: DATABASE_URL (Postgres), ADMIN_PASSWORD (required), SESSION_SECRET (recommended), PORT, PGSSL=1 (optional)
 * Files: server.js + index.html + package.json (deps: express, pg)
 */
const express = require('express');
const crypto = require('crypto');
const path = require('path');

const ICONS = {"linkedin":"iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAACxklEQVR4nO2a7VUaQRiF71tBSAXBCqAD1gpCKgh2gBW4ViCpIFhBsAKXCgIVuKkgWAF5JmtOgiw7s8Qf+zHPOdfrD+Y9O48I46Lphf1+f0NNyZh0mQ1ZmdktLSNu89+oKekTTsInY/OpJPfT7yO3TsAT3wzVT3InYM83vSUKYP9RAN1bogD2HwXQdXkmG+IYk3ekldQVsCVzTlCZ/oERiaQFGZFWUUeA23zC5nf0EYwZUJlaJqGOgAszy1UBo4aSnkhrCBWwNrNEATBuQ7XmWRAq4N7MZgqAcUtJn0krCBWwtvBnQCZpQlpBqIAdAt7TXhj3kxqQVhAqwHGNhAV9EkbNqTvSGuoIcFyZ2VIlMGYm6StpFXUFODJxO4lsiGNMZiq6dZwjoFNEAew/CqBD2JIdqWJARuQ1a+JjKOkD+cMzWb1kw4tvrhe45ETFa86UTMjZ1BFwaa/+CnwNoxJJj+QA1hlVCWtT/b09/0BmLNvRlbAukZTqTBFNFOA9b5TB+qXOOII3TYB7bKozYcZSNSU0SUDCwzL9B8wYUJnKX4dKaYyAt+LUNZyicwIcXEeuw3eUkzRWALMm1FDFW++WEbkCYe2cuiNeGieAGWPKXXyiQ1bkysLfGo+uo4xGCWD9mHLrB6SML4ya016Ytae8NE2AW5uomgsL+HVg1oYakUoaI4C1Y+o78XHNuAVdCfMyBZwOmyQgUcnaEu4t4AYt8zK1TECq4ijsY20BN2iZlykKiAImpJIogAfu6RAuLQqIAjJVwKhEUUAU8EgOYF0UQFXC2lRRQBRwQ3ysLQqIAhJ5YF6mKCAKmJBK6ghYSspVzVB8pqdjUvlJVMRHruJafMxUXE8ldQR0kiiA/UcBdG+JAth/7wXkCvwktYP8cAJShR1Ausit8cWdmlbUR9InHjhRTn8LcCAhVfFvZyPSZbZkyeYXtH4BZcDLMlIUohYAAAAASUVORK5CYII=","facebook":"iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAFJElEQVR4nO2a/1UiSQCEqyPY2QhOIti5CHaMQIxgMYLFCBYiECPYMQIxgh0iECMQI3CMYO5rfh0Iw/Qw3fPg3X3v1Sv3D7uqS0FkNQpMURQx9h0lkiKU6DCZpBxlkibGmCkejCADcOkrrLtUhJqQo7EVYzzhXvE2AJe+kPQD9VGEQpCjEbpnjBxvTOMBuHiE/UJ91BY5SiUNTcMhGg3A5X9iA4X7ileRowEj3ONHcdQAXDzGfiPrp8AUXTPETDWpPQCX70m6QxE6JXJ0ywipalBrAC5vL95Hp8yIEW5xJ5wH4PL2W76n8yBlhBu8EoMq4fKPWBedE04jGHQQLn9OX/nPVI5gUClcfoT9ROfM0BgzUAmlA3D5LvaI2maCLDMtFKEYWSL0DdXlmhHG+A4G7cDlLyQ9owi1wQSNUEbRHD8I/SIsk/sYOeqYPWcbtAMBf7BE4XlBXYrNVBM6Zlr8lulKRs4lvoVBW3BwH7tDoXlAfUrleG3omaneAJYb8+mFkkFrODTCXpH1kEyMMYkaQNdM9QeYkdvB1xi0hkMHWvxmF5IPdEGRHD8aumaqP4BlaDZ+KqwH4MAIe0XWQzI0GwWOhb6ZjhsgJ/8rPmdzgIHO5KtvoW+m4waw3Jjlc8HmAK/YhcLyRHAXbwx9Mx0/wJQef+MyyB5mSz2i0NyY5fIu0OsHZrtFKEYR8kXH8ON3NUCqxft5obk0xmRygE6/sZ7CcUuX0WqAd8znumV0DKurAvr0tHjHKSTzh4EhLOYfzyg4BM4Hr4JOmY5/fNfhqx2gp/Brz+H+rgMUWBtc2gFStfP4P8UBhnaATO18u53iAA92gHc+iFBwuP+pDTCxA7QVdooDzP7rA+j/AcjyFfaC+qgU7p/JASolOkyM7lBjfA4wMQ3f5HCFyl3sETXmXAcYyM+v7h/nOkAqPy/e5j8GM/l5ITQx7Q2QyVdnDhvzwRVqysS0N0CB+WBoBxjIz+NpYloYgL4R9o58cGMHSCT9QU2ZmHYGSOSnr6Uzf2HCoQXWlIlpZ4A+doea8kHfaDXAGLtCTZiJ/47WAQgcYpXQ5xdWRqKFmvJgjOkZPrCBPbXwpgiB87wq6FNgobmmznheiLwIe0dBIXCeVwV9Qg/wQRV7Z60LkZnKz4uLUghd5x2CLgUWknuq9PGtAWLsGQWD0HXeIegSeoCOWb47vVWI3Ex+XmHthdCtvDLoUWCheDA8+WnJViFyE/n7GbsDwVt5ZdCjwELRMcuvvmWnENmpAj0XELyTtw86FFgI1o/9FTuFyI6wmaQvyCuE7+Ttgw4hBnhDMRVyfI1BO5DfxR6RVwjfm/cZ8kMMcE38GN+itBAdUnl+KFCgNG8TsgvMJ/dE9/EdSgvRIcIyuf8pWiWUKM3bhGyfA7wQG+N7OViIHhE2k6fnA4oczFtBrq8B7Bu1CbE5vpfKQnSJsUweRqBIZZ6FTB8DfKCEyCleimuhGMvUcATKuOY1HcDp8hanQhY6xViqBs8JFHLKI6vJAC8oISrHK3EqtIJeETZG31FtKOWUR06BHcMT6hGT4044FfoM/QY64n1EijnlcX6B1eWW40d4LZwK7YOOMZaqxkOCgk55nF1ngAnqcfRMR2BQI+ja0+JP3b+gg1DSKY8zXQZ4QwOOTNUAgxpD3wjro56kv9BeKOuUx3kFVsYLGnFUKg84FaoD3btYT3veZKW0Ux5nfB7gDWVaXHyKe8OgIHCHCEv0r75R3imPz51Jmi415tOsB+EfOd88qoeFjX0AAAAASUVORK5CYII=","instagram":"iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAGvklEQVR4nO2ajVXjRhSF76sAbQURFaypIKYCTAUrVbCmgjUVQCpAqgCnAuQK1lSAqABRgfONhYkZj/wv1s7mO+ee6+CZN+89jcaWs6YtmEwmEfYn6qBYtWa4v0WoDSo0RjNK1XJ/G5lZhW+EobWg6FjSBUpUF3mIjFEm6W+aUWoNVjbgrfAfKNFxkUm6thWNWNoAiv+ODdTelm6bCg1owl94kMYGUPwdlui/QUYTUnwBQwtQ/D3WQ9vwjEq1QwedoG0Y0oRL/AOGPkDx61z5Z1SIoKgk8Bj/dMi1KymW1FV9wVY1JyPXFH/H0DsE7GM3qIlHNCDIED84yD8R+Un6AzVxRf63+JT3BjA5lvQTRSjEtZkNdARQy0D1J1eICp1RSymYb0Am6RsKkZpZpiOCehJJdyhEbmaJYNoABseSnlCIazuSK+9DXQM174RTYxfMGtDHbpDPI4M6+MFBzhHmiuuqZoyuyLfC32FcqfCZ4MbezhrwE+sgn9QOdOs35FyhU5trAuMShW+FMePOjAER//GCfJ7NLNYBQs597AaFyO3t/p7B+Ao7QT5fXAN6vLhHPrl5gQ4Fch5iFyjE9Mri7zA+U/iAP3cNGKi+l3xSa2H7s16EfUXOO6hUrVfWG+MrIUamcEGOR+J08HcYnyh8G1y7BmQKBzs3s0J7gDVcQm6NHorVTIWGqFD9SFvhCxAvUbggx7V5n1qM70p6QD65a0Ch+seNDxDEsJ0gdlf17upqc1zxfdLI8QWIPcQu0DyPqMucCv8A4yeYz6iVBhAzwn6gPtqVUtIl6YzxD7BOIgpWfTsVjLnFgzB2gvnsvwHEi7AH1EH7okJXpJRpS8hrgvlMG/DCiwjN88pi/t9WQiw35wF1UBuktmUTyG2C+ZSuAaE3RmbW1QYQJsIeUAct4xUNUalajli1eugELeOS3Ib4RpBfodBO540J7jOyzRtwj/VQE89oQNxMSyBOIsYp/PXVUaFzC5wJyyBuobYaQIge5hrQRG4bfqkiZqb6ozNEQbxzfG2IV6jFBjxhscKktuKqN0HcRM2f9+e2wfcUYhVqowFMT9ScZG4bXnkf4mcK74SS2Kf4WhCnUEsNGGIXyOfZzGLtAdYoFT4TzlhjjK+EGIX23QCmRtgLCpHallvfh3UShXfZFWvc4ishRqEWGtBV/dHn88r8CN8brFVhJ2ieka2Rp4P5hVpowED1V16f3Ha8931YK1PgLGAdw1bC/EKf2IBr857IdqVpLdb5pQ0oFAgKqe3p/p/BWonC58Cp8eOmVsD8QoFc/28Ab0xwn5Gt14CBAtsSru03uQUGCiQFuf0mh2BX4Y/Bivlf8L3BWi9YhOYZ2Rp5OphfqIUGuIRcYiFS29M5wDqJwvf/FWvc4ishRqF9N8DB9CF2gXxKYpziO8MaT1isRc5YY4yvhBiFWmpAovDVcWTESfGtIb6LnWiRR2J38LUgTqE2GuAgRKnww4ojtS1vBeImam7uuR3C47CDED3sHjWx8U4g5h2WKMzINsjPQbxCbTXAQZghdoGaKMVPXcTN8UaI8w0bKHzPO15RlzhjfG2IW6jlBkRYofp/ey2jQkNUqpYjVq0eitAyLsltiG8E+RVqaECFn6B5tvocJ1aEFVrdhG1JbfvzZIL5PLsGFAp1BrCNIV4bTXhFfVLKtCXkNcF8RntvgIOYrgkDSd/RrjyjHumM8a0hpwnm004DZhC7q7oRC/HXYOerPg+5TDCfaQMyBR4y4Nw2+JxdBmt0sERcSfQHasIVPXxTwfoVvjOs31X4mSV3DRgo/ESX2p66Pw/rRVgHRaiDStWqWG+M7x3WTBT+QnXtGtDjxT3yyW3Pj7S/CmrM1LTLeTPixQvycVfkC370UKOrz9Xp82V60DFgjH1FPqm1cBt8JtSWKLz9H6mtM2tAH7tBPiWDTvGjhdqesFiLXFHbrfHCDYqlxn8qmzEwxY8O6rrDEoU5NX5MNV5MYXCm8EHhSO3IbgXqSRTe+o7c3g74+QbEksboBIXImJTiBw+13GB9FOIVdailFBh6h4lukpvcRCm+2TE5xw8O8v+GDSTFamZ67+NTDH2AIJmab4UZFRqiQnVTHgla4Z8GeUbYVxSL3wdUf8uM0DJye9v6MwwtQPAhdoG2pVStfRKr1rbk5hXvMBSEJmRavROOhdwCxTsaG+CgCX1soOaD8dBxB547s27xIEsb4KAJsQii49sNOXLFl1qCobV4a0QPJaoPn0PkEWXigF5V+Iy1GzAPzYiwDupKilVrRqzlz/y78IxK/UupWoX4DkPRFb4R/wDAGpMFW+ClQAAAAABJRU5ErkJggg==","x":"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","youtube":"iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAACxklEQVR4nO2ajVHbQBQGv1dB1AGmApQKolQQd4CpAFEBUgU2FSA6oIOYClA6oAOUCpw9CREcjENmOOni084sTzMwo7v1n2xjipwpAEbNFACjZgqAUTMFwL+y2WwSxgk6UkywJ9PbZPoYamxwF2v9xv1NjY4fZtYw97IzwNOGT3GOmf5fGqzxFm9sR5BXAdj8OWOFh0hOhCvmM1sB2Pw1Y6HDpiLCGbPFsIXN54wlxsAFEVbMLgCbTxiPGAsNHhvPCX2AnLHEmGjvBX2AtaQvGBN3Zpb1ATaM6CCAGXtPOb7HGPnsAmSSvmOMfHUBcg6WGCMXLkAh6RJ98hM/YWiULkCl7rrfJyU+SCokHWEo3LgAa/l/CSzNrOBcCcc5XmII3A0aQE9wzpm6N1zfcEzGCdDDuTN1IU5wDNoAjxwk6JPSdgToYQ05o9DwT5S1C7DhwDel7QngYBkJo5B0joMRTIAeljMT79nl/2HZElyAHpY1Z6zwCL0RbIAelleoe+n8hB9O8AEcLDFl3OOHE3QAlpYwzrGQJ4INwLJOGStM0BvBBWA5mbpL5UwDEEwAljFTt/GFBsQFqJkn6JPS9gRgDW7jOSY4JO2l8Fr+LzpK2xGAc88ZS5xpHMYJwDlnkq4x07gMG4BzJRxfYo4h0AaoNMwnQo9YaPjH+T6uXIBC3a0SI2XsAS5cgEyRfy+QcnCPMXJs/BARNozoMAfTBVjL/0thaNzZi2+Hc8YSY+LMzKo+QMJ4kKdPXQLEfVU3I0DTBnAQYaHu8jQGzoxbX/AcwEGESv6vCsfmxswWemIrgIMIC3WfxBzaw8Hd7d3/CVZ6wasADiIkjDkuJM3k+aNpj7hN11hJumXzDXMLw3dBlJSRoCPTNikm+BYp/us9ql/8WzRY40vW6mjY7J+/28m7AxwqUwCMmikARs0UAKNmCoBRMwXAqPkFFcQ65SSH67oAAAAASUVORK5CYII=","tiktok":"iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAEtUlEQVR4nN2agXHiVhRF36tg2QosV7ByBbErsFzB4gpMKgiuIFABuAKLDtSBcQUWHcgVKOdHIbuy+JK+9AWCM3PnRjPWu+9fAfGwVhkZOWB1fFfVDPfCORbwQAEx7oVzLOBFVafiiXMswPCdEjK8N+dawLOqzsUD51qAefrX6uFVcK4FGJ7Vw6vgnAswT/+GElLpwTkXYEgo4A7vjKJRwfldCjA8a4+3wiUUYLhT1UQ6cCkFmM+DO1Xd4k5cSgGGDN2pYwmXVMCeGSUs8VZcYgGGRIoPx0QauNQC9pi3Q4wSEXmnkAwvcY4FfKJvqBOUUDpz6WIMcP6mAm5QIh1L4PylM5cuxgDnry2A/ZUfCfnPRDqUwO2lM5cuxgCHaywAMz8XSPH+/oFaw+3/3r+ndDEGOFirAvbw4wvsCbWC20v3ly7GAAdyKsDALYGIrEXkD1QLt5fuL12MAQ6TY1bY37ozt4bYDEXoG6rA7aX7SxdjgEN0LuB3GHMrIrciEqJA/vus4HbF/qd00QcCTdA9Mh5I4ZXAJpjjpYC29BrGroEUH0ARCuQA7KtYa5g5/gLYcYL9jabSAPs6ZTB73AWwX4St0AQ1wr5OGczPMSuMc5rXhNMwdlthU3GAfV0zcswK45zmNdFqGDuZp71CEXKCfVtl7CErx6wwzmleE62GsdMr5nx4A/u2ythD1rgKYJ8VNpWOsG9jxu+Ql2NWGOc0r4naYexinrp5+m3ZoRglIpKy6xZ3gsxxFMAeE+wDGW9ih+bstpaekJtjVshQzBvWYeyxFpGfqIkNmrJXhveG3ByzQo515y4cHMYOgRRPv4kX9fjHCgayc8wKeQd37srBYeywwJ5QHRt2iXCvkD2KAj6wQOzsUMguGe4VsnPMCpmKeaMyjPwQe0N1PKqHD7xDkH/yAuYi8heysVPVQAaC/ByzQrZi3qgMIz/G7pGNJTvM8EEg/+QFvGEhsvHADjE+COSfvIDaBeCGHbb4IBBfm092Zec+VIaRf9QFvkL8UfMrw8g/6gJfIf6o+ZVh5NcuAIO9BYgOMfMZZIXsys59qAxjiS32A9l4YIcY9w7ZEfaKbLyTHeLeOFRAjN0jG0uWmOHeIXuBPSEbG7Ij3BuHCphL/S9CKUtc494h+wMLxM6fZC9wbygqwRIh9obqeFTPvwqTO5Xie8c6bsjd4t6oFGBgmVRErpCNVIplMrw35E0wU3ogdnaqGohnFFVgoQX2hOqIWegB7w15r1iE6liSN8O9YisgkHZfiKxZ6hHvDFkrbCrNXGvPP4w+hKKDsNha2n0lFqNHdXw7MH+CrVCEmhjk6RvqCphgqVj+nf0LqRRfir7gjTD7JzYXkUCa+UQBszPcO4qssGiEvaK2pFK8IhIpPrS2uJkTYlfoVoonHkh7HpgT44OgqBaWX0u7t8IQLDn8DB+MxgIMlBBj9+iYbDh8hA9K2wIm2FqOV8IGTSkgwwelVQF7KGItw78dlhx8hh8FpwIMlBBha2n3fwcXPpF56jF+NJwLMFDCBFsgX6+GJZpz+Aw/Kp0K2EMRgfz6u7wr5MIOxWjBwVM5EYq8QBkhdiuFAql+qfKOUil+R0g49BY/Of8AJQPvUEF4TssAAAAASUVORK5CYII=","pinterest":"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","whatsapp":"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"};
const ICON_BUFFERS = Object.fromEntries(Object.entries(ICONS).map(([k, v]) => [k, Buffer.from(v, 'base64')]));

// Person fields a client is allowed to write (photo ids are set only via the photo endpoint)
const PERSON_KEYS = ['name', 'title', 'department', 'company', 'phone', 'mobile', 'email', 'website', 'address',
  'extra1', 'extra2', 'social_linkedin', 'social_facebook', 'social_instagram', 'social_x', 'social_youtube',
  'social_tiktok', 'social_pinterest', 'social_whatsapp'];
const ID_RE = /^[A-Za-z0-9_-]{8,40}$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,50}$/;

function b64u(buf) { return Buffer.from(buf).toString('base64url'); }
function newId() { return crypto.randomBytes(12).toString('base64url'); }

function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const h = crypto.scryptSync(pw, salt, 32);
  return 's1$' + salt.toString('hex') + '$' + h.toString('hex');
}
function verifyPassword(pw, stored) {
  if (!stored || typeof pw !== 'string') return false;
  const [v, saltHex, hashHex] = stored.split('$');
  if (v !== 's1' || !saltHex || !hashHex) return false;
  const h = crypto.scryptSync(pw, Buffer.from(saltHex, 'hex'), 32);
  const want = Buffer.from(hashHex, 'hex');
  return h.length === want.length && crypto.timingSafeEqual(h, want);
}
function readablePassword() {
  const abc = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.randomBytes(12);
  let s = '';
  for (let i = 0; i < 12; i++) { s += abc[bytes[i] % abc.length]; if (i === 3 || i === 7) s += '-'; }
  return s;
}
function slugify(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'client';
}
function cleanStr(v, max) { return typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max || 300) : ''; }

function sniffImage(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.slice(0, 4).toString('latin1') === 'GIF8') return 'image/gif';
  return null;
}

function createApp(pool, cfg) {
  cfg = cfg || {};
  const adminPassword = cfg.adminPassword || '';
  const secret = cfg.sessionSecret || crypto.createHash('sha256').update('sigstudio:' + adminPassword).digest('hex');
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // ---------- helpers ----------
  const sign = (payload) => {
    const body = b64u(JSON.stringify(payload));
    const mac = crypto.createHmac('sha256', secret).update(body).digest('base64url');
    return body + '.' + mac;
  };
  const unsign = (tok) => {
    if (typeof tok !== 'string') return null;
    const [body, mac] = tok.split('.');
    if (!body || !mac) return null;
    const want = crypto.createHmac('sha256', secret).update(body).digest('base64url');
    const a = Buffer.from(mac), b = Buffer.from(want);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    try {
      const p = JSON.parse(Buffer.from(body, 'base64url').toString());
      if (!p.exp || p.exp < Date.now()) return null;
      return p;
    } catch (e) { return null; }
  };
  const parseCookies = (req) => {
    const out = {};
    (req.headers.cookie || '').split(';').forEach((c) => {
      const i = c.indexOf('=');
      if (i > 0) out[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim());
    });
    return out;
  };
  const setCookie = (req, res, name, value, maxAgeSec) => {
    const secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.append('Set-Cookie', `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure ? '; Secure' : ''}`);
  };
  const pwFingerprint = (h) => crypto.createHash('sha256').update(h || '').digest('hex').slice(0, 10);

  // login rate limit: 8 failures / 15 min per ip+scope
  const fails = new Map();
  const limited = (key) => {
    const now = Date.now();
    const arr = (fails.get(key) || []).filter((t) => now - t < 15 * 60 * 1000);
    fails.set(key, arr);
    return arr.length >= 8;
  };
  const noteFail = (key) => { const a = fails.get(key) || []; a.push(Date.now()); fails.set(key, a); };
  setInterval(() => { const now = Date.now(); for (const [k, v] of fails) { if (!v.some((t) => now - t < 15 * 60 * 1000)) fails.delete(k); } }, 10 * 60 * 1000).unref();

  const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch((e) => {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  });

  // ---------- schema ----------
  const ready = (async () => {
    await pool.query(`CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, pw_hash TEXT,
      design JSONB NOT NULL DEFAULT '{}', notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
    await pool.query(`CREATE TABLE IF NOT EXISTS people (
      id SERIAL PRIMARY KEY, client_id INT NOT NULL, data JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
    await pool.query(`CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY, client_id INT NOT NULL, kind TEXT NOT NULL, mime TEXT NOT NULL, data BYTEA NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
    await pool.query('CREATE INDEX IF NOT EXISTS people_client_idx ON people(client_id)');
  })();
  app.use((req, res, next) => ready.then(() => next(), next));

  // ---------- middleware ----------
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'no-referrer');
    next();
  });
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    // CSRF guard: state-changing calls must carry a custom header (not sendable cross-site without CORS preflight)
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers['x-requested-with'] !== 'sig') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  });
  const json = express.json({ limit: '512kb' });
  const rawImg = express.raw({ type: () => true, limit: '3mb' });

  // ---------- public: health, icons, images, pages ----------
  app.get('/healthz', (req, res) => res.json({ ok: true }));

  app.get('/icons/:name.png', (req, res) => {
    const b = ICON_BUFFERS[req.params.name];
    if (!b) return res.status(404).end();
    res.set({ 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable', 'Cross-Origin-Resource-Policy': 'cross-origin' });
    res.send(b);
  });

  app.get('/i/:id', wrap(async (req, res) => {
    if (!ID_RE.test(req.params.id)) return res.status(404).end();
    const r = await pool.query('SELECT mime, data FROM images WHERE id=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).end();
    res.set({ 'Content-Type': r.rows[0].mime, 'Cache-Control': 'public, max-age=31536000, immutable', 'Cross-Origin-Resource-Policy': 'cross-origin' });
    res.send(Buffer.from(r.rows[0].data));
  }));

  const page = (req, res) => {
    res.set({ 'Cache-Control': 'no-store', 'X-Frame-Options': 'DENY' });
    res.sendFile(path.join(__dirname, 'index.html'));
  };
  app.get(['/', '/admin', '/admin/*splat', '/c/:slug'], page);

  // ---------- shared data ops ----------
  const getClientBySlug = async (slug) => {
    const r = await pool.query('SELECT * FROM clients WHERE slug=$1', [slug]);
    return r.rows[0] || null;
  };
  const getClientById = async (id) => {
    const r = await pool.query('SELECT * FROM clients WHERE id=$1', [id]);
    return r.rows[0] || null;
  };
  const listPeople = async (cid) => {
    const r = await pool.query('SELECT id, data, updated_at FROM people WHERE client_id=$1 ORDER BY id', [cid]);
    return r.rows.map((p) => ({ id: p.id, data: p.data, updated_at: p.updated_at }));
  };
  const perm = (client, key) => !(client.design && client.design.perm && client.design.perm[key] === false);
  const cleanPerson = (input, existing) => {
    const out = {};
    const src = input && typeof input === 'object' ? input : {};
    for (const k of PERSON_KEYS) out[k] = cleanStr(src[k], k === 'address' ? 300 : 200);
    // photos are preserved from existing record; only the photo endpoint changes them
    if (existing) { if (existing.photo) out.photo = existing.photo; if (existing.photoRound) out.photoRound = existing.photoRound; }
    return out;
  };
  const peopleOps = {
    async create(client, body) {
      const data = cleanPerson(body && body.data);
      const r = await pool.query('INSERT INTO people(client_id, data) VALUES($1,$2) RETURNING id, data, updated_at', [client.id, data]);
      return r.rows[0];
    },
    async update(client, pid, body) {
      const cur = await pool.query('SELECT data FROM people WHERE id=$1 AND client_id=$2', [pid, client.id]);
      if (!cur.rows.length) return null;
      const data = cleanPerson(body && body.data, cur.rows[0].data);
      const r = await pool.query('UPDATE people SET data=$1, updated_at=now() WHERE id=$2 AND client_id=$3 RETURNING id, data, updated_at', [data, pid, client.id]);
      return r.rows[0];
    },
    async remove(client, pid) {
      const r = await pool.query('DELETE FROM people WHERE id=$1 AND client_id=$2 RETURNING id', [pid, client.id]);
      return r.rows.length > 0;
    },
    async photo(client, pid, variant, buf) {
      const mime = sniffImage(buf);
      if (!mime) return { status: 400, error: 'Image must be PNG, JPG or GIF' };
      if (buf.length > 1.5 * 1024 * 1024) return { status: 400, error: 'Image too large (max 1.5MB)' };
      const cur = await pool.query('SELECT data FROM people WHERE id=$1 AND client_id=$2', [pid, client.id]);
      if (!cur.rows.length) return { status: 404, error: 'Not found' };
      const id = newId();
      await pool.query('INSERT INTO images(id, client_id, kind, mime, data) VALUES($1,$2,$3,$4,$5)', [id, client.id, 'photo', mime, buf]);
      const data = Object.assign({}, cur.rows[0].data);
      if (variant === 'round') data.photoRound = id; else data.photo = id;
      const r = await pool.query('UPDATE people SET data=$1, updated_at=now() WHERE id=$2 RETURNING id, data, updated_at', [data, pid]);
      return { row: r.rows[0] };
    },
    async clearPhoto(client, pid) {
      const cur = await pool.query('SELECT data FROM people WHERE id=$1 AND client_id=$2', [pid, client.id]);
      if (!cur.rows.length) return null;
      const data = Object.assign({}, cur.rows[0].data);
      delete data.photo; delete data.photoRound;
      const r = await pool.query('UPDATE people SET data=$1, updated_at=now() WHERE id=$2 RETURNING id, data, updated_at', [data, pid]);
      return r.rows[0];
    },
  };

  // ======================================================================
  // CLIENT PORTAL API
  // ======================================================================
  const clientAuth = wrap(async (req, res, next) => {
    const client = await getClientBySlug(req.params.slug);
    if (!client) return res.status(404).json({ error: 'Not found' });
    const tok = unsign(parseCookies(req)['sig_c_' + client.slug]);
    const adminTok = unsign(parseCookies(req).sig_admin);
    const okClient = tok && tok.r === 'client' && tok.cid === client.id && tok.v === pwFingerprint(client.pw_hash);
    const okAdmin = adminTok && adminTok.r === 'admin';
    if (!okClient && !okAdmin) return res.status(401).json({ error: 'Not signed in' });
    req.client = client;
    next();
  });

  app.get('/api/c/:slug/meta', wrap(async (req, res) => {
    const client = await getClientBySlug(req.params.slug);
    if (!client) return res.status(404).json({ error: 'Not found' });
    const tok = unsign(parseCookies(req)['sig_c_' + client.slug]);
    const adminTok = unsign(parseCookies(req).sig_admin);
    const authed = !!((tok && tok.r === 'client' && tok.cid === client.id && tok.v === pwFingerprint(client.pw_hash)) || (adminTok && adminTok.r === 'admin'));
    res.json({ name: client.name, authed });
  }));

  app.post('/api/c/:slug/login', json, wrap(async (req, res) => {
    const key = (req.ip || '') + '|c|' + req.params.slug;
    if (limited(key)) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
    const client = await getClientBySlug(req.params.slug);
    const ok = client && verifyPassword(String(req.body && req.body.password || ''), client.pw_hash);
    if (!ok) { noteFail(key); return res.status(401).json({ error: 'Incorrect password' }); }
    const maxAge = 7 * 24 * 3600;
    setCookie(req, res, 'sig_c_' + client.slug, sign({ r: 'client', cid: client.id, v: pwFingerprint(client.pw_hash), exp: Date.now() + maxAge * 1000 }), maxAge);
    res.json({ ok: true });
  }));

  app.post('/api/c/:slug/logout', (req, res) => {
    setCookie(req, res, 'sig_c_' + String(req.params.slug).replace(/[^a-z0-9-]/g, ''), '', 0);
    res.json({ ok: true });
  });

  app.get('/api/c/:slug/data', clientAuth, wrap(async (req, res) => {
    res.json({ client: { name: req.client.name, design: req.client.design }, people: await listPeople(req.client.id) });
  }));

  app.post('/api/c/:slug/people', clientAuth, json, wrap(async (req, res) => {
    if (!perm(req.client, 'add')) return res.status(403).json({ error: 'Adding people is disabled for this account' });
    res.json(await peopleOps.create(req.client, req.body));
  }));
  app.put('/api/c/:slug/people/:pid', clientAuth, json, wrap(async (req, res) => {
    const row = await peopleOps.update(req.client, +req.params.pid, req.body);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  }));
  app.delete('/api/c/:slug/people/:pid', clientAuth, wrap(async (req, res) => {
    if (!perm(req.client, 'remove')) return res.status(403).json({ error: 'Removing people is disabled for this account' });
    const ok = await peopleOps.remove(req.client, +req.params.pid);
    res.status(ok ? 200 : 404).json({ ok });
  }));
  app.post('/api/c/:slug/people/:pid/photo', clientAuth, rawImg, wrap(async (req, res) => {
    if (!perm(req.client, 'photo')) return res.status(403).json({ error: 'Photo uploads are disabled for this account' });
    const r = await peopleOps.photo(req.client, +req.params.pid, req.query.variant, req.body);
    if (r.error) return res.status(r.status).json({ error: r.error });
    res.json(r.row);
  }));
  app.delete('/api/c/:slug/people/:pid/photo', clientAuth, wrap(async (req, res) => {
    if (!perm(req.client, 'photo')) return res.status(403).json({ error: 'Photo uploads are disabled for this account' });
    const row = await peopleOps.clearPhoto(req.client, +req.params.pid);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  }));

  // ======================================================================
  // ADMIN API
  // ======================================================================
  const adminAuth = (req, res, next) => {
    const t = unsign(parseCookies(req).sig_admin);
    if (!t || t.r !== 'admin') return res.status(401).json({ error: 'Not signed in' });
    next();
  };

  app.post('/api/admin/login', json, (req, res) => {
    const key = (req.ip || '') + '|admin';
    if (!adminPassword) return res.status(503).json({ error: 'ADMIN_PASSWORD is not set on the server' });
    if (limited(key)) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
    const h = (s) => crypto.createHash('sha256').update(String(s)).digest();
    if (!crypto.timingSafeEqual(h(req.body && req.body.password || ''), h(adminPassword))) {
      noteFail(key);
      return res.status(401).json({ error: 'Incorrect password' });
    }
    const maxAge = 7 * 24 * 3600;
    setCookie(req, res, 'sig_admin', sign({ r: 'admin', exp: Date.now() + maxAge * 1000 }), maxAge);
    res.json({ ok: true });
  });
  app.post('/api/admin/logout', (req, res) => { setCookie(req, res, 'sig_admin', '', 0); res.json({ ok: true }); });
  app.get('/api/admin/me', (req, res) => {
    const t = unsign(parseCookies(req).sig_admin);
    res.json({ authed: !!(t && t.r === 'admin') });
  });

  app.get('/api/admin/clients', adminAuth, wrap(async (req, res) => {
    const r = await pool.query('SELECT id, slug, name, updated_at, created_at FROM clients ORDER BY lower(name)');
    const counts = await pool.query('SELECT client_id, count(*) AS n FROM people GROUP BY client_id');
    const m = {}; counts.rows.forEach((c) => { m[c.client_id] = +c.n; });
    res.json(r.rows.map((c) => ({ ...c, people: m[c.id] || 0 })));
  }));

  app.post('/api/admin/clients', adminAuth, json, wrap(async (req, res) => {
    const name = cleanStr(req.body && req.body.name, 100);
    if (!name) return res.status(400).json({ error: 'Name required' });
    let slug = cleanStr(req.body.slug, 50).toLowerCase();
    if (!slug) slug = slugify(name) + '-' + crypto.randomBytes(3).toString('hex');
    if (!SLUG_RE.test(slug)) return res.status(400).json({ error: 'URL code must be 3+ chars: a-z, 0-9, dashes' });
    if (await getClientBySlug(slug)) return res.status(409).json({ error: 'That URL code is taken' });
    const design = req.body.design && typeof req.body.design === 'object' ? req.body.design : {};
    const password = readablePassword();
    const r = await pool.query('INSERT INTO clients(slug, name, pw_hash, design) VALUES($1,$2,$3,$4) RETURNING id, slug, name',
      [slug, name, hashPassword(password), design]);
    res.json({ ...r.rows[0], password });
  }));

  const adminClient = wrap(async (req, res, next) => {
    const client = await getClientById(+req.params.id);
    if (!client) return res.status(404).json({ error: 'Not found' });
    req.client = client;
    next();
  });

  app.get('/api/admin/clients/:id', adminAuth, adminClient, wrap(async (req, res) => {
    const c = req.client;
    res.json({ id: c.id, slug: c.slug, name: c.name, notes: c.notes, design: c.design, people: await listPeople(c.id) });
  }));

  app.put('/api/admin/clients/:id', adminAuth, adminClient, json, wrap(async (req, res) => {
    const c = req.client, b = req.body || {};
    const name = b.name !== undefined ? cleanStr(b.name, 100) : c.name;
    if (!name) return res.status(400).json({ error: 'Name required' });
    let slug = b.slug !== undefined ? cleanStr(b.slug, 50).toLowerCase() : c.slug;
    if (slug !== c.slug) {
      if (!SLUG_RE.test(slug)) return res.status(400).json({ error: 'URL code must be 3+ chars: a-z, 0-9, dashes' });
      if (await getClientBySlug(slug)) return res.status(409).json({ error: 'That URL code is taken' });
    }
    const design = b.design && typeof b.design === 'object' ? b.design : c.design;
    const notes = b.notes !== undefined ? cleanStr(b.notes, 4000) : c.notes;
    await pool.query('UPDATE clients SET name=$1, slug=$2, design=$3, notes=$4, updated_at=now() WHERE id=$5', [name, slug, design, notes, c.id]);
    res.json({ ok: true, slug });
  }));

  app.post('/api/admin/clients/:id/password', adminAuth, adminClient, json, wrap(async (req, res) => {
    let password = cleanStr(req.body && req.body.password, 100);
    if (password && password.length < 8) return res.status(400).json({ error: 'Password must be 8+ characters' });
    if (!password) password = readablePassword();
    await pool.query('UPDATE clients SET pw_hash=$1, updated_at=now() WHERE id=$2', [hashPassword(password), req.client.id]);
    res.json({ password });
  }));

  app.delete('/api/admin/clients/:id', adminAuth, adminClient, wrap(async (req, res) => {
    const id = req.client.id;
    await pool.query('DELETE FROM images WHERE client_id=$1', [id]);
    await pool.query('DELETE FROM people WHERE client_id=$1', [id]);
    await pool.query('DELETE FROM clients WHERE id=$1', [id]);
    res.json({ ok: true });
  }));

  // design images (logo, banner). Kept forever so signatures already sent never lose their images.
  app.post('/api/admin/clients/:id/images', adminAuth, adminClient, rawImg, wrap(async (req, res) => {
    const mime = sniffImage(req.body);
    if (!mime) return res.status(400).json({ error: 'Image must be PNG, JPG or GIF (SVG is not supported by email clients)' });
    const kind = ['logo', 'banner', 'asset'].includes(req.query.kind) ? req.query.kind : 'asset';
    const id = newId();
    await pool.query('INSERT INTO images(id, client_id, kind, mime, data) VALUES($1,$2,$3,$4,$5)', [id, req.client.id, kind, mime, req.body]);
    res.json({ id });
  }));

  // admin-side people management (same rules, no permission flags)
  app.post('/api/admin/clients/:id/people', adminAuth, adminClient, json, wrap(async (req, res) => {
    res.json(await peopleOps.create(req.client, req.body));
  }));
  app.put('/api/admin/clients/:id/people/:pid', adminAuth, adminClient, json, wrap(async (req, res) => {
    const row = await peopleOps.update(req.client, +req.params.pid, req.body);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  }));
  app.delete('/api/admin/clients/:id/people/:pid', adminAuth, adminClient, wrap(async (req, res) => {
    const ok = await peopleOps.remove(req.client, +req.params.pid);
    res.status(ok ? 200 : 404).json({ ok });
  }));
  app.post('/api/admin/clients/:id/people/:pid/photo', adminAuth, adminClient, rawImg, wrap(async (req, res) => {
    const r = await peopleOps.photo(req.client, +req.params.pid, req.query.variant, req.body);
    if (r.error) return res.status(r.status).json({ error: r.error });
    res.json(r.row);
  }));
  app.delete('/api/admin/clients/:id/people/:pid/photo', adminAuth, adminClient, wrap(async (req, res) => {
    const row = await peopleOps.clearPhoto(req.client, +req.params.pid);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  }));

  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
  app.use((err, req, res, next) => {
    if (err && err.type === 'entity.too.large') return res.status(413).json({ error: 'File too large' });
    if (err && err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Bad request' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  });
  return app;
}

module.exports = { createApp, hashPassword, verifyPassword };

if (require.main === module) {
  const { Pool } = require('pg');
  if (!process.env.DATABASE_URL) { console.error('DATABASE_URL is required'); process.exit(1); }
  if (!process.env.ADMIN_PASSWORD) console.warn('WARNING: ADMIN_PASSWORD is not set — admin login is disabled');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.PGSSL === '1' ? { rejectUnauthorized: false } : undefined });
  const app = createApp(pool, { adminPassword: process.env.ADMIN_PASSWORD, sessionSecret: process.env.SESSION_SECRET });
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log('Signature Studio listening on ' + port));
}
