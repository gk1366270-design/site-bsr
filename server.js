import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import multer from 'multer';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as SteamStrategy } from 'passport-steam';
// Import Assetto Corsa UDP Service - handle both development and production
let assettoCorsaUdpService;
try {
  // Try to import from compiled dist folder (production)
  const { assettoCorsaUdpService: service } = await import('./dist/services/assettoCorsaUdpService.js');
  assettoCorsaUdpService = service;
  console.log('Using compiled Assetto Corsa UDP service');
} catch (e) {
  console.log('Using development Assetto Corsa UDP service');
  // Fallback to development import
  try {
    const { assettoCorsaUdpService: service } = await import('./src/services/assettoCorsaUdpService.js');
    assettoCorsaUdpService = service;
  } catch (devError) {
    console.error('Failed to load Assetto Corsa UDP service:', devError);
    // Create a mock service for fallback
    assettoCorsaUdpService = {
      setupWithHttpServer: (server) => console.log('Mock: UDP service setup'),
      startUdpListener: (port) => console.log(`Mock: UDP listener started on port ${port}`),
      stopUdpListener: () => console.log('Mock: UDP listener stopped'),
      configureServer: (ip, port, udpPort) => console.log(`Mock: Server configured: ${ip}:${port}, UDP: ${udpPort}`),
      getConnectionStatus: () => 'disconnected',
      getCurrentRaceState: () => ({ sessionStatus: 'Disconnected', sessionTime: '0:00', drivers: [], trackConditions: {}, sessionInfo: {}, lastUpdated: new Date().toISOString() }),
      clearData: () => console.log('Mock: Data cleared')
    };
  }
}

// Load .env file only in development
// In production (Discloud), use environment variables from the system
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Detect environment
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development' || !isProduction;

