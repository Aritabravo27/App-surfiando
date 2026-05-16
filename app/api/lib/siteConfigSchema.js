function isHttpUrl(s) {
  try {
    const u = new URL(String(s));
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeHttpUrl(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  if (isHttpUrl(s)) return s;
  const withHttps = `https://${s.replace(/^\/+/, '')}`;
  if (isHttpUrl(withHttps)) return withHttps;
  return s;
}

const MAX_JSON_CHARS = 100_000;

function normalizeGalleryImageArray(arr) {
  return (Array.isArray(arr) ? arr : [])
    .map((item, i) => {
      if (!item || typeof item !== 'object') return null;
      const url = typeof item.url === 'string' ? item.url.trim() : '';
      if (!isHttpUrl(url)) return null;
      const caption =
        typeof item.caption === 'string' ? item.caption.slice(0, 500) : undefined;
      const order =
        typeof item.order === 'number' && Number.isFinite(item.order) ? item.order : i;
      return { url, caption, order };
    })
    .filter(Boolean);
}

function normalizeEventsArray(arr) {
  return (Array.isArray(arr) ? arr : [])
    .map((item, i) => {
      if (!item || typeof item !== 'object') return null;
      const name = typeof item.name === 'string' ? item.name.trim().slice(0, 200) : '';
      const date = typeof item.date === 'string' ? item.date.trim().slice(0, 50) : '';
      const location =
        typeof item.location === 'string' ? item.location.trim().slice(0, 300) : '';
      const ctaUrl = normalizeHttpUrl(
        typeof item.ctaUrl === 'string' ? item.ctaUrl : ''
      );
      if (!name || !date || !location || !isHttpUrl(ctaUrl)) return null;
      const order =
        typeof item.order === 'number' && Number.isFinite(item.order) ? item.order : i;
      return { name, date, location, ctaUrl, order };
    })
    .filter(Boolean);
}

function normalizeMerchArray(arr) {
  return (Array.isArray(arr) ? arr : [])
    .map((item, i) => {
      if (!item || typeof item !== 'object') return null;
      const name = typeof item.name === 'string' ? item.name.trim().slice(0, 200) : '';
      const photoUrl =
        typeof item.photoUrl === 'string' ? item.photoUrl.trim() : '';
      const linkUrl =
        typeof item.linkUrl === 'string' ? item.linkUrl.trim() : '';
      if (!name || !isHttpUrl(photoUrl) || !isHttpUrl(linkUrl)) return null;
      const order =
        typeof item.order === 'number' && Number.isFinite(item.order) ? item.order : i;
      return { name, photoUrl, linkUrl, order };
    })
    .filter(Boolean);
}

function extractYoutubeId(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  const mWatch = s.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (mWatch) return mWatch[1];
  const mShort = s.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (mShort) return mShort[1];
  const mEmbed = s.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (mEmbed) return mEmbed[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  return null;
}

function normalizeMusicVideos(arr) {
  return (Array.isArray(arr) ? arr : [])
    .map((item, i) => {
      if (!item || typeof item !== 'object') return null;
      const idRaw =
        typeof item.youtubeId === 'string'
          ? item.youtubeId
          : typeof item.id === 'string'
            ? item.id
            : '';
      const youtubeId = extractYoutubeId(idRaw);
      if (!youtubeId) return null;
      const title =
        typeof item.title === 'string' && item.title.trim()
          ? item.title.trim().slice(0, 300)
          : undefined;
      const order =
        typeof item.order === 'number' && Number.isFinite(item.order) ? item.order : i;
      return { youtubeId, title, order };
    })
    .filter(Boolean);
}

function normalizeMusicAlbums(arr) {
  return (Array.isArray(arr) ? arr : [])
    .map((item, i) => {
      if (!item || typeof item !== 'object') return null;
      const title = typeof item.title === 'string' ? item.title.trim().slice(0, 200) : '';
      const coverUrl =
        typeof item.coverUrl === 'string'
          ? item.coverUrl.trim()
          : typeof item.cover === 'string'
            ? item.cover.trim()
            : '';
      if (!title || !isHttpUrl(coverUrl)) return null;
      const videos = normalizeMusicVideos(item.videos);
      const order =
        typeof item.order === 'number' && Number.isFinite(item.order) ? item.order : i;
      return { title, coverUrl, videos, order };
    })
    .filter(Boolean);
}

function normalizeTeamArray(arr) {
  return (Array.isArray(arr) ? arr : [])
    .map((item, i) => {
      if (!item || typeof item !== 'object') return null;
      const name = typeof item.name === 'string' ? item.name.trim().slice(0, 200) : '';
      const role = typeof item.role === 'string' ? item.role.trim().slice(0, 200) : '';
      const photoUrl =
        typeof item.photoUrl === 'string' ? item.photoUrl.trim() : '';
      const linkUrl =
        typeof item.linkUrl === 'string' ? item.linkUrl.trim() : '';
      if (!name || !role || !isHttpUrl(photoUrl) || !isHttpUrl(linkUrl)) return null;
      const bio =
        typeof item.bio === 'string' && item.bio.trim()
          ? item.bio.trim().slice(0, 2000)
          : undefined;
      const order =
        typeof item.order === 'number' && Number.isFinite(item.order) ? item.order : i;
      return { name, role, photoUrl, linkUrl, bio, order };
    })
    .filter(Boolean);
}

function defaultSiteConfig() {
  return {
    version: 1,
    home: {},
    gallery: {
      images: [],
      tapas: [],
      fotosEnVivo: [],
      cambalache: [],
    },
    videos: { clips: [], vivos: [] },
    social: {
      instagram: 'https://www.instagram.com/sur.fiando/',
      youtube: 'https://www.youtube.com/@proyectosurfiando360',
      spotify:
        'https://open.spotify.com/intl-es/artist/4IqVG0aAdQQ5cMBO9uLpk0?si=ybTYqHRCQr2IiKDTBFlEGg',
      bandcamp: 'https://surfiando.bandcamp.com/',
      email: 'mailto:proyectosurfiando.2020@gmail.com',
    },
    events: [],
    merch: [],
    music: { albums: [] },
    about: { team: [] },
    flags: {},
  };
}

function validateSiteConfigForPut(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'Body debe ser un objeto' };
  }
  try {
    const s = JSON.stringify(input);
    if (s.length > MAX_JSON_CHARS) {
      return { ok: false, error: `Config demasiado grande (máx ${MAX_JSON_CHARS} caracteres)` };
    }
  } catch {
    return { ok: false, error: 'JSON inválido' };
  }

  const def = defaultSiteConfig();
  const version = Number.isFinite(Number(input.version)) ? Number(input.version) : def.version;

  const home =
    input.home && typeof input.home === 'object' && !Array.isArray(input.home)
      ? input.home
      : def.home;

  const galleryKeys = ['images', 'tapas', 'fotosEnVivo', 'cambalache'];
  const gallery = {};
  for (const key of galleryKeys) {
    const arrIn = input.gallery?.[key];
    if (arrIn !== undefined && !Array.isArray(arrIn)) {
      return { ok: false, error: `gallery.${key} debe ser un array` };
    }
    gallery[key] = normalizeGalleryImageArray(
      arrIn !== undefined ? arrIn : def.gallery[key]
    );
  }

  const clipsIn = input.videos?.clips;
  const vivosIn = input.videos?.vivos;
  if (clipsIn !== undefined && !Array.isArray(clipsIn)) {
    return { ok: false, error: 'videos.clips debe ser un array' };
  }
  if (vivosIn !== undefined && !Array.isArray(vivosIn)) {
    return { ok: false, error: 'videos.vivos debe ser un array' };
  }

  function normVideoList(arr) {
    return (arr || []).map((item, i) => {
      if (!item) return null;
      const url = typeof item === 'string' ? item.trim() : (typeof item.url === 'string' ? item.url.trim() : '');
      if (!isHttpUrl(url)) return null;
      const title =
        typeof item.title === 'string' ? item.title.slice(0, 200) : undefined;
      return { url, title, order: typeof item.order === 'number' ? item.order : i };
    }).filter(Boolean);
  }

  const videos = {
    clips: normVideoList(clipsIn !== undefined ? clipsIn : def.videos.clips),
    vivos: normVideoList(vivosIn !== undefined ? vivosIn : def.videos.vivos),
  };

  let social = { ...def.social };
  if (input.social && typeof input.social === 'object' && !Array.isArray(input.social)) {
    const keys = ['instagram', 'youtube', 'spotify', 'bandcamp', 'email', 'phone'];
    for (const k of keys) {
      if (input.social[k] === undefined || input.social[k] === '') continue;
      const v = String(input.social[k]).trim();
      if (k === 'email') {
        if (v.startsWith('mailto:')) social[k] = v;
        else if (v.includes('@')) social[k] = `mailto:${v}`;
        continue;
      }
      if (k === 'phone') {
        social[k] = v.slice(0, 40);
        continue;
      }
      if (!isHttpUrl(v)) continue;
      social[k] = v;
    }
  }

  if (input.events !== undefined && !Array.isArray(input.events)) {
    return { ok: false, error: 'events debe ser un array' };
  }
  if (input.merch !== undefined && !Array.isArray(input.merch)) {
    return { ok: false, error: 'merch debe ser un array' };
  }
  if (input.about !== undefined && (typeof input.about !== 'object' || Array.isArray(input.about))) {
    return { ok: false, error: 'about debe ser un objeto' };
  }
  if (input.about?.team !== undefined && !Array.isArray(input.about.team)) {
    return { ok: false, error: 'about.team debe ser un array' };
  }
  if (input.about?.bio !== undefined && typeof input.about.bio !== 'string') {
    return { ok: false, error: 'about.bio debe ser texto' };
  }
  if (input.music !== undefined && (typeof input.music !== 'object' || Array.isArray(input.music))) {
    return { ok: false, error: 'music debe ser un objeto' };
  }
  if (input.music?.albums !== undefined && !Array.isArray(input.music.albums)) {
    return { ok: false, error: 'music.albums debe ser un array' };
  }

  const events = normalizeEventsArray(
    input.events !== undefined ? input.events : def.events
  );
  const merch = normalizeMerchArray(
    input.merch !== undefined ? input.merch : def.merch
  );
  const aboutTeam = normalizeTeamArray(
    input.about?.team !== undefined ? input.about.team : def.about.team
  );
  let aboutBio;
  if (input.about?.bio !== undefined) {
    const b = String(input.about.bio).trim();
    aboutBio = b ? b.slice(0, 8000) : undefined;
  }
  const about = {
    team: aboutTeam,
    ...(aboutBio ? { bio: aboutBio } : {}),
  };

  const musicAlbumsSrc =
    input.music?.albums !== undefined ? input.music.albums : def.music.albums;
  const music = { albums: normalizeMusicAlbums(musicAlbumsSrc) };

  const flags =
    input.flags && typeof input.flags === 'object' && !Array.isArray(input.flags)
      ? input.flags
      : def.flags;

  return {
    ok: true,
    value: {
      version,
      home,
      gallery,
      videos,
      social,
      events,
      merch,
      music,
      about,
      flags,
    },
  };
}

function mergeWithDefaults(data) {
  const def = defaultSiteConfig();
  if (!data || typeof data !== 'object') return def;
  return {
    version: typeof data.version === 'number' ? data.version : def.version,
    updatedAt: data.updatedAt ?? null,
    home: data.home && typeof data.home === 'object' ? data.home : def.home,
    gallery: {
      images: Array.isArray(data.gallery?.images) ? data.gallery.images : def.gallery.images,
      tapas: Array.isArray(data.gallery?.tapas) ? data.gallery.tapas : def.gallery.tapas,
      fotosEnVivo: Array.isArray(data.gallery?.fotosEnVivo)
        ? data.gallery.fotosEnVivo
        : def.gallery.fotosEnVivo,
      cambalache: Array.isArray(data.gallery?.cambalache)
        ? data.gallery.cambalache
        : def.gallery.cambalache,
    },
    videos: {
      clips: Array.isArray(data.videos?.clips) ? data.videos.clips : def.videos.clips,
      vivos: Array.isArray(data.videos?.vivos) ? data.videos.vivos : def.videos.vivos,
    },
    social: {
      ...def.social,
      ...(data.social && typeof data.social === 'object' ? data.social : {}),
    },
    events: Array.isArray(data.events) ? data.events : def.events,
    merch: Array.isArray(data.merch) ? data.merch : def.merch,
    music:
      data.music &&
      typeof data.music === 'object' &&
      Array.isArray(data.music.albums)
        ? { albums: data.music.albums }
        : def.music,
    about: (() => {
      const incoming = data.about && typeof data.about === 'object' ? data.about : null;
      const team = Array.isArray(incoming?.team) ? incoming.team : def.about.team;
      const out = { team };
      if (incoming && typeof incoming.bio === 'string' && incoming.bio.trim()) {
        out.bio = incoming.bio;
      }
      return out;
    })(),
    flags: data.flags && typeof data.flags === 'object' ? data.flags : def.flags,
  };
}

module.exports = {
  defaultSiteConfig,
  validateSiteConfigForPut,
  mergeWithDefaults,
};