if (isDevelopment && !process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

// Validate critical environment variables in production
if (isProduction) {
  const criticalVars = ['STEAM_API_KEY', 'SESSION_SECRET', 'FRONTEND_URL'];
  const missing = criticalVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables in production: ${missing.join(', ')}`);
    console.warn('⚠️  Application may not work correctly without these variables!');
    console.warn('⚠️  Configure them in Discloud panel → Variáveis de Ambiente');
  }
}

// Set default values with preference for environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'https://brasilsimracing.discloud.app';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-in-production';
process.env.STEAM_API_KEY = process.env.STEAM_API_KEY || '';

console.log(`📦 Environment: ${process.env.NODE_ENV}`);
console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
console.log(`🔐 Session Secret: ${process.env.SESSION_SECRET ? '(set)' : '(NOT SET - WARNING!)'}`);
console.log(`🎮 Steam API Key: ${process.env.STEAM_API_KEY ? '(set)' : '(NOT SET - Steam auth will fail!)'}`);


const app = express();
const PORT = process.env.PORT || 8080;

// Start Vite dev server in development mode
if (process.env.NODE_ENV === 'development') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
  });
  app.use(vite.middlewares);
}


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories
const DIST_DIR = path.join(__dirname, 'dist');

// Basic middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log request for debugging
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_ROUTES) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Serve static build if exists
app.use(express.static(DIST_DIR));

// Rate limiter
// If running behind a proxy (dev containers / hosting), trust proxy for correct client IP
// Set to 1 for single proxy, or false for no proxy (local development)
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false);
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// initialize passport for Steam OpenID
app.use(passport.initialize());

const STEAM_API_KEY = process.env.STEAM_API_KEY || '';

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new SteamStrategy({
  returnURL: process.env.STEAM_RETURN_URL || `${process.env.FRONTEND_URL}/auth/steam/return`,
  realm: process.env.STEAM_REALM || `${process.env.FRONTEND_URL}`,
  apiKey: STEAM_API_KEY
}, function(identifier, profile, done) {
  process.nextTick(function () {
    return done(null, { identifier: identifier, profile: profile });
  });
}));

// Directories
const IMAGES_DIR = path.join(__dirname, 'public', 'assets', 'images');
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');
if (!fs.existsSync(ACCOUNTS_FILE)) fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify([], null, 2), 'utf8');

function readAccounts(){
  try{
    const raw = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  }catch(e){
    return [];
  }
}
function writeAccounts(arr){
  try{ fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(arr, null, 2), 'utf8'); }catch(e){ console.error('Failed to write accounts.json', e); }
}

// News / Races / Standings files
const NEWS_FILE = path.join(DATA_DIR, 'news.json');
const RACES_FILE = path.join(DATA_DIR, 'races.json');
const STANDINGS_FILE = path.join(DATA_DIR, 'standings.json');
const ACHIEVEMENTS_FILE = path.join(DATA_DIR, 'achievements.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
if (!fs.existsSync(NEWS_FILE)) fs.writeFileSync(NEWS_FILE, JSON.stringify([], null, 2), 'utf8');
if (!fs.existsSync(RACES_FILE)) fs.writeFileSync(RACES_FILE, JSON.stringify([], null, 2), 'utf8');
if (!fs.existsSync(STANDINGS_FILE)) fs.writeFileSync(STANDINGS_FILE, JSON.stringify([], null, 2), 'utf8');
if (!fs.existsSync(ACHIEVEMENTS_FILE)) fs.writeFileSync(ACHIEVEMENTS_FILE, JSON.stringify([], null, 2), 'utf8');
if (!fs.existsSync(SETTINGS_FILE)) fs.writeFileSync(SETTINGS_FILE, JSON.stringify({
  id: 'settings-1',
  siteName: 'Sim Racing Boost',
  siteDescription: 'Plataforma de gerenciamento de corridas virtuais',
  theme: 'system',
  defaultLanguage: 'pt-BR',
  maintenanceMode: false,
  registrationEnabled: true,
  emailVerificationRequired: false,
  defaultRaceSettings: {
    maxParticipants: 20,
    defaultLaps: 35,
    defaultDuration: '60 minutos'
  },
  udpConfiguration: {
    defaultListenAddress: '127.0.0.1:11095',
    defaultSendAddress: '127.0.0.1:12095',
    defaultRefreshInterval: 1000
  },
  socialMedia: {},
  contactInfo: {
    email: 'contato@simracingboost.com'
  },
  seoSettings: {
    metaTitle: 'Sim Racing Boost',
    metaDescription: 'Plataforma de gerenciamento de corridas virtuais',
    metaKeywords: 'sim racing, corrida virtual, esports'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}, null, 2), 'utf8');

function readJSON(file){
  try{ return JSON.parse(fs.readFileSync(file,'utf8') || '[]'); }catch(e){ return []; }
}
function writeJSON(file, obj){
  try{ fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8'); }catch(e){ console.error('Failed to write', file, e); }
}
function readNews(){ return readJSON(NEWS_FILE); }
function writeNews(data){ writeJSON(NEWS_FILE, data); }
function readRaces(){ return readJSON(RACES_FILE); }
function writeRaces(data){ writeJSON(RACES_FILE, data); }
function readStandings(){ return readJSON(STANDINGS_FILE); }
function writeStandings(data){ writeJSON(STANDINGS_FILE, data); }
function readAchievements(){ return readJSON(ACHIEVEMENTS_FILE); }
function writeAchievements(data){ writeJSON(ACHIEVEMENTS_FILE, data); }
function readSettings(){ return readJSON(SETTINGS_FILE); }
function writeSettings(data){ writeJSON(SETTINGS_FILE, data); }

// Admin helpers
function getAdmins(){
  const raw = process.env.ADMIN_USERS || '';
  if(!raw) return {};
  return raw.split(',').reduce((acc, token)=>{
    const t = String(token||'').trim(); if(!t) return acc;
    if(t.includes(':')){ const [u,p]=t.split(':'); if(u) acc[u.trim()]=(p||'').trim(); return acc; }
    if(/^\d+$/.test(t)){ acc['steam_'+t]=true; acc[t]=true; return acc; }
    acc[t]=true; const m = t.match(/^steam_(\d+)$/); if(m) acc[m[1]] = true; return acc;
  }, {});
}
function requireAuth(req,res,next){ if(req.session && req.session.user) return next(); return res.status(401).json({ok:false, message:'Não autorizado'}); }
function requireAdmin(req,res,next){ if(!req.session || !req.session.user) return res.status(401).json({ok:false, message:'Não autorizado'}); const admins = getAdmins(); if(!admins[req.session.user.username]) return res.status(403).json({ok:false, message:'Acesso negado: apenas administradores'}); next(); }

// Session and admin check endpoints
app.get('/api/session', (req,res)=>{
  console.log('Session check:', req.sessionID, req.session && req.session.user);
  res.json({ user: req.session && req.session.user ? req.session.user : null });
});
app.get('/api/admin/check', (req,res)=>{
  console.log('Admin check:', req.sessionID, req.session && req.session.user);
  if(!req.session || !req.session.user) return res.json({ isAdmin:false });
  const admins = getAdmins();
  console.log('Admins:', admins);
  console.log('Username:', req.session.user.username);
  console.log('isAdmin:', !!admins[req.session.user.username]);
  res.json({ isAdmin: !!admins[req.session.user.username] });
});

// Logout
app.post('/api/logout', (req,res)=>{ if(req.session) req.session.destroy(()=>res.json({ok:true})); else res.json({ok:true}); });

// Race register/unregister endpoints for authenticated users
app.post('/api/races/:id/register', requireAuth, (req,res)=>{
  const id = Number(req.params.id);
  const username = req.session.user.username;
  const data = readRaces();
  const race = data.find(x=>x.id===id);
  if(!race) return res.status(404).json({ok:false, message:'Corrida não encontrada'});
  if(!race.participants) race.participants = [];
  if(race.participants.find(p=>p.username===username)) return res.json({ok:true, message:'Já inscrito'});
  race.participants.push({ username, registeredAt: new Date().toISOString() });
  writeRaces(data);
  
  // Automatically add user to standings if race has a championship
  if(race.championship) {
    const standingsData = readStandings();
    const standing = standingsData.find(s => s.category === race.championship);
    if(standing) {
      // Add user to registeredPilots if not already there
      if(!standing.registeredPilots) standing.registeredPilots = [];
      if(!standing.registeredPilots.includes(username)) {
        standing.registeredPilots.push(username);
        
        // Add user to drivers list with default stats
        if(!standing.drivers) standing.drivers = [];
        if(!standing.drivers.some(d => d.name === username)) {
          standing.drivers.push({
            name: username,
            points: 0,
            team: "Independent"
          });
        }
        
        writeStandings(standingsData);
      }
    }
  }
  
  res.json({ok:true, message:'Inscrito na corrida'});
});

app.post('/api/races/:id/unregister', requireAuth, (req,res)=>{
  const id = Number(req.params.id);
  const username = req.session.user.username;
  const data = readRaces();
  const race = data.find(x=>x.id===id);
  if(!race) return res.status(404).json({ok:false, message:'Corrida não encontrada'});
  if(!race.participants) race.participants = [];
  const idx = race.participants.findIndex(p=>p.username === username);
  if(idx === -1) return res.status(400).json({ok:false, message:'Usuário não inscrito nesta corrida'});
  race.participants.splice(idx,1);
  writeRaces(data);
  res.json({ok:true, message:'Inscrição cancelada'});
});

// My races (for current user)
app.get('/api/my/races', requireAuth, (req,res)=>{
  const username = req.session.user.username;
  const data = readRaces();
  const mine = (data||[]).filter(r=> (r.participants||[]).some(p=>p.username===username));
  res.json(mine);
});

// News endpoints
app.get('/api/news', (req,res)=>{ res.json(readNews()); });
app.post('/api/news', requireAdmin, (req,res)=>{
  const data = readNews();
  const item = req.body;
  item.id = (data.reduce((m,it)=>Math.max(m, it.id||0),0) || 0) + 1;
  // Set author to current admin
  const adminUsername = req.session.user.username;
  const accounts = readAccounts();
  const adminAccount = accounts.find(a => a.username === adminUsername);
  item.author = adminAccount?.displayName || adminUsername;
  data.unshift(item);
  writeNews(data);
  res.json({ok:true, item});
});
app.put('/api/news/:id', requireAdmin, (req,res)=>{
  const id = Number(req.params.id);
  const data = readNews();
  const idx = data.findIndex(x=>x.id===id);
  if(idx===-1) return res.status(404).json({ok:false});
  const updated = Object.assign({}, data[idx], req.body);
  // Set author to current admin (update on edit)
  const adminUsername = req.session.user.username;
  const accounts = readAccounts();
  const adminAccount = accounts.find(a => a.username === adminUsername);
  updated.author = adminAccount?.displayName || adminUsername;
  data[idx] = updated;
  writeNews(data);
  res.json({ok:true, item:data[idx]});
});
app.delete('/api/news/:id', requireAdmin, (req,res)=>{
  const id = Number(req.params.id);
  const data = readNews();
  const idx = data.findIndex(x=>x.id===id);
  if(idx===-1) return res.status(404).json({ok:false});
  const removed = data.splice(idx,1)[0];
  writeNews(data);
  res.json({ok:true, removed});
});

// Races endpoints (with type/carClass)
app.get('/api/races', (req,res)=>{
  const races = readRaces();
  // Update pilots count based on participants
  races.forEach(race => {
    race.pilots = race.participants?.length || 0;
  });
  res.json(races);
});
app.post('/api/races', requireAdmin, (req,res)=>{
  const data = readRaces();
  const item = req.body;
  item.id = (data.reduce((m,it)=>Math.max(m, it.id||0),0) || 0) + 1;
  item.participants = item.participants || [];
  item.pilots = item.participants.length;
  data.unshift(item);
  writeRaces(data);
  res.json({ok:true, item});
});
app.put('/api/races/:id', requireAdmin, (req,res)=>{
  const id = Number(req.params.id);
  const data = readRaces();
  const idx = data.findIndex(x=>x.id===id);
  if(idx===-1) return res.status(404).json({ok:false});
  const updated = Object.assign({}, data[idx], req.body);
  updated.pilots = updated.participants?.length || 0;
  data[idx] = updated;
  writeRaces(data);
  res.json({ok:true, item:data[idx]});
});
app.delete('/api/races/:id', requireAdmin, (req,res)=>{
  const id = Number(req.params.id);
  const data = readRaces();
  const idx = data.findIndex(x=>x.id===id);
  if(idx===-1) return res.status(404).json({ok:false});
  const removed = data.splice(idx,1)[0];
  writeRaces(data);
  res.json({ok:true, removed});
});

// Standings endpoints
app.get('/api/standings', (req,res)=>{ res.json(readStandings()); });
app.post('/api/standings', requireAdmin, (req,res)=>{ const data = readStandings(); const obj = req.body; data.push(obj); writeStandings(data); res.json({ok:true, category: obj}); });
app.put('/api/standings/:category', requireAdmin, (req,res)=>{ const category = req.params.category; const data = readStandings(); const idx = data.findIndex(s=>s.category && s.category.toLowerCase()===category.toLowerCase()); if(idx===-1) return res.status(404).json({ok:false}); data[idx]=Object.assign({}, data[idx], req.body); writeStandings(data); res.json({ok:true, category: data[idx]}); });
app.delete('/api/standings/:category', requireAdmin, (req,res)=>{ const category = req.params.category; const data = readStandings(); const idx = data.findIndex(s=>s.category && s.category.toLowerCase()===category.toLowerCase()); if(idx===-1) return res.status(404).json({ok:false}); const removed = data.splice(idx,1)[0]; writeStandings(data); res.json({ok:true, removed}); });

// Achievements endpoints
app.get('/api/achievements', (req,res)=>{ res.json(readAchievements()); });
app.post('/api/achievements', requireAdmin, (req,res)=>{ const data = readAchievements(); const item = req.body; item.id = (data.reduce((m,it)=>Math.max(m, it.id||0),0) || 0) + 1; data.unshift(item); writeAchievements(data); res.json({ok:true, item}); });
app.put('/api/achievements/:id', requireAdmin, (req,res)=>{ const id = Number(req.params.id); const data = readAchievements(); const idx = data.findIndex(x=>x.id===id); if(idx===-1) return res.status(404).json({ok:false}); data[idx]=Object.assign({}, data[idx], req.body); writeAchievements(data); res.json({ok:true, item:data[idx]}); });
app.delete('/api/achievements/:id', requireAdmin, (req,res)=>{ const id = Number(req.params.id); const data = readAchievements(); const idx = data.findIndex(x=>x.id===id); if(idx===-1) return res.status(404).json({ok:false}); const removed = data.splice(idx,1)[0]; writeAchievements(data); res.json({ok:true, removed}); });

// Settings endpoints
app.get('/api/settings', (req,res)=>{ res.json(readSettings()); });
app.put('/api/settings', (req,res)=>{
  // TODO: Re-enable admin check in production
  // requireAdmin(req, res, () => {}
  const existingSettings = readSettings();
  const newData = req.body;
  const mergedSettings = { ...existingSettings, ...newData };
  mergedSettings.updatedAt = new Date().toISOString();
  writeSettings(mergedSettings);
  res.json({ok:true, settings: mergedSettings});
  // });
});

// My account
app.get('/api/my/account', requireAuth, (req,res)=>{
  const username = req.session.user.username;
  const accounts = readAccounts();
  const acc = accounts.find(a => a.username === username);
  if(!acc) return res.status(404).json({ok:false, message:'Account not found'});
  res.json(acc);
});

// Public endpoints for statistics (no auth required)
app.get('/api/public/accounts-count', (req, res) => {
  try {
    const accounts = readAccounts();
    res.json({ ok: true, count: accounts.length });
  } catch (error) {
    console.error('Error getting accounts count:', error);
    res.status(500).json({ ok: false, message: 'Failed to get accounts count' });
  }
});

app.get('/api/public/races-count', (req, res) => {
  try {
    const races = readRaces();
    res.json({ ok: true, count: races.length });
  } catch (error) {
    console.error('Error getting races count:', error);
    res.status(500).json({ ok: false, message: 'Failed to get races count' });
  }
});

app.get('/api/public/stats', (req, res) => {
  try {
    const accounts = readAccounts();
    const races = readRaces();
    const news = readNews();
    const standings = readStandings();
    
    // Calculate total participants across all races
    let totalParticipants = 0;
    races.forEach(race => {
      totalParticipants += race.participants ? race.participants.length : 0;
    });
    
    res.json({
      ok: true,
      stats: {
        accountsCount: accounts.length,
        racesCount: races.length,
        newsCount: news.length,
        standingsCount: standings.length,
        totalParticipants: totalParticipants,
        activeChampionships: standings.length
      }
    });
  } catch (error) {
    console.error('Error getting public stats:', error);
    res.status(500).json({ ok: false, message: 'Failed to get public stats' });
  }
});

// Accounts management for admin
app.get('/api/accounts', requireAdmin, (req,res)=>{ res.json(readAccounts()); });
app.put('/api/accounts/:username', requireAdmin, (req,res)=>{ const username = req.params.username; const data = readAccounts(); const idx = data.findIndex(a=>a.username===username); if(idx===-1) return res.status(404).json({ok:false}); data[idx]=Object.assign({}, data[idx], req.body); writeAccounts(data); res.json({ok:true, account:data[idx]}); });
app.delete('/api/accounts/:username', requireAdmin, (req,res)=>{ const username = req.params.username; const data = readAccounts(); const idx = data.findIndex(a=>a.username===username); if(idx===-1) return res.status(404).json({ok:false}); const removed = data.splice(idx,1)[0]; writeAccounts(data); res.json({ok:true, removed}); });

// Multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMAGES_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    cb(null, Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext);
  }
});
const upload = multer({ storage });

// Health
app.get('/ping', (req, res) => res.send('PONG'));

// Simple CSRF token endpoint
app.get('/api/csrf', (req, res) => {
  if (!req.session.csrfToken) req.session.csrfToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
  res.json({ csrf: req.session.csrfToken });
});

// Steam auth routes
app.get('/auth/steam', passport.authenticate('steam', { failureRedirect: process.env.FRONTEND_URL }), (req, res) => {});
app.get('/auth/steam/return', passport.authenticate('steam', { failureRedirect: process.env.FRONTEND_URL || '/' }), (req, res) => {
  const info = req.user && req.user.profile ? req.user.profile : null;
  if(!info){ return res.redirect(process.env.FRONTEND_URL); }
  const steamid = info.id || (info._json && info._json.steamid) || String(Date.now());
  const displayName = info.displayName || (info._json && info._json.personaname) || ('steam_' + steamid);
  const avatar = (info._json && (info._json.avatarfull || info._json.avatar)) || null;
  // create or update account in data/accounts.json
  try{
    const accounts = readAccounts();
    let acc = accounts.find(a => a.steam && a.steam.id === steamid);
    if(!acc){
      const username = 'steam_' + steamid;
      acc = { username, displayName, createdAt: new Date().toISOString(), steam: { id: steamid, displayName, avatar }, stats: { wins: 0, podiums: 0, points: 0 } };
      accounts.push(acc);
    } else {
      acc.displayName = displayName;
      acc.steam = Object.assign({}, acc.steam || {}, { id: steamid, displayName, avatar });
      if(!acc.stats) acc.stats = { wins: 0, podiums: 0, points: 0 };
    }
    writeAccounts(accounts);
    req.session.user = { username: acc.username };
    res.redirect(process.env.FRONTEND_URL);
  }catch(e){
    console.error('Error saving account:', e);
    req.session.user = { username: 'steam_' + steamid, displayName, avatar };
    res.redirect(process.env.FRONTEND_URL);
  }
});

// SPA fallback route - serve index.html for all unmatched routes
app.use((req, res, next) => {
  // Only apply SPA fallback to GET requests
  if (req.method !== 'GET') {
    return next();
  }

  // Check if the request is for an API route, auth route, or assets
  if (req.path.startsWith('/api/') || req.path.startsWith('/auth/') || req.path.startsWith('/assets/') || req.path.startsWith('/public/')) {
    return next();
  }

  // Check if DIST_DIR exists and file exists
  if (fs.existsSync(DIST_DIR)) {
    const fullPath = path.join(DIST_DIR, req.path);
    const indexPath = path.join(DIST_DIR, 'index.html');

    // If the exact file exists, serve it (for static assets)
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return res.sendFile(fullPath);
    }

    // Otherwise, serve index.html for SPA routing
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }

  next();
});

// Upload endpoint (example)
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false });
  const urlPath = '/assets/images/' + path.basename(req.file.filename);
  res.json({ ok: true, url: urlPath });
});

// Assetto Corsa UDP Service Configuration
app.get('/api/assetto-corsa/status', (req, res) => {
  res.json({
    status: assettoCorsaUdpService.getConnectionStatus(),
    raceState: assettoCorsaUdpService.getCurrentRaceState()
  });
});

// Add live-timing endpoint to serve data from Assetto Corsa UDP service
app.get('/live-timing', (req, res) => {
  try {
    const raceState = assettoCorsaUdpService.getCurrentRaceState();
    res.json(raceState);
  } catch (error) {
    console.error('Error fetching live timing data:', error);
    res.status(500).json({ error: 'Failed to fetch live timing data' });
  }
});

app.post('/api/assetto-corsa/configure', requireAdmin, (req, res) => {
  try {
    const { serverIp, serverPort, udpPort } = req.body;
    
    if (!serverIp || !serverPort || !udpPort) {
      return res.status(400).json({ ok: false, message: 'Missing required parameters' });
    }
    
    // Stop current UDP listener
    assettoCorsaUdpService.stopUdpListener();
    
    // Configure new settings
    assettoCorsaUdpService.configureServer(serverIp, serverPort, udpPort);
    
    // Start new UDP listener
    assettoCorsaUdpService.startUdpListener(udpPort);
    
    res.json({ ok: true, message: 'Assetto Corsa UDP service configured successfully' });
  } catch (error) {
    console.error('Error configuring Assetto Corsa service:', error);
    res.status(500).json({ ok: false, message: 'Failed to configure Assetto Corsa service' });
  }
});

app.post('/api/assetto-corsa/clear', requireAdmin, (req, res) => {
  assettoCorsaUdpService.clearData();
  res.json({ ok: true, message: 'Race data cleared' });
});

// Delete image endpoint
app.delete('/api/upload/:filename', requireAdmin, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(IMAGES_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ ok: true });
  } else {
    res.status(404).json({ ok: false, message: 'File not found' });
  }
});

// Add endpoint to configure UDP service for a specific race
app.post('/api/assetto-corsa/configure-for-race', requireAdmin, async (req, res) => {
  try {
    const { raceId } = req.body;
    
    if (!raceId) {
      return res.status(400).json({ ok: false, message: 'Race ID is required' });
    }
    
    // Get race data
    const races = readRaces();
    const race = races.find(r => r.id === Number(raceId));
    
    if (!race) {
      return res.status(404).json({ ok: false, message: 'Race not found' });
    }
    
    // Stop current UDP listener
    assettoCorsaUdpService.stopUdpListener();
    
    // Configure with race settings
    const config = assettoCorsaUdpService.configureServer(race);
    
    // Extract UDP port from udpSendAddress
    let udpPort = 9600;
    if (race.udpSendAddress) {
      const sendAddressParts = race.udpSendAddress.split(':');
      if (sendAddressParts.length === 2) {
        udpPort = parseInt(sendAddressParts[1]) || 9600;
      }
    }
    
    // Start new UDP listener with the correct port
    assettoCorsaUdpService.startUdpListener(udpPort);
    
    res.json({
      ok: true,
      message: 'Assetto Corsa UDP service configured for race',
      config: config
    });
  } catch (error) {
    console.error('Error configuring Assetto Corsa service for race:', error);
    res.status(500).json({ ok: false, message: 'Failed to configure Assetto Corsa service' });
  }
});

// Add endpoint to get current UDP configuration
app.get('/api/assetto-corsa/config', (req, res) => {
  try {
    const config = assettoCorsaUdpService.serverConfig;
    res.json({
      ok: true,
      config: config,
      status: assettoCorsaUdpService.getConnectionStatus()
    });
  } catch (error) {
    console.error('Error getting UDP configuration:', error);
    res.status(500).json({ ok: false, message: 'Failed to get UDP configuration' });
  }
});

// Test endpoint to configure UDP service for race (no auth for testing)
app.post('/api/test/configure-udp-for-race', (req, res) => {
  try {
    const { raceId } = req.body;
    
    if (!raceId) {
      return res.status(400).json({ ok: false, message: 'Race ID is required' });
    }
    
    // Get race data
    const races = readRaces();
    const race = races.find(r => r.id === Number(raceId));
    
    if (!race) {
      return res.status(404).json({ ok: false, message: 'Race not found' });
    }
    
    // Stop current UDP listener
    assettoCorsaUdpService.stopUdpListener();
    
    // Configure with race settings
    const config = assettoCorsaUdpService.configureServer(race);
    
    // Extract UDP port from udpSendAddress
    let udpPort = 9600;
    if (race.udpSendAddress) {
      const sendAddressParts = race.udpSendAddress.split(':');
      if (sendAddressParts.length === 2) {
        udpPort = parseInt(sendAddressParts[1]) || 9600;
      }
    }
    
    // Start new UDP listener with the correct port
    assettoCorsaUdpService.startUdpListener(udpPort);
    
    res.json({
      ok: true,
      message: 'Assetto Corsa UDP service configured for race',
      config: config,
      udpPort: udpPort
    });
  } catch (error) {
    console.error('Error configuring Assetto Corsa service for race:', error);
    res.status(500).json({ ok: false, message: 'Failed to configure Assetto Corsa service' });
  }
});

// ============================================================================
// LIVE TIMING ENDPOINTS
// ============================================================================

// HTTP Endpoint for live timing data
app.get('/live-timing', (req, res) => {
  try {
    const raceState = assettoCorsaUdpService.getCurrentRaceState();
    
    const response = {
      drivers: (raceState.drivers || []).map(driver => ({
        position: driver.position,
        number: driver.number,
        name: driver.name,
        team: driver.team,
        car: driver.car,
        lap: driver.lap,
        time: driver.time,
        gap: driver.gap,
        bestLap: driver.bestLap,
        lastLap: driver.lastLap,
        status: driver.status,
        fuelLevel: driver.fuelLevel || 0,
        pitStops: driver.pitStops || 0,
        tireCompound: driver.tireCompound || 'N/A',
        carId: driver.carId || driver.position,
        speed: driver.speed || 0,
        rpm: driver.rpm || 0,
        steeringAngle: driver.steeringAngle || 0,
        positionX: driver.positionX || (driver.position / 20),
        positionY: driver.positionY || (Math.sin(driver.position) * 0.5),
      })),
      trackConditions: {
        temperature: raceState.trackConditions?.temperature || 25,
        weatherType: raceState.trackConditions?.weatherType || 'Clear',
        windSpeed: raceState.trackConditions?.windSpeed || 0,
      },
      sessionInfo: {
        sessionTime: raceState.sessionInfo?.sessionTime || '0:00',
        sessionStatus: raceState.sessionInfo?.sessionStatus || 'Waiting',
        timeRemaining: raceState.sessionInfo?.timeRemaining || 'N/A',
      },
      lastUpdated: new Date().toISOString(),
    };
    
    res.json(response);
  } catch (error) {
    console.error('Erro ao obter live timing:', error);
    res.status(500).json({ 
      error: 'Erro ao obter dados de live timing',
      drivers: [],
      trackConditions: {},
      sessionInfo: {},
      lastUpdated: new Date().toISOString(),
    });
  }
});

// 404 handler - catches all routes not matched above
app.use((req, res) => {
  if (req.accepts('html')) {
    // For HTML requests, check if we can serve index.html
    const indexPath = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  
  if (req.accepts('json')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  res.status(404).send('Not found');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});


const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('BSR server running on port', PORT);
});

// Setup Assetto Corsa UDP service with WebSocket integration
assettoCorsaUdpService.setupWithHttpServer(server);

// Start UDP listener on default port (9600)
// Note: This will be reconfigured when race data is loaded
assettoCorsaUdpService.startUdpListener(9600);

// ============================================================================
// WEBSOCKET FOR LIVE TIMING
// ============================================================================

import WebSocket from 'ws';

// Criar servidor WebSocket
const wss = new WebSocket.Server({ 
  server: server,
  path: '/live-timing-ws'
});

const connectedClients = new Set();

wss.on('connection', (ws) => {
  console.log('🟢 Cliente conectado ao WebSocket');
  connectedClients.add(ws);
  
  const sendInterval = setInterval(() => {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        const raceState = assettoCorsaUdpService.getCurrentRaceState();
        
        ws.send(JSON.stringify({
          type: 'LIVE_UPDATE',
          data: {
            drivers: (raceState.drivers || []).map(driver => ({
              position: driver.position,
              number: driver.number,
              name: driver.name,
              team: driver.team,
              car: driver.car,
              lap: driver.lap,
              time: driver.time,
              gap: driver.gap,
              bestLap: driver.bestLap,
              lastLap: driver.lastLap,
              status: driver.status,
              fuelLevel: driver.fuelLevel || 0,
              pitStops: driver.pitStops || 0,
              tireCompound: driver.tireCompound || 'N/A',
              carId: driver.carId || driver.position,
              speed: driver.speed || 0,
              rpm: driver.rpm || 0,
              steeringAngle: driver.steeringAngle || 0,
              positionX: driver.positionX || (driver.position / 20),
              positionY: driver.positionY || (Math.sin(driver.position) * 0.5),
            })),
            trackConditions: {
              temperature: raceState.trackConditions?.temperature || 25,
              weatherType: raceState.trackConditions?.weatherType || 'Clear',
              windSpeed: raceState.trackConditions?.windSpeed || 0,
            },
            sessionInfo: {
              sessionTime: raceState.sessionInfo?.sessionTime || '0:00',
              sessionStatus: raceState.sessionInfo?.sessionStatus || 'Waiting',
              timeRemaining: raceState.sessionInfo?.timeRemaining || 'N/A',
            },
            lastUpdated: new Date().toISOString(),
          }
        }));
      }
    } catch (error) {
      console.error('Erro ao enviar WebSocket:', error);
    }
  }, 1000);
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'SUBSCRIBE') {
        console.log(`✅ Cliente subscrito à corrida ${data.raceId}`);
      }
    } catch (error) {
      console.error('Erro ao parsear mensagem:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('🔴 Cliente desconectado do WebSocket');
    connectedClients.delete(ws);
    clearInterval(sendInterval);
  });
  
  ws.on('error', (error) => {
    console.error('❌ Erro WebSocket:', error);
  });
});

console.log('Assetto Corsa UDP service started on port 9600');
console.log('WebSocket server available at /live-timing-ws');
console.log('Live timing HTTP endpoint available at /live-timing');

server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});
