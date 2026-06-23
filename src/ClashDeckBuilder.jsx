import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Sparkles, Swords, Loader2, Send, X, Heart, TrendingUp,
  Settings, MessageCircle, Star, Shield, Crown, Wand2, Layers, Trash2,
  Share2, Copy, Check, Search, Dices, ClipboardPaste, BarChart3, BookOpen,
} from "lucide-react";

/* =========================================================================
   ARENA TAKTİK MASASI — Clash Royale Deste Kurucu
   - Görseller: telifsiz, tamamen CSS/SVG ile üretilen rozet ikonları
     (gerçek Supercell sanat varlığı KULLANILMAZ)
   - Veri: oyunun yapısına sadık, sadeleştirilmiş yerel veri seti
     (gerçek sitede /api/clash-royale/* proxy'si resmi API'den çeker)
   - AI: "Domuz Binici" — Claude API ile gerçek sohbet
   ========================================================================= */

/* ---------------- Renk Sistemi (Elixir & Rol) ----------------
   Resmi/kurumsal palet: lacivert zemin, çelik mavisi ve madeni altın vurgu. */
const ELIXIR_COLORS = {
  1: "#4f7cab", 2: "#3f7fc1", 3: "#2f6fb0", 4: "#3a6e9e",
  5: "#8a6b2e", 6: "#a9852f", 7: "#b89233", 8: "#c9a227", 9: "#c9a227",
};
const getElixirColor = (n) => ELIXIR_COLORS[n] || "#5a6478";

/* Her rol belirgin şekilde farklı bir renk tonuna sahip olacak şekilde
   renk çemberinde dağıtılmıştır — kartlar ızgarada kolayca ayırt edilebilsin. */
const ROLE_COLORS = {
  Tank: "#c0392b",        // kırmızı
  "Tank-Mini": "#e67e22", // turuncu
  Hasar: "#e74c3c",       // canlı kırmızı-pembe
  Destek: "#2980b9",      // mavi
  Sürü: "#27ae60",        // yeşil
  Bina: "#7f8c8d",        // gri
  Büyü: "#8e44ad",        // mor
  Savunma: "#16a085",     // turkuaz
  Hızlı: "#f1c40f",       // sarı
};

/* Nadirlik renkleri — oyunun kendi nadirlik renk koduna sadık */
const RARITY_COLORS = {
  Ortak: "#9fb3c8", Nadir: "#e6883a", Epik: "#a855f7", Efsanevi: "#e6c84a",
};

/* ---------------- Yerel Veri Seti (tam kart listesi) ----------------
   İsimler oyunun resmi Türkçe yerelleştirmesine göredir.
   Gerçek sitede bu liste /api/clash-royale/cards proxy yanıtından doldurulur. */
const CARDS = [
  // --- Birlikler (Troops) ---
  { id: "knight", name: "Şövalye", elixir: 3, rarity: "Ortak", role: "Tank-Mini", evolution: true },
  { id: "archers", name: "Okçular", elixir: 3, rarity: "Ortak", role: "Destek", evolution: true },
  { id: "goblins", name: "Goblinler", elixir: 2, rarity: "Ortak", role: "Sürü", evolution: false },
  { id: "minions", name: "Minyonlar", elixir: 3, rarity: "Ortak", role: "Sürü", evolution: false },
  { id: "barbarians", name: "Barbarlar", elixir: 5, rarity: "Ortak", role: "Sürü", evolution: true },
  { id: "skeletons", name: "İskeletler", elixir: 1, rarity: "Ortak", role: "Sürü", evolution: true },
  { id: "bomber", name: "Bombacı", elixir: 2, rarity: "Ortak", role: "Hasar", evolution: true },
  { id: "speargoblins", name: "Mızraklı Goblinler", elixir: 2, rarity: "Ortak", role: "Destek", evolution: false },
  { id: "minionhorde", name: "Minyon Sürüsü", elixir: 5, rarity: "Ortak", role: "Sürü", evolution: false },
  { id: "royalgiant", name: "Kraliyet Devi", elixir: 6, rarity: "Ortak", role: "Tank", evolution: false },
  { id: "icespirit", name: "Buz Ruhu", elixir: 1, rarity: "Ortak", role: "Savunma", evolution: true },
  { id: "firespirit", name: "Ateş Ruhu", elixir: 1, rarity: "Ortak", role: "Hasar", evolution: false },
  { id: "goblingang", name: "Goblin Çetesi", elixir: 3, rarity: "Ortak", role: "Sürü", evolution: false },
  { id: "elitebarbs", name: "Elit Barbarlar", elixir: 6, rarity: "Ortak", role: "Hızlı", evolution: false },
  { id: "royalrecruits", name: "Kraliyet Acemileri", elixir: 7, rarity: "Ortak", role: "Sürü", evolution: false },
  { id: "bats", name: "Yarasalar", elixir: 2, rarity: "Ortak", role: "Sürü", evolution: true },
  { id: "rascals", name: "Haylazlar", elixir: 5, rarity: "Ortak", role: "Sürü", evolution: false },
  { id: "skeletonbarrel", name: "İskelet Fıçısı", elixir: 3, rarity: "Ortak", role: "Hasar", evolution: true },
  { id: "firecracker", name: "Maytapçı", elixir: 3, rarity: "Ortak", role: "Destek", evolution: true },
  { id: "skeletondragons", name: "İskelet Ejderhalar", elixir: 4, rarity: "Ortak", role: "Sürü", evolution: false },
  { id: "electrospirit", name: "Elektrik Ruhu", elixir: 1, rarity: "Ortak", role: "Savunma", evolution: false },
  { id: "berserker", name: "Çılgın Savaşçı", elixir: 2, rarity: "Ortak", role: "Hasar", evolution: false },
  { id: "giant", name: "Dev", elixir: 5, rarity: "Nadir", role: "Tank", evolution: false },
  { id: "valkyrie", name: "Valkür", elixir: 4, rarity: "Nadir", role: "Tank-Mini", evolution: true },
  { id: "musketeer", name: "Silahşör", elixir: 4, rarity: "Nadir", role: "Destek", evolution: true },
  { id: "wizard", name: "Büyücü", elixir: 5, rarity: "Nadir", role: "Destek", evolution: false },
  { id: "minipekka", name: "Mini P.E.K.K.A", elixir: 4, rarity: "Ortak", role: "Hasar", evolution: false },
  { id: "hogrider", name: "Domuz Binicisi", elixir: 4, rarity: "Nadir", role: "Hızlı", evolution: false },
  { id: "threemusketeers", name: "Üç Silahşörler", elixir: 9, rarity: "Nadir", role: "Sürü", evolution: false },
  { id: "battleram", name: "Koç Başı", elixir: 4, rarity: "Nadir", role: "Hızlı", evolution: true },
  { id: "icegolem", name: "Buz Golemi", elixir: 2, rarity: "Nadir", role: "Tank-Mini", evolution: false },
  { id: "megaminion", name: "Mega Dalkavuk", elixir: 3, rarity: "Nadir", role: "Destek", evolution: false },
  { id: "dartgoblin", name: "Dartçı Goblin", elixir: 3, rarity: "Nadir", role: "Destek", evolution: true },
  { id: "zappies", name: "Zıpzıplar", elixir: 4, rarity: "Nadir", role: "Savunma", evolution: false },
  { id: "flyingmachine", name: "Uçan Makine", elixir: 4, rarity: "Nadir", role: "Destek", evolution: false },
  { id: "royalhogs", name: "Kraliyet Domuzları", elixir: 5, rarity: "Nadir", role: "Hızlı", evolution: false },
  { id: "elixirgolem", name: "İksir Golemi", elixir: 3, rarity: "Nadir", role: "Tank-Mini", evolution: false },
  { id: "battlehealer", name: "Savaş Şifacısı", elixir: 4, rarity: "Nadir", role: "Destek", evolution: false },
  { id: "goblindemolisher", name: "Goblin Yıkıcı", elixir: 4, rarity: "Nadir", role: "Hasar", evolution: false },
  { id: "suspiciousbush", name: "Şüpheli Çalılık", elixir: 2, rarity: "Nadir", role: "Sürü", evolution: false },
  { id: "healspirit", name: "Şifa Ruhu", elixir: 1, rarity: "Nadir", role: "Savunma", evolution: false },
  { id: "pekka", name: "P.E.K.K.A", elixir: 7, rarity: "Epik", role: "Tank", evolution: false },
  { id: "balloon", name: "Balon", elixir: 5, rarity: "Epik", role: "Hasar", evolution: false },
  { id: "witch", name: "Cadı", elixir: 5, rarity: "Epik", role: "Destek", evolution: false },
  { id: "golem", name: "Golem", elixir: 8, rarity: "Epik", role: "Tank", evolution: false },
  { id: "skeletonarmy", name: "İskelet Ordusu", elixir: 3, rarity: "Epik", role: "Sürü", evolution: true },
  { id: "babydragon", name: "Yavru Ejderha", elixir: 4, rarity: "Epik", role: "Destek", evolution: true },
  { id: "prince", name: "Prens", elixir: 5, rarity: "Epik", role: "Hızlı", evolution: false },
  { id: "giantskeleton", name: "Dev İskelet", elixir: 6, rarity: "Epik", role: "Tank", evolution: false },
  { id: "guards", name: "Muhafızlar", elixir: 3, rarity: "Epik", role: "Sürü", evolution: false },
  { id: "darkprince", name: "Kara Prens", elixir: 4, rarity: "Epik", role: "Tank-Mini", evolution: false },
  { id: "bowler", name: "Atıcı", elixir: 5, rarity: "Epik", role: "Hasar", evolution: false },
  { id: "hunter", name: "Avcı", elixir: 4, rarity: "Epik", role: "Hasar", evolution: true },
  { id: "executioner", name: "Cellat", elixir: 5, rarity: "Epik", role: "Destek", evolution: false },
  { id: "cannoncart", name: "Top Arabası", elixir: 5, rarity: "Epik", role: "Destek", evolution: false },
  { id: "wallbreakers", name: "Duvar Yıkıcılar", elixir: 2, rarity: "Epik", role: "Hasar", evolution: true },
  { id: "goblingiant", name: "Goblin Devi", elixir: 6, rarity: "Epik", role: "Tank", evolution: false },
  { id: "electrodragon", name: "Elektrik Ejderhası", elixir: 5, rarity: "Epik", role: "Destek", evolution: true },
  { id: "electrogiant", name: "Elektrik Devi", elixir: 7, rarity: "Epik", role: "Tank", evolution: false },
  { id: "rungiant", name: "Rün Devi", elixir: 4, rarity: "Epik", role: "Destek", evolution: false },
  { id: "icewizard", name: "Buz Büyücüsü", elixir: 3, rarity: "Nadir", role: "Destek", evolution: false },
  { id: "princess", name: "Prenses", elixir: 3, rarity: "Efsanevi", role: "Destek", evolution: false },
  { id: "lavahound", name: "Lav Tazısı", elixir: 7, rarity: "Efsanevi", role: "Tank", evolution: false },
  { id: "miner", name: "Madenci", elixir: 3, rarity: "Efsanevi", role: "Hızlı", evolution: false },
  { id: "sparky", name: "Sparky", elixir: 6, rarity: "Efsanevi", role: "Hasar", evolution: false },
  { id: "lumberjack", name: "Oduncu", elixir: 4, rarity: "Efsanevi", role: "Hızlı", evolution: true },
  { id: "infernodragon", name: "Cehennem Ejderhası", elixir: 4, rarity: "Epik", role: "Hasar", evolution: true },
  { id: "electrowizard", name: "Elektrik Büyücüsü", elixir: 4, rarity: "Efsanevi", role: "Destek", evolution: false },
  { id: "bandit", name: "Haydut", elixir: 3, rarity: "Efsanevi", role: "Hızlı", evolution: false },
  { id: "nightwitch", name: "Gece Cadısı", elixir: 4, rarity: "Efsanevi", role: "Destek", evolution: false },
  { id: "royalghost", name: "Kraliyet Hayaleti", elixir: 3, rarity: "Epik", role: "Hasar", evolution: true },
  { id: "ramrider", name: "Koç Binicisi", elixir: 5, rarity: "Efsanevi", role: "Hızlı", evolution: false },
  { id: "megaknight", name: "Mega Şövalye", elixir: 7, rarity: "Epik", role: "Tank-Mini", evolution: false },
  { id: "fisherman", name: "Balıkçı", elixir: 3, rarity: "Epik", role: "Savunma", evolution: false },
  { id: "magicarcher", name: "Büyülü Okçu", elixir: 4, rarity: "Efsanevi", role: "Destek", evolution: false },
  { id: "motherwitch", name: "Ana Cadı", elixir: 4, rarity: "Epik", role: "Destek", evolution: false },
  { id: "phoenix", name: "Anka Kuşu", elixir: 4, rarity: "Efsanevi", role: "Destek", evolution: false },
  { id: "goblinmachine", name: "Goblin Makinesi", elixir: 5, rarity: "Efsanevi", role: "Hasar", evolution: false },
  { id: "spiritempress", name: "Ruh İmparatoriçesi", elixir: 6, rarity: "Efsanevi", role: "Destek", evolution: false },
  // NOT: Şampiyon (Champion) rarity'li kartlar (Mighty Miner, Skeleton King, Archer Queen,
  // Golden Knight, Monk, Little Prince, Goblinstein, Boss Bandit) burada DEĞİL —
  // onlar aşağıdaki ayrı CHAMPIONS dizisinde, "deste başına 1 şampiyon" mantığıyla yönetiliyor.

  // --- Binalar (Buildings) ---
  { id: "cannon", name: "Top", elixir: 3, rarity: "Ortak", role: "Bina", evolution: true },
  { id: "mortar", name: "Havan", elixir: 4, rarity: "Ortak", role: "Bina", evolution: true },
  { id: "tesla", name: "Tesla", elixir: 4, rarity: "Nadir", role: "Bina", evolution: true },
  { id: "goblinhut", name: "Goblin Kulübesi", elixir: 4, rarity: "Nadir", role: "Bina", evolution: false },
  { id: "infernotower", name: "Cehennem Kulesi", elixir: 5, rarity: "Nadir", role: "Bina", evolution: false },
  { id: "bombtower", name: "Bomba Kulesi", elixir: 4, rarity: "Nadir", role: "Bina", evolution: false },
  { id: "barbarianhut", name: "Barbar Kulübesi", elixir: 7, rarity: "Epik", role: "Bina", evolution: false },
  { id: "elixircollector", name: "İksir Toplayıcı", elixir: 6, rarity: "Nadir", role: "Bina", evolution: false },
  { id: "tombstone", name: "Mezar Taşı", elixir: 3, rarity: "Ortak", role: "Bina", evolution: false },
  { id: "furnace", name: "Ocak", elixir: 4, rarity: "Nadir", role: "Bina", evolution: true },
  { id: "goblincage", name: "Goblin Kafesi", elixir: 4, rarity: "Nadir", role: "Bina", evolution: true },
  { id: "xbow", name: "X-Yay", elixir: 6, rarity: "Epik", role: "Bina", evolution: false },
  { id: "goblindrill", name: "Goblin Matkabı", elixir: 4, rarity: "Epik", role: "Bina", evolution: true },

  // --- Büyüler (Spells) ---
  { id: "arrows", name: "Oklar", elixir: 3, rarity: "Ortak", role: "Büyü", evolution: false },
  { id: "zap", name: "Çarp", elixir: 2, rarity: "Ortak", role: "Büyü", evolution: true },
  { id: "giantsnowball", name: "Dev Kar Topu", elixir: 2, rarity: "Ortak", role: "Büyü", evolution: true },
  { id: "royaldelivery", name: "Kraliyet Teslimatı", elixir: 3, rarity: "Ortak", role: "Büyü", evolution: false },
  { id: "fireball", name: "Ateş Topu", elixir: 4, rarity: "Nadir", role: "Büyü", evolution: false },
  { id: "rocket", name: "Roket", elixir: 6, rarity: "Epik", role: "Büyü", evolution: false },
  { id: "earthquake", name: "Deprem", elixir: 3, rarity: "Nadir", role: "Büyü", evolution: false },
  { id: "rage", name: "Öfke", elixir: 2, rarity: "Epik", role: "Büyü", evolution: false },
  { id: "goblinbarrel", name: "Goblin Fıçısı", elixir: 3, rarity: "Epik", role: "Sürü", evolution: true },
  { id: "freeze", name: "Dondurma", elixir: 4, rarity: "Epik", role: "Büyü", evolution: false },
  { id: "mirror", name: "Ayna", elixir: 1, rarity: "Efsanevi", role: "Büyü", evolution: false },
  { id: "lightning", name: "Yıldırım", elixir: 6, rarity: "Efsanevi", role: "Büyü", evolution: false },
  { id: "poison", name: "Zehir", elixir: 4, rarity: "Epik", role: "Büyü", evolution: false },
  { id: "tornado", name: "Kasırga", elixir: 3, rarity: "Epik", role: "Büyü", evolution: false },
  { id: "clone", name: "Klon", elixir: 3, rarity: "Epik", role: "Büyü", evolution: false },
  { id: "barbarianbarrel", name: "Barbar Fıçısı", elixir: 2, rarity: "Nadir", role: "Büyü", evolution: false },
  { id: "void", name: "Boşluk", elixir: 3, rarity: "Epik", role: "Büyü", evolution: false },
  { id: "goblincurse", name: "Goblin Laneti", elixir: 2, rarity: "Epik", role: "Büyü", evolution: false },
  { id: "vines", name: "Sarmaşıklar", elixir: 3, rarity: "Nadir", role: "Büyü", evolution: false },
  { id: "graveyard", name: "Mezarlık", elixir: 5, rarity: "Efsanevi", role: "Büyü", evolution: false },
  { id: "thelog", name: "Tomruk", elixir: 2, rarity: "Efsanevi", role: "Büyü", evolution: false },
];

/* Şampiyonlar: deste başına en fazla 1 (Arena 18+ açılır) */
const CHAMPIONS = [
  { id: "archerqueen", name: "Okçu Kraliçe", elixir: 5, ability: "Gizlenme Pelerini — görünmez olur, atış hızı artar", tier: "S" },
  { id: "bossbandit", name: "Patron Haydut", elixir: 6, ability: "Şarj saldırısı ile yüksek alan hasarı", tier: "S" },
  { id: "mightyminer", name: "Güçlü Madenci", elixir: 4, ability: "Yer altına dalıp herhangi bir noktaya çıkar", tier: "A" },
  { id: "goldenknight", name: "Altın Şövalye", elixir: 4, ability: "Hamle saldırısı + sıçramalı çoklu vuruş", tier: "A" },
  { id: "skeletonking", name: "İskelet Kral", elixir: 4, ability: "Düşen birliklerden iskelet ordusu toplar", tier: "B" },
  { id: "monk", name: "Keşiş", elixir: 5, ability: "Gelen hasarı engeller ve geri yansıtır", tier: "A" },
  { id: "littleprince", name: "Küçük Prens", elixir: 3, ability: "Muhafızı ileri hamle ettirip düşmanı sersemletir", tier: "C" },
  { id: "goblinstein", name: "Goblinstein", elixir: 5, ability: "Devasa goblin bedeni + can/yenileme avantajı", tier: "B" },
];

/* Kahramanlar (Hero): mevcut kartları güçlendiren özel yetenekli versiyonlar — deste başına 1 */
const HEROES = [
  { id: "herogoblins", name: "Kahraman Goblinler", baseCard: "Goblinler", elixir: 2, ability: "Sürü temizleme + köprü baskısı", tier: "S" },
  { id: "heromagicarcher", name: "Kahraman Büyülü Okçu", baseCard: "Büyülü Okçu", elixir: 4, ability: "Ucuz, uzun menzilli delici hasar", tier: "S" },
  { id: "heromegaminion", name: "Kahraman Mega Minyon", baseCard: "Mega Dalkavuk", elixir: 3, ability: "Geliştirilmiş hava savunması ve menzil", tier: "S" },
  { id: "heroicegolem", name: "Kahraman Buz Golemi", baseCard: "Buz Golemi", elixir: 2, ability: "Öldüğünde donmuş alan + yavaşlatma", tier: "A" },
  { id: "heroknight", name: "Kahraman Şövalye", baseCard: "Şövalye", elixir: 3, ability: "Ekstra can ve kısa süreli zırh artışı", tier: "A" },
  { id: "herobarbarianbarrel", name: "Kahraman Barbar Fıçısı", baseCard: "Barbar Fıçısı", elixir: 2, ability: "Yuvarlanan fıçı + iniş anında alan hasarı", tier: "A" },
  { id: "heromusketeer", name: "Kahraman Silahşör", baseCard: "Silahşör", elixir: 4, ability: "Hafif menzil artışı, düşük genel etki", tier: "F" },
  { id: "herominipekka", name: "Kahraman Mini P.E.K.K.A", baseCard: "Mini P.E.K.K.A", elixir: 4, ability: "Şarj saldırısı küçük iyileştirme, zayıf kalıyor", tier: "F" },
];

const TIER_COLORS = { S: "#c9a227", A: "#3f7fc1", B: "#5a4a8a", C: "#5a6478", F: "#3a3e4d" };

/* ---------------- Deste Şablonları / Arketip Kütüphanesi ----------------
   Meta Desteler sekmesi AI tabanlı ve değişken; bu liste ise sabit,
   küratörlü, bilinen arketipleri temsil eden başlangıç desteleridir. */
const DECK_TEMPLATES = [
  {
    id: "hog-cycle",
    name: "Domuz Binicisi Döngüsü",
    level: "Orta Seviye",
    description: "Düşük elixir ortalamasıyla hızlı döngü kurup Domuz Binicisi ile köprü baskısı yapar.",
    cardIds: ["hogrider", "icespirit", "skeletons", "musketeer", "cannon", "fireball", "thelog", "icegolem"],
  },
  {
    id: "golem-beatdown",
    name: "Golem Beatdown",
    level: "İleri Seviye",
    description: "Golem'i tank olarak öne sürüp arkasından ağır hasar veren birliklerle yıkıcı bir push kurar.",
    cardIds: ["golem", "babydragon", "megaminion", "nightwitch", "lumberjack", "barbarianbarrel", "lightning", "electrowizard"],
  },
  {
    id: "beginner-balanced",
    name: "Dengeli Başlangıç",
    level: "Başlangıç",
    description: "Tank, destek, sürü temizleme ve büyü dengesiyle her duruma uyum sağlayan basit bir deste.",
    cardIds: ["knight", "archers", "minions", "musketeer", "fireball", "arrows", "cannon", "skeletons"],
  },
  {
    id: "lava-loon",
    name: "Lav Tazısı + Balon",
    level: "İleri Seviye",
    description: "Hava saldırısına dayanan klasik bir beatdown arketipi, kule baskısı çok yüksektir.",
    cardIds: ["lavahound", "balloon", "megaminion", "tombstone", "barbarianbarrel", "zap", "skeletons", "infernodragon"],
  },
  {
    id: "miner-control",
    name: "Madenci Kontrol",
    level: "Orta Seviye",
    description: "Madenci ile sürekli küçük hasar verirken büyülerle rakibin push'larını kontrol altında tutar.",
    cardIds: ["miner", "poison", "valkyrie", "musketeer", "tombstone", "thelog", "skeletons", "icegolem"],
  },
  {
    id: "xbow-siege",
    name: "X-Yay Kuşatma",
    level: "İleri Seviye",
    description: "X-Yay'ı güvenli şekilde kurup uzaktan kuleye sürekli hasar veren teknik bir kuşatma destesi.",
    cardIds: ["xbow", "tesla", "icespirit", "skeletons", "thelog", "icegolem", "archers", "fireball"],
  },
];

/* ---------------- Deste Paylaşım Kodu ----------------
   Deste, URL'e sığacak kısa bir koda sıkıştırılır (kart id'leri + şampiyon/kahraman + seviyeler). */
function encodeDeck({ cardIds, championId, heroId, levels }) {
  const payload = { c: cardIds, ch: championId, h: heroId, l: levels };
  try {
    return btoa(encodeURIComponent(JSON.stringify(payload)));
  } catch {
    return "";
  }
}

function decodeDeck(code) {
  try {
    const payload = JSON.parse(decodeURIComponent(atob(code)));
    return { cardIds: payload.c || [], championId: payload.ch || null, heroId: payload.h || null, levels: payload.l || {} };
  } catch {
    return null;
  }
}

/* Kullanıcı tam linki veya sadece kodu yapıştırabilir — ikisini de kabul et */
function extractDeckCodeFromInput(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return url.searchParams.get("deste");
  } catch {
    return trimmed; // URL değilse, doğrudan kod olarak dene
  }
}

/* ---------------- Rastgele Dengeli Deste Oluşturucu ----------------
   Her çağrıda farklı bir "arketip iskeleti" seçilir (sadece tek bir sabit
   şablon yerine), böylece art arda basıldığında hep benzer desteler çıkmaz. */
function generateRandomDeck() {
  const byRole = (...roles) => CARDS.filter((c) => roles.includes(c.role));
  const pickOne = (pool, exclude) => {
    const filtered = pool.filter((c) => !exclude.includes(c.id));
    if (filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
  };
  const pickMany = (pool, exclude, count) => {
    const filtered = pool.filter((c) => !exclude.includes(c.id));
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  };

  // Birden çok olası deste "iskeleti" — her çağrıda rastgele biri seçilir,
  // böylece desteler farklı arketiplere (ağır tank, hızlı baskı, döngü vb.) düşer.
  const skeletons = [
    { tank: ["Tank"], support: 2, swarm: 1, spell: 2, building: 1, fast: 1 },
    { tank: ["Tank-Mini"], support: 2, swarm: 2, spell: 2, building: 1, fast: 0 },
    { tank: ["Tank", "Tank-Mini"], support: 1, swarm: 1, spell: 2, building: 1, fast: 2 },
    { tank: ["Hızlı"], support: 2, swarm: 2, spell: 2, building: 1, fast: 0 }, // hızlı kart win-condition olur
    { tank: ["Tank"], support: 3, swarm: 0, spell: 2, building: 1, fast: 1 },
  ];
  const skeleton = skeletons[Math.floor(Math.random() * skeletons.length)];

  const picked = [];
  const tryAdd = (card) => { if (card && picked.length < 8 && !picked.some((p) => p.id === card.id)) picked.push(card); };
  const tryAddMany = (cards) => cards.forEach(tryAdd);

  tryAdd(pickOne(byRole(...skeleton.tank), []));
  tryAddMany(pickMany(byRole("Büyü"), picked.map((p) => p.id), skeleton.spell));
  tryAddMany(pickMany(byRole("Sürü"), picked.map((p) => p.id), skeleton.swarm));
  tryAddMany(pickMany(byRole("Bina"), picked.map((p) => p.id), skeleton.building));
  tryAddMany(pickMany(byRole("Hızlı"), picked.map((p) => p.id), skeleton.fast));
  tryAddMany(pickMany(byRole("Destek", "Hasar", "Savunma"), picked.map((p) => p.id), skeleton.support));

  // Kalan boşlukları herhangi bir rolden rastgele doldur
  while (picked.length < 8) {
    const card = pickOne(CARDS, picked.map((p) => p.id));
    if (!card) break;
    tryAdd(card);
  }
  return picked.map((c) => c.id);
}

/* ---------------- Kart Detay Verisi (sadeleştirilmiş istatistikler) ----------------
   Gerçek sitede bu liste resmi API + topluluk istatistik kaynaklarından (RoyaleAPI vb.) çekilir. */
const CARD_STATS = {
  knight: { hp: 1908, damage: 221, hitSpeed: "1.2s", target: "Yer", counters: ["Mini P.E.K.K.A", "Valkür", "İskeletler"], counteredBy: ["Ateş Topu", "Domuz Binicisi", "Büyücü"] },
  archers: { hp: 252, damage: 119, hitSpeed: "1.1s", target: "Yer & Hava", counters: ["Goblin Fıçısı", "İskeletler"], counteredBy: ["Çarpma", "Oklar", "Top"] },
  giant: { hp: 3275, damage: 211, hitSpeed: "1.5s", target: "Sadece Bina", counters: ["Çıplak tank desteği"], counteredBy: ["İskelet Ordusu", "Mini P.E.K.K.A", "Tesla"] },
  musketeer: { hp: 386, damage: 200, hitSpeed: "1.1s", target: "Yer & Hava", counters: ["Yavru Ejderha", "Balon"], counteredBy: ["Ateş Topu", "Goblin Fıçısı"] },
  minipekka: { hp: 894, damage: 612, hitSpeed: "1.8s", target: "Yer", counters: ["Dev", "P.E.K.K.A"], counteredBy: ["İskeletler", "Minyonlar", "Sürü kartları"] },
  skeletons: { hp: 81, damage: 81, hitSpeed: "1.0s", target: "Yer", counters: ["Mini P.E.K.K.A", "Dev İskelet bedeli"], counteredBy: ["Oklar", "Top", "Çarpma"] },
  hogrider: { hp: 1696, damage: 264, hitSpeed: "1.6s", target: "Sadece Bina", counters: ["Hızlı kule baskısı"], counteredBy: ["Tesla", "Top", "İskeletler"] },
  babydragon: { hp: 1163, damage: 178, hitSpeed: "1.3s", target: "Yer & Hava", counters: ["Sürü kartları", "Goblin Fıçısı"], counteredBy: ["Mega Minyon", "Okçular"] },
  valkyrie: { hp: 1908, damage: 245, hitSpeed: "1.1s", target: "Yer (360°)", counters: ["Sürü kartları", "İskeletler"], counteredBy: ["Mini P.E.K.K.A", "Dev"] },
  fireball: { hp: null, damage: 572, hitSpeed: "Anlık", target: "Alan", counters: ["Orta sağlıklı sürüler", "Büyücü"], counteredBy: ["—"] },
  zap: { hp: null, damage: 159, hitSpeed: "Anlık", target: "Alan (sersemletir)", counters: ["İskeletler", "Minyon Sürüsü"], counteredBy: ["—"] },
  cannon: { hp: 742, damage: 199, hitSpeed: "0.8s", target: "Sadece Yer", counters: ["Domuz Binicisi", "Hızlı kartlar"], counteredBy: ["Ateş Topu", "Hava birlikleri"] },
  tesla: { hp: 1071, damage: 209, hitSpeed: "0.9s", target: "Yer & Hava", counters: ["Dev", "Domuz Binicisi"], counteredBy: ["Ateş Topu", "Yer altı kartları"] },
  balloon: { hp: 1532, damage: 636, hitSpeed: "1.8s", target: "Sadece Bina", counters: ["Korumasız kule"], counteredBy: ["Mega Minyon", "Tesla", "Okçular"] },
  wizard: { hp: 593, damage: 184, hitSpeed: "1.1s", target: "Yer & Hava (Alan)", counters: ["Sürü kartları"], counteredBy: ["Ateş Topu", "Domuz Binicisi"] },
  minions: { hp: 304, damage: 167, hitSpeed: "1.0s", target: "Yer & Hava", counters: ["Tank takviyesi"], counteredBy: ["Çarpma", "Oklar"] },
  goblinbarrel: { hp: 199, damage: 79, hitSpeed: "1.1s", target: "Yer", counters: ["Korumasız kule"], counteredBy: ["Çarpma", "Oklar", "Tesla"] },
  rocket: { hp: null, damage: 700, hitSpeed: "Anlık", target: "Alan", counters: ["Tek hedefli yüksek değer"], counteredBy: ["—"] },
  icespirit: { hp: 92, damage: 60, hitSpeed: "Anlık", target: "Yer & Hava (yavaşlatır)", counters: ["Domuz Binicisi savunması"], counteredBy: ["Oklar", "Çarpma"] },
  royalghost: { hp: 968, damage: 204, hitSpeed: "1.5s", target: "Yer & Hava", counters: ["Sürü kartları"], counteredBy: ["Top", "Ateş Topu"] },
  lumberjack: { hp: 932, damage: 219, hitSpeed: "1.1s", target: "Yer", counters: ["Hızlı kule baskısı"], counteredBy: ["İskeletler", "Mini P.E.K.K.A"] },
  elitebarbs: { hp: 1442, damage: 318, hitSpeed: "1.2s", target: "Yer", counters: ["Zayıf savunma"], counteredBy: ["Valkür", "Ateş Topu", "Büyücü"] },
  megaminion: { hp: 626, damage: 222, hitSpeed: "1.3s", target: "Yer & Hava", counters: ["Yavru Ejderha", "Balon"], counteredBy: ["Top", "Oklar"] },
  pekka: { hp: 3623, damage: 758, hitSpeed: "1.8s", target: "Yer", counters: ["Dev", "Mega Şövalye"], counteredBy: ["İskelet Ordusu", "İnferno kartları"] },
};

/* ---------------- Kart Sinerjisi Haritası ----------------
   Bilinen, yaygın kabul görmüş kart çiftleri ve neden birlikte iyi gittikleri.
   Anahtar sırası önemli değildir; her çift iki id'nin alfabetik birleşimiyle saklanır. */
const synergyKey = (a, b) => [a, b].sort().join("|");
const CARD_SYNERGIES = {
  [synergyKey("goblinbarrel", "skeletonarmy")]: "İkisi de kuleye sürpriz, ucuz alan hasarı verir; rakip büyüsünü ikisine birden kullanmak zorunda kalır.",
  [synergyKey("hogrider", "icespirit")]: "Buz Ruhu, Domuz Binicisi'nin önünü kısa süreliğine açar ve rakip birliği yavaşlatır.",
  [synergyKey("hogrider", "musketeer")]: "Silahşör, Domuz Binicisi'ne hava/yer desteği sağlarken kendi de korunur.",
  [synergyKey("golem", "nightwitch")]: "Gece Cadısı'nın yarasaları Golem'in arkasında hava savunmasını ve hasarı tamamlar.",
  [synergyKey("golem", "babydragon")]: "Yavru Ejderha, Golem push'unun arkasında hava birliklerini ve sürüleri temizler.",
  [synergyKey("lavahound", "balloon")]: "Lav Tazısı havadaki dikkatleri çekerken Balon kuleye yüksek hasar indirir.",
  [synergyKey("miner", "poison")]: "Madenci sürekli baskı yaparken Zehir, rakibin destek birliklerini ve toplayıcıları eritir.",
  [synergyKey("xbow", "tesla")]: "Tesla, X-Yay'ı yer birliklerine karşı korurken X-Yay güvenle kuleye hasar verir.",
  [synergyKey("threemusketeers", "royalgiant")]: "Kraliyet Devi tank görevi görürken Üç Silahşörler arkadan yüksek hasar sağlar.",
  [synergyKey("graveyard", "freeze")]: "Dondurma rakip savunmasını dururken Mezarlık kuleye iskelet yağdırır.",
  [synergyKey("sparky", "icegolem")]: "Buz Golemi, Sparky'nin şarj süresini kazanması için zaman kazandırır.",
  [synergyKey("pekka", "battleram")]: "Koç Başı rakibi sersemletip P.E.K.K.A'nın güvenle ilerlemesini sağlar.",
  [synergyKey("electrowizard", "hogrider")]: "Elektro Büyücü, Domuz Binicisi'nin önündeki küçük birlikleri sersemletir.",
  [synergyKey("balloon", "lumberjack")]: "Oduncu'nun cinneti, Balon'un kuleye ulaşma hızını ve hasarını artırır.",
  [synergyKey("megaknight", "goblinbarrel")]: "Mega Şövalye'nin iniş hasarı sürüleri temizlerken Goblin Fıçısı ek baskı kurar.",
  [synergyKey("royalghost", "musketeer")]: "Kraliyet Hayaleti gizlice yaklaşırken Silahşör menzilden destek sağlar.",
  [synergyKey("giant", "witch")]: "Dev tank görevi görürken Cadı'nın iskeletleri ve büyüsü destek sağlar.",
  [synergyKey("goblingiant", "ramrider")]: "Goblin Devi tank olurken Koç Binicisi ek yan baskı kurar.",
  [synergyKey("furnace", "barbarianbarrel")]: "Ocak sürekli ateş ruhu üretirken Barbar Fıçısı savunma kalkanı sağlar.",
};

function getDeckSynergies(cardIds) {
  const found = [];
  for (let i = 0; i < cardIds.length; i++) {
    for (let j = i + 1; j < cardIds.length; j++) {
      const key = synergyKey(cardIds[i], cardIds[j]);
      if (CARD_SYNERGIES[key]) {
        found.push({ a: cardIds[i], b: cardIds[j], note: CARD_SYNERGIES[key] });
      }
    }
  }
  return found;
}

/* ---------------- Telifsiz Rozet İkonu (CSS/SVG, gerçek sanat değil) ----------------
   Her rol için özgün, basit bir sembol kullanılır (gerçek oyun sanatı değildir).
   Bu sayede kartlar görsel olarak ayırt edilebilir ama hiçbir Supercell
   görseli kopyalanmaz/kullanılmaz. */
const ROLE_GLYPHS = {
  Tank: "M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z", // kalkan
  "Tank-Mini": "M12 3l6 3v5c0 4-2.5 6.8-6 8-3.5-1.2-6-4-6-8V6l6-3z", // küçük kalkan
  Destek: "M12 2l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1.5L12 2z", // yıldız (okçu/destek)
  Sürü: "M5 18c0-3 1.5-5 3-6-1-2-1-4 0-6 2 1 3 3 3 5 0-2 1-4 3-5 1 2 1 4 0 6 1.5 1 3 3 3 6H5z", // çoklu tepe (sürü)
  Hasar: "M12 2l3 6 6 1-4.5 4.5L17.5 20 12 17l-5.5 3 1-6.5L3 9l6-1 3-6z", // yıldırım/patlama
  Bina: "M5 21V10l7-6 7 6v11H5zm3-3h2v-5H8v5zm6 0h2v-5h-2v5z", // kule
  Büyü: "M12 2v4M12 18v4M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M18.4 18.4l1.4 1.4M18.4 5.6l1.4-1.4M5.6 18.4l-1.4 1.4M12 7a5 5 0 100 10 5 5 0 000-10z", // büyü yıldızı
  Savunma: "M12 2l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5l8-3zm0 4l-4 1.6v3.4c0 2.6 1.7 4.6 4 5.6 2.3-1 4-3 4-5.6V7.6L12 6z", // çift katlı kalkan
  Hızlı: "M13 2 4 14h6l-1 8 9-12h-6l1-8z", // şimşek
};

/* ---------------- Karta Özel İkonlar ----------------
   Her kart için kendine özgü, basit geometrik bir siluet (gerçek oyun
   sanatı DEĞİLDİR — elle çizilmiş, tek-path/çok-path basit SVG şekiller).
   CrestIcon önce buraya bakar; burada yoksa role-bazlı sembole düşer. */
const CARD_GLYPHS = {
  // --- Birlikler: yakın dövüş / tank tarzı ---
  knight: ["M12 3l5 2v5c0 4-2 7-5 9-3-2-5-5-5-9V5l5-2z"], // tek kalkan
  minipekka: ["M12 3l5 2v5c0 4-2 7-5 9-3-2-5-5-5-9V5l5-2zM9 11l3 3 5-6"], // kalkan + çapraz kılıç vuruşu
  pekka: ["M7 4h10v5l-2 2v3l3 9H6l3-9v-3L7 9z"], // büyük, kalın gövde bloğu
  megaknight: ["M7 4h10v5l-2 2v3l3 9H6l3-9v-3L7 9zM9 6h6"], // pekka gövdesi + omuz çizgisi
  valkyrie: ["M12 3l4 4-4 4-4-4z M6 13h12l-2 8H8z"], // elmas baş + geniş gövde
  darkprince: ["M12 3l4 4-4 4-4-4zM6 13h12v8H6z M12 9v4"], // elmas baş + dikdörtgen kalkan
  prince: ["M5 12h14l-3 9H8z M9 12V8a3 3 0 116 0v4"], // mızrak ucu kalkan + miğfer kemeri
  miner: ["M9 5h6l-1 4 2 2-2 2v9H10v-9l-2-2 2-2z"], // kazma şekli (delikli baret silueti)
  battlehealer: ["M12 4l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V7z M9 11h6M12 8v6"], // kalkan + artı
  goldenknight: ["M12 3l5 2v5c0 4-2 7-5 9-3-2-5-5-5-9V5l5-2zM9 11l6 0"], // kalkan + tek çizgi (dash)
  bandit: ["M5 9l7-5 7 5-2 11H7z M9 9h6"], // maske/kapüşonlu yüz üçgeni
  royalghost: ["M12 4c-3 0-5 4-5 8 0 4 2 7 5 7s5-3 5-7c0-4-2-8-5-8zM9 11h1m4 0h1"], // damla şeklinde hayalet
  bowler: ["M12 5a5 5 0 100 10 5 5 0 000-10zM9 16l-2 5h10l-2-5z"], // büyük top + kaide
  monk: ["M12 4a4 4 0 100 8 4 4 0 000-8zM8 12h8l-1 8H9z"], // yuvarlak baş + geniş cübbe
  skeletonking: ["M9 4a2 2 0 114 0 1 1 0 002 0 2 2 0 114 0L18 6h-2l-1 2H9L8 6H6z M9 9h6l1 11H8z"], // taç dişli kafatası
  archerqueen: ["M8 3l4-2 4 2-1 3H9z M7 6h10l-2 15H9z"], // taç + uzun cübbe

  // --- Birlikler: küçük/sürü ---
  skeletons: ["M9 6a3 3 0 116 0 3 3 0 11-6 0zM9 11h1m4 0h1M10 11l2 9 2-9"], // tekil kafatası
  skeletonarmy: ["M7 6a2 2 0 114 0 2 2 0 11-4 0zM13 6a2 2 0 114 0 2 2 0 11-4 0zM7 11l2 8M9 11l2 8M13 11l2 8M15 11l2 8"], // 2 kafatası + bacaklar (sürü hissi)
  guards: ["M7 5a2 2 0 114 0 2 2 0 11-4 0zM13 5a2 2 0 114 0 2 2 0 11-4 0zM5 10h6v9H5zM13 10h6v9h-6z"], // 2 kalkanlı kafa
  goblins: ["M12 4a2.5 2.5 0 110 5 2.5 2.5 0 110-5zM9 11h6l-1 9H10z"], // basit küçük kafa + dar gövde
  goblingang: ["M8 5a2 2 0 114 0 2 2 0 11-4 0zM16 5a2 2 0 114 0 2 2 0 11-4 0zM6 10h6l-1 9H7zM14 10h6l-1 9h-5z"], // 2 küçük kafa+gövde
  speargoblins: ["M12 4a2.5 2.5 0 110 5 2.5 2.5 0 110-5zM9 11h6l-1 9H10z M4 9l16 2"], // küçük kafa + yatay mızrak çizgisi
  dartgoblin: ["M12 4a2.5 2.5 0 110 5 2.5 2.5 0 110-5zM9 11h6l-1 9H10z M16 9l5-2-3 5"], // küçük kafa + dart ucu
  rascals: ["M7 6a1.8 1.8 0 113.6 0 1.8 1.8 0 11-3.6 0zM17 6a1.8 1.8 0 113.6 0 1.8 1.8 0 11-3.6 0zM12 9a2 2 0 110 4 2 2 0 010-4zM5 11l4 2 1 7H7zM19 11l-4 2-1 7h3zM10 13h4l1 8h-6z"], // 3 küçük kafa üçgen yerleşim
  minions: ["M9 5l3-2 3 2-1 4h-4z M7 9l5 9 5-9"], // kanat şekli + V gövde
  megaminion: ["M8 4l4-2 4 2-1 5h-6z M6 9l6 11 6-11"], // büyük versiyon, geniş kanat
  minionhorde: ["M7 5l2-2 2 2-1 3H8zM15 5l2-2 2 2-1 3h-3zM11 8l1-2 1 2-1 2zM5 8l4 8 3-6 3 6 4-8"], // 3 kanat ucu + dağınık V
  bats: ["M3 10c2-3 5-3 6-1 1-2 4-2 6 0 1-2 4-2 6 1-2 1-4 0-5 1-1 1-3 1-4-1-1 2-3 2-4 1-1-1-3 0-5-1z"], // tek yarasa kanadı çizgisi (geniş)
  suspiciousbush: ["M6 17a6 6 0 1112 0z M5 17h14"], // tepe yarım daire (çalı)
  electrospirit: ["M13 2 6 13h5l-1 9 8-12h-5l1-8z"], // şimşek (ruh formu, ince)
  icespirit: ["M12 3v18M5 8l14 8M19 8 5 16"], // kar tanesi çizgileri (X+|)
  firespirit: ["M12 3c2 4 3 5 3 8a3 3 0 11-6 0c0-3 1-4 3-8z"], // tek alev damlası
  healspirit: ["M12 3v18M5 8l14 8M19 8 5 16 M9 12h6m-3-3v6"], // kar tanesi + artı
  berserker: ["M9 4l3-2 3 2-2 3H11z M7 9h10l-2 11H9z"], // boynuzlu kask + gövde
  royalrecruits: ["M5 19l7-15 7 15z M5 19h14"], // kalkan duvarı (üçgen+taban çizgisi)
  elitebarbs: ["M9 4l3-2 3 2-1 3h-4zM6 9h12l-2 11H8z M6 14l12 0"], // miğfer+gövde+kemer
  barbarians: ["M9 4l3-2 3 2-1 3h-4zM6 9h12l-2 11H8z"], // aynı aile, kemersiz
  battleram: ["M4 12h9l4-3-1 7-3-1H4z M8 8l2 4M14 8l-1 4"], // koçbaşı gövdesi
  ramrider: ["M4 12h9l4-3-1 7-3-1H4zM8 8l2 4M14 8l-1 4 M11 5l1 3"], // koçbaşı + binici çizgisi
  royalhogs: ["M5 14a3 3 0 116 0 3 3 0 11-6 0zM13 14a3 3 0 116 0 3 3 0 11-6 0zM7 11l-1-2M15 11l1-2"], // 2 yuvarlak domuz gövdesi
  hogrider: ["M5 14a4 4 0 118 0 4 4 0 11-8 0zM7 11l-1-3 M12 12l8-4-2 6"], // domuz gövdesi + mızrak
  goblindemolisher: ["M12 4a2.5 2.5 0 110 5 2.5 2.5 0 110-5zM9 11h6l-1 9H10z M16 14a2 2 0 104 0 2 2 0 10-4 0"], // küçük kafa + bomba dairesi
  bomber: ["M9 4a3 3 0 116 0c0 2-1 3-3 3s-3-1-3-3zM12 9v3l-5 8h10l-5-8z M6 4l1 2-2 1"], // küçük kafa + bomba gövde + fünye
  skeletonbarrel: ["M5 11h14l-2 9H7z M8 8h8v3H8z M9 18l1-1m4 1-1-1"], // fıçı + kemik çizgisi
  firecracker: ["M9 5h6l-1 9h-4z M9 14h6 M12 3l-1 2 1 1 1-1z"], // havai fişek silindiri + fünye
  skeletondragons: ["M5 9a2.5 2.5 0 115 0 2.5 2.5 0 11-5 0zM14 9a2.5 2.5 0 115 0 2.5 2.5 0 11-5 0zM6 12h3l1 8H7zM15 12h3l1 8h-3z"], // 2 küçük kafatası gövde
  threemusketeers: ["M5 12h4M10 12h4M15 12h4M6 9l1-2M11 9l1-2M16 9l1-2"], // 3 namlu çizgisi
  icegolem: ["M9 5h6l1 5-2 2v3l3 8H7l3-8v-3l-2-2z M10 9h4"], // buz blok gövde + çizgi
  balloon: ["M8 3a4 4 0 118 0c0 3-1 5-4 6-3-1-4-3-4-6z M10 13h4l1 6-3 2-3-2z"], // balon üst + sepet
  cannoncart: ["M5 16h6v3H5zM9 12l9-3v8l-9-3z M17 9l3-1v6l-3-1"], // top + araba tekerleği
  lumberjack: ["M9 5h6l-1 3 4 2-4 2 1 3H9l1-3-4-2 4-2z M11 15h2v6h-2z"], // balta + sap
  goblinmachine: ["M6 6h12v7l-3 2v3l4 6H5l4-6v-3l-3-2z M9 8h6"], // büyük kabin makinesi
  spiritempress: ["M12 3v18M4 8l16 8M20 8 4 16 M12 9a3 3 0 100 6 3 3 0 000-6"], // büyük kar tanesi + merkez halka
  wallbreakers: ["M6 7h12v5H6zM6 12h12l-1 9H7z"], // duvar bloğu üstte+kütük altta

  // --- Birlikler: uzaktan / destek ---
  archers: ["M5 4l14 16M5 20 19 4 M9 8l3 3-3 3"], // yay gergi çizgisi (X + ok ucu)
  magicarcher: ["M5 4l14 16M5 20 19 4 M12 10l2 2-2 2"], // aynı kompozisyon, ışıltı
  princess: ["M9 3l3-2 3 2-1 3H10z M7 6h10v3l-2 13h-6L7 9z"], // taç + uzun kule elbisesi
  musketeer: ["M4 12h16M11 8l2 4-2 4"], // namlu çizgisi + nişan üçgeni
  flyingmachine: ["M5 11h14l-3 4H8z M9 11V7h6v4"], // uçan kutu+pervane çizgisi
  zappies: ["M6 6h12v8H6zM9 14v3m6-3v3 M10 9l2 2 2-2"], // robot kutu + şimşek
  icewizard: ["M12 3l4 6h-2v3l4 10H7l4-10V8H9z M9 17l1 1m4-1-1 1"], // sivri şapka konisi + buz parçası
  wizard: ["M12 3l4 6h-2v3l4 10H7l4-10V8H9z"], // sivri şapka konisi (saf)
  electrowizard: ["M12 3l4 6h-2v3l4 10H7l4-10V8H9z M5 16 19 8"], // sivri şapka + şimşek çizgisi
  fisherman: ["M12 3v13 M5 6l14 2 M8 16a4 4 0 108 0"], // olta çubuğu + kanca
  motherwitch: ["M12 3l4 6h-2v3l4 10H7l4-10V8H9z M6 16l2-2"], // şapka + kuş kanadı çizgisi
  nightwitch: ["M12 3l4 6h-2v3l4 10H7l4-10V8H9z M17 14l3-2-1 4"], // şapka + farklı kanat açısı
  witch: ["M12 3l4 6h-2v3l4 10H7l4-10V8H9z M6 14a2 2 0 104 0 2 2 0 10-4 0"], // şapka + iksir kazanı dairesi
  hunter: ["M5 12h14M7 8l10 8M17 8 7 16"], // av tüfeği namlusu + saçma yelpazesi
  executioner: ["M7 5h10l-2 3 4 2-4 2 2 3H7l2-3-4-2 4-2zM11 15h2v6h-2z"], // dönen balta
  babydragon: ["M6 9c2-4 10-4 12 0-2 1-4 0-6 2-2-2-4-1-6-2z M12 11v8"], // kanat açıklığı + kuyruk
  electrodragon: ["M6 9c2-4 10-4 12 0-2 1-4 0-6 2-2-2-4-1-6-2z M9 17l3-6 3 6"], // kanat + şimşek gövde
  infernodragon: ["M6 9c2-4 10-4 12 0-2 1-4 0-6 2-2-2-4-1-6-2z M10 17h4l-1 3h-2z"], // kanat + ışın hüzmesi
  lavahound: ["M5 9a7 7 0 1114 0c0 4-3 7-7 9-4-2-7-5-7-9z M9 17l3-3 3 3"], // büyük yuvarlak kafa + kanat
  phoenix: ["M12 2c4 2 5 6 5 10s-1 8-5 10c-4-2-5-6-5-10s1-8 5-10z M8 11l4 2 4-2"], // alev damlası + kanat çizgisi
  sparky: ["M7 4h10v6l-2 1v3l4 9H5l4-9v-3L7 10z M9 16l2-3 2 1-2 3z"], // büyük top namlusu + şimşek
  electrogiant: ["M7 4h10l1 6-2 2v4l4 8H4l4-8v-4L8 10z M10 15l1-2 2 1-1 2z"], // dev gövde + şimşek
  rungiant: ["M7 4h10l1 6-2 2v4l4 8H4l4-8v-4L8 10z M6 20l2-3m10 3-2-3"], // dev gövde + koşu çizgileri
  golem: ["M6 4h12l1 7-3 3v4l3 7H5l3-7v-4L5 11z"], // büyük kaya bloğu
  giant: ["M9 3l3-2 3 2v4l-2 1v3l4 12H7l4-12V8L9 7z"], // tek kafa + büyük gövde
  goblingiant: ["M9 3l3-2 3 2v4l-2 1v3l4 12H7l4-12V8L9 7z M9 6l3 0"], // dev + alt çizgi
  giantskeleton: ["M9 4a2.5 2.5 0 115 0 2.5 2.5 0 11-5 0zM6 10h12l-1 11H7z M6 15a2 2 0 104 0"], // kafatası + bomba
  royalgiant: ["M9 3l3-2 3 2v4l-2 1v3l4 12H7l4-12V8L9 7z M5 12l2 0m10 0 2 0"], // dev + top namlusu kolu
  elixirgolem: ["M9 5a3 3 0 116 0c0 2-1 3-3 3s-3-1-3-3zM7 9h10l1 11H6z"], // damla baş + blok gövde

  // --- Bina ---
  cannon: ["M5 17h7v4H5zM9 13l9-2v8l-9-2z"], // taban + namlu
  mortar: ["M5 19h14v3H5zM8 17h8l2-8H6z"], // havan ağzı (geniş huni)
  tesla: ["M7 20v-7a5 5 0 0110 0v7M9 9l1-3M15 9l-1-3M12 4v3"], // direk + 2 anten
  goblinhut: ["M4 20V11l8-7 8 7v9z M12 11v9"], // basit kulübe üçgen çatı
  barbarianhut: ["M4 20V11l8-7 8 7v9z M8 14l4-2 4 2"], // kulübe + kalkan çizgisi
  infernotower: ["M6 21V9l6-5 6 5v12z M9 14h6 M12 9v5"], // kule + ışın çizgisi
  bombtower: ["M6 21V9l6-5 6 5v12z M12 11a2 2 0 104 0 2 2 0 10-4 0"], // kule + bomba dairesi
  elixircollector: ["M8 4h8l-1 7-3 3-3-3zM7 14h10l1 7H6z"], // huni + toplama kabı
  tombstone: ["M7 21V10a5 5 0 1110 0v11z M11 13h2v4h-2z"], // mezar taşı kemeri + haç
  furnace: ["M5 21V12l7-7 7 7v9z M9 18l3-6 3 6"], // ocak üçgeni + alev
  goblincage: ["M5 7h14v14H5z M8 7V4h8v3 M5 14h14"], // kafes kutusu + üst kilit
  xbow: ["M3 14h18M5 9l6 5M19 9l-6 5 M9 14v7h6v-7"], // X şekli + namlu kutusu
  goblindrill: ["M6 8h12v11H6z M9 8V5h6v3 M6 13h12"], // matkap silindiri

  // --- Büyüler ---
  arrows: ["M4 6l8 14 8-14M12 3v14"], // 3 ok yelpazesi
  zap: ["M14 2 5 13h6l-1 9 9-12h-6l1-8z"], // tek büyük şimşek
  giantsnowball: ["M12 5a7 7 0 100 14 7 7 0 000-14zM8 9l1 1m6-1-1 1m-5 5 1 1m4-1-1 1"], // büyük kar topu dairesi
  royaldelivery: ["M5 9h14l-1 11H6z M8 9l1-5h6l1 5 M11 4h2"], // hediye kutusu + kurdele
  fireball: ["M12 2c3 4 6 6 6 11a6 6 0 11-12 0c0-5 3-7 6-11z"], // tek büyük ateş damlası
  rocket: ["M12 2c4 3 5 8 5 12l-5 5-5-5c0-4 1-9 5-12zM9 16l-2 3m10-3 2 3"], // roket gövdesi + alev
  earthquake: ["M2 16h20M5 16l3-5 3 5 3-7 3 7 3-4 2 4"], // zikzak yer çizgisi
  rage: ["M12 2v20M2 12h20M5 5l14 14M19 5 5 19"], // 8 yönlü patlama yıldızı
  goblinbarrel: ["M5 9h14l-2 12H7z M8 6h8v3H8z"], // fıçı gövdesi + üst bant
  barbarianbarrel: ["M5 9h14l-2 12H7z M8 6h8v3H8z M12 3l-1 2 1 2 1-2z"], // fıçı + üstünde miğfer tüyü
  freeze: ["M12 2v20M3 7l18 10M21 7 3 17M12 8a4 4 0 100 8 4 4 0 000-8z"], // kar tanesi (6 kollu, dairesiz değil)
  mirror: ["M4 4h7v16H4zM13 4h7v16h-7z"], // 2 eşit dikdörtgen
  lightning: ["M14 1 4 14h7l-1 9 11-13h-7l1-9z"], // büyük tek şimşek (zap'tan biraz farklı açı)
  poison: ["M9 4a3 3 0 116 0c0 1-1 2-1 2v3h-4V6s-1-1-1-2zM7 10h10l1 11H6z"], // zehir şişesi + gaz bulutu tabanı
  tornado: ["M3 6c5-2 13-2 18 0M5 11c4-1.5 9-1.5 14 0M7 16c3-1 6-1 9 0M9 21c2-0.5 3-0.5 5 0"], // 4 katmanlı dönen çizgi
  clone: ["M5 4h6v8H5zM13 4h6v8h-6zM9 12h6v8H9z"], // 3 eşit kare (üçgen yerleşim)
  void: ["M12 3a9 9 0 100 18 9 9 0 000-18zM12 8a4 4 0 100 8 4 4 0 000-8z"], // çift halka (boşluk hissi)
  goblincurse: ["M12 4a2.5 2.5 0 110 5 2.5 2.5 0 110-5zM9 11h6l1 10H8z M11 16l1 2 1-2"], // küçük kafa + lanet işareti
  vines: ["M6 21c-1-7 1-13 6-18 5 5 7 11 6 18M7 14l3-1M17 14l-3-1M8 18l3-1M16 18l-3-1"], // sarmaşık gövdesi + yapraklar
  graveyard: ["M4 21V13a4 4 0 118 0v8zM12 21V13a4 4 0 118 0v8z"], // 2 mezar taşı yan yana
  thelog: ["M3 12a4 4 0 108 0 4 4 0 10-8 0zM13 12a4 4 0 108 0 4 4 0 10-8 0z M3 8h18M3 16h18"], // kütük + üst/alt çizgi (kabuk)

  // --- Şampiyonlar ---
  mightyminer: ["M9 5h6l-1 4 2 2-2 2v9H10v-9l-2-2 2-2z M6 13l3 0m9 0-3 0"], // kazma + yatay çizgi (sallama)
  littleprince: ["M12 4l5 2v4c0 3-2 5-5 6-3-1-5-3-5-6V6z M10 15h4l1 6h-6z"], // küçük kalkan + minik gövde
  goblinstein: ["M6 4h12l1 7-3 3v4l3 8H5l3-8v-4L5 11z M10 14h0m4 0h0"], // ekli (stitched) dev gövde
  bossbandit: ["M5 9l7-5 7 5-2 11H7z M9 9h6 M9 14l3 2 3-2"], // maske + kemer çizgisi
};

function CrestIcon({ accent, size = 48, kind = "card", role = null, cardId = null }) {
  const s = size;
  const cardGlyphPaths = cardId && CARD_GLYPHS[cardId];
  const roleGlyph = role && ROLE_GLYPHS[role];
  // Arka plan rengi role bağlı (rol ayırt edilebilirliği için), elixir rengi ise
  // ikinci bir vurgu (kenarlık/parlama) olarak kullanılır.
  const baseColor = (role && ROLE_COLORS[role]) || accent;
  return (
    <div
      className="relative flex items-center justify-center rounded-xl shrink-0 overflow-hidden"
      style={{
        width: s, height: s,
        background: `radial-gradient(circle at 30% 20%, ${baseColor}70, #0b0e18 78%)`,
        border: `2px solid ${accent}`,
        boxShadow: `0 0 0 1px #00000050 inset, 0 4px 10px -4px ${baseColor}88`,
      }}
    >
      {/* hafif iç desen — derinlik hissi için, gerçek sanat değil */}
      <div
        className="absolute inset-0 opacity-25"
        style={{ background: `linear-gradient(115deg, transparent 40%, ${baseColor} 50%, transparent 60%)` }}
      />
      <svg width={s * 0.62} height={s * 0.62} viewBox="0 0 24 24" fill="none" stroke="none" className="relative z-10">
        {cardGlyphPaths ? (
          <g fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
            {cardGlyphPaths.map((d, i) => <path key={i} d={d} />)}
          </g>
        ) : kind === "champion" ? (
          <path d="M4 7l3 2 5-5 5 5 3-2-2 9H6L4 7z" fill="#ffffff" opacity="0.95" />
        ) : kind === "hero" ? (
          <path d="M12 2l2.6 5.6L21 9l-4.5 4.2L17.6 20 12 16.8 6.4 20l1.1-6.8L3 9l6.4-1.4L12 2z" fill="#ffffff" opacity="0.95" />
        ) : roleGlyph ? (
          <path d={roleGlyph} fill="#ffffff" opacity="0.95" />
        ) : (
          <path d="M12 3l7 3v5c0 4.4-3 7.6-7 10-4-2.4-7-5.6-7-10V6l7-3z" fill="#ffffff" opacity="0.9" />
        )}
      </svg>
      {kind === "evo" && (
        <div
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-20"
          style={{ background: "#c9a227", color: "#0a0e1a" }}
          title="Evrim mevcut"
        >
          ✦
        </div>
      )}
    </div>
  );
}

/* ---------------- Kart Detay Modalı ---------------- */
function CardDetailModal({ card, onClose }) {
  if (!card) return null;
  const stats = CARD_STATS[card.id];
  const accent = getElixirColor(card.elixir);
  const rarityColor = RARITY_COLORS[card.rarity] || "#9fb3c8";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:w-[420px] sm:max-h-[80vh] bg-[#0e1320] sm:rounded-2xl rounded-t-2xl border border-white/10 shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <CrestIcon accent={accent} size={56} kind={card.evolution ? "evo" : "card"} role={card.role} cardId={card.id} />
              <div>
                <h3 className="text-white font-extrabold text-[17px] leading-tight">{card.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${rarityColor}33`, color: rarityColor }}>
                    {card.rarity}
                  </span>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: accent, color: "#fff" }}>
                    {card.elixir} elixir
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition">
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          {stats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                {stats.hp !== null && (
                  <StatBox label="Can (Sv. 11)" value={stats.hp.toLocaleString("tr-TR")} accent="#3a7a5a" />
                )}
                <StatBox label="Hasar (Sv. 11)" value={stats.damage.toLocaleString("tr-TR")} accent="#7a3b3b" />
                <StatBox label="Vuruş Hızı" value={stats.hitSpeed} accent="#3f7fc1" />
                <StatBox label="Hedef" value={stats.target} accent="#5a4a8a" />
              </div>

              <div>
                <div className="text-[12px] font-bold text-white/65 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> İyi Geldiği Kartlar
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {stats.counters.map((name) => (
                    <span key={name} className="text-[12px] font-semibold px-2 py-1 rounded-full bg-[#3a7a5a]/20 text-[#8fd4b0]">{name}</span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[12px] font-bold text-white/65 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5" /> Zayıf Olduğu Kartlar
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {stats.counteredBy.map((name) => (
                    <span key={name} className="text-[12px] font-semibold px-2 py-1 rounded-full bg-[#7a3b3b]/20 text-[#e8a5a5]">{name}</span>
                  ))}
                </div>
              </div>

              <div className="text-[11px] font-medium text-white/30 pt-2 border-t border-white/10">
                İstatistikler Seviye 11 standardına göredir, sadeleştirilmiştir. Gerçek değerler için oyun içi kart detayına bakın.
              </div>
            </div>
          ) : (
            <p className="text-[13px] font-medium text-white/45">Bu kart için detaylı istatistik henüz eklenmedi.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, accent }) {
  return (
    <div className="rounded-lg p-2.5" style={{ background: `${accent}1c` }}>
      <div className="text-[11px] font-semibold text-white/55 mb-0.5">{label}</div>
      <div className="text-[15px] font-extrabold text-white">{value}</div>
    </div>
  );
}

/* ---------------- Elixir Eğrisi Grafiği ---------------- */
function ElixirCurveChart({ items }) {
  const counts = useMemo(() => {
    const c = Array(10).fill(0); // 0-9 elixir
    items.forEach((it) => { if (it.elixir >= 0 && it.elixir <= 9) c[it.elixir]++; });
    return c;
  }, [items]);
  const max = Math.max(1, ...counts);

  if (items.length === 0) {
    return <p className="text-[12px] font-medium text-white/35 text-center py-4">Eğriyi görmek için kart ekle</p>;
  }

  return (
    <div>
      <div className="flex items-end gap-1.5 h-20">
        {counts.map((count, elixir) => {
          if (elixir === 0) return null;
          const heightPct = count === 0 ? 4 : Math.max(12, (count / max) * 100);
          return (
            <div key={elixir} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex-1 w-full flex items-end">
                <div
                  className="w-full rounded-t transition-all"
                  style={{ height: `${heightPct}%`, background: count === 0 ? "#ffffff14" : getElixirColor(elixir) }}
                  title={`${count} kart`}
                />
              </div>
              <span className="text-[10px] font-bold text-white/40">{elixir}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Kart Filtre Çubuğu ---------------- */
function FilterBar({ search, onSearch, rarityFilter, onRarityFilter, roleFilter, onRoleFilter, roles, ownedOnly, onOwnedOnlyChange, ownedCount }) {
  return (
    <div className="space-y-2 mb-3">
      <div className="relative">
        <Search className="w-4 h-4 text-white/35 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Kart ara..."
          className="w-full bg-white/[0.05] text-white text-[13px] font-medium rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-[#c9a227]/40 placeholder:text-white/30"
        />
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        <FilterChip active={rarityFilter === null} label="Tümü" onClick={() => onRarityFilter(null)} />
        {Object.keys(RARITY_COLORS).map((r) => (
          <FilterChip key={r} active={rarityFilter === r} label={r} color={RARITY_COLORS[r]} onClick={() => onRarityFilter(rarityFilter === r ? null : r)} />
        ))}
        <FilterChip
          active={ownedOnly}
          label={`Elimde Olanlar (${ownedCount})`}
          onClick={() => onOwnedOnlyChange(!ownedOnly)}
        />
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {roles.map((r) => (
          <FilterChip key={r} active={roleFilter === r} label={r} onClick={() => onRoleFilter(roleFilter === r ? null : r)} />
        ))}
      </div>
    </div>
  );
}

function FilterChip({ active, label, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full transition whitespace-nowrap ${
        active ? "bg-[#c9a227] text-[#0a0e1a]" : "bg-white/[0.05] text-white/60 hover:bg-white/[0.1]"
      }`}
    >
      {color && <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? "#0a0e1a" : color }} />}
      {label}
    </button>
  );
}

/* ---------------- Kart Çipi (seçim ızgarasında) ---------------- */
function CardChip({ card, selected, onClick, onShowDetail, owned, onToggleOwned, evolutionLocked }) {
  const accent = getElixirColor(card.elixir);
  const rarityColor = RARITY_COLORS[card.rarity] || "#9fb3c8";
  const isBlocked = evolutionLocked && !selected;
  return (
    <button
      onClick={onClick}
      disabled={isBlocked}
      title={isBlocked ? "Destede zaten bir evrim kartı var (en fazla 1 evrim seçilebilir)" : undefined}
      className={`relative p-2.5 rounded-xl text-left transition-all duration-200 ease-out flex flex-col items-center gap-1.5 transform ${
        selected
          ? "bg-white/[0.08] ring-2 ring-[#c9a227] scale-[1.03]"
          : isBlocked
          ? "bg-white/[0.02] opacity-40 cursor-not-allowed"
          : "bg-white/[0.04] hover:bg-white/[0.08] hover:scale-[1.015] scale-100"
      }`}
    >
      <span
        className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full"
        style={{ background: rarityColor }}
        title={card.rarity}
      />
      {onShowDetail && (
        <span
          role="button"
          onClick={(e) => { e.stopPropagation(); onShowDetail(card); }}
          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-[10px] font-bold text-white/70 z-10 transition-transform hover:scale-110"
          title="Kart detayı"
        >
          i
        </span>
      )}
      {onToggleOwned && (
        <span
          role="button"
          onClick={(e) => { e.stopPropagation(); onToggleOwned(card.id); }}
          className={`absolute bottom-1.5 left-1.5 w-4 h-4 rounded-full flex items-center justify-center z-10 transition-all duration-200 ${
            owned ? "bg-[#3a7a5a] scale-105" : "bg-black/40 hover:bg-black/60"
          }`}
          title={owned ? "Elimde var (kaldırmak için tıkla)" : "Elimde işaretle"}
        >
          {owned && <Check className="w-2.5 h-2.5 text-white" />}
        </span>
      )}
      <div className={`transition-transform duration-200 ${selected ? "scale-105" : ""}`}>
        <CrestIcon accent={accent} size={52} kind={card.evolution ? "evo" : "card"} role={card.role} cardId={card.id} />
      </div>
      <div className="text-center w-full">
        <div className="text-[13px] font-bold text-white leading-tight truncate w-full">{card.name}</div>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: accent, color: "#fff" }}>
            {card.elixir}
          </span>
          <span className="text-[11px] font-medium text-white/55">{card.role}</span>
        </div>
      </div>
      <div
        className={`absolute top-1 right-1 w-4 h-4 bg-[#c9a227] rounded-full flex items-center justify-center transition-all duration-200 origin-center ${
          selected ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      >
        <Star className="w-2.5 h-2.5 text-[#0a0e1a]" fill="#0a0e1a" />
      </div>
    </button>
  );
}

/* ---------------- Şampiyon / Kahraman Seçici Şerit ---------------- */
function SpecialPicker({ title, icon: Icon, items, selectedId, onSelect, kind, lockedByOther }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-white/80 text-[13px] font-bold uppercase tracking-wide">
        <Icon className="w-4 h-4" /> {title}
        <span className="text-white/40 font-medium normal-case">
          (en fazla 1 — şampiyon/kahraman aynı slotu paylaşır)
        </span>
        {lockedByOther && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/50 normal-case">
            şu an dolu
          </span>
        )}
      </div>
      <div className={`flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 ${lockedByOther ? "opacity-40" : ""}`}>
        {items.map((it) => {
          const active = selectedId === it.id;
          const tColor = TIER_COLORS[it.tier];
          return (
            <button
              key={it.id}
              onClick={() => !lockedByOther && onSelect(active ? null : it.id)}
              disabled={lockedByOther}
              className={`flex-shrink-0 w-32 p-2.5 rounded-lg text-left transition ${
                active ? "bg-white/[0.08] ring-2 ring-[#c9a227]" : lockedByOther ? "cursor-not-allowed" : "bg-white/[0.04] hover:bg-white/[0.08]"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <CrestIcon accent={tColor} size={34} kind={kind} cardId={it.id} />
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${tColor}33`, color: tColor }}>
                  {it.tier}
                </span>
              </div>
              <div className="text-[12px] font-bold text-white truncate">{it.name}</div>
              <div className="text-[11px] font-medium text-white/50">{it.elixir} elixir</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Deste Önizleme ---------------- */
function DeckPreview({ cards, levels, onLevelChange, onRemove, champion, hero, onRemoveSpecial, onImport }) {
  const total = cards.length + (champion ? 1 : 0) + (hero ? 1 : 0);
  const [importOpen, setImportOpen] = useState(false);
  const [importValue, setImportValue] = useState("");
  const [importError, setImportError] = useState(false);

  const handleImport = () => {
    const code = extractDeckCodeFromInput(importValue);
    const decoded = code ? decodeDeck(code) : null;
    if (decoded && decoded.cardIds.length > 0) {
      onImport(decoded);
      setImportValue("");
      setImportOpen(false);
      setImportError(false);
    } else {
      setImportError(true);
    }
  };

  return (
    <div className="bg-white/[0.05] rounded-2xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold text-[15px] tracking-tight">Desten</h3>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-white/50">{total}/8</span>
          <button
            onClick={() => setImportOpen((v) => !v)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition"
            title="Deste linkiyle içe aktar"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-white/45" />
          </button>
        </div>
      </div>

      {importOpen && (
        <div className="mb-3 p-2.5 bg-white/[0.04] rounded-lg space-y-2">
          <input
            value={importValue}
            onChange={(e) => { setImportValue(e.target.value); setImportError(false); }}
            placeholder="Deste linkini veya kodunu yapıştır..."
            className="w-full bg-white/[0.06] text-white text-[12px] font-medium rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-[#c9a227]/40 placeholder:text-white/30"
          />
          {importError && <p className="text-[11px] font-semibold text-[#e8a5a5]">Geçersiz link veya kod</p>}
          <button
            onClick={handleImport}
            className="w-full py-1.5 text-[12px] font-bold bg-[#c9a227]/20 hover:bg-[#c9a227]/30 text-[#e0c258] rounded-lg transition"
          >
            Desteyi Yükle
          </button>
        </div>
      )}

      <div className="space-y-1.5">
        {champion && (
          <SpecialRow item={champion} kind="champion" levelValue={levels[champion.id]} onLevelChange={onLevelChange} onRemove={() => onRemoveSpecial("champion")} />
        )}
        {hero && (
          <SpecialRow item={hero} kind="hero" levelValue={levels[hero.id]} onLevelChange={onLevelChange} onRemove={() => onRemoveSpecial("hero")} />
        )}
        {cards.map((card) => {
          const accent = getElixirColor(card.elixir);
          const roleColor = ROLE_COLORS[card.role] || "#5a6478";
          return (
            <div key={card.id} className="flex items-center gap-2.5 bg-white/[0.03] rounded-lg p-1.5 pr-2 deck-row-enter">
              <CrestIcon accent={accent} size={36} kind={card.evolution ? "evo" : "card"} role={card.role} cardId={card.id} />
              <div className="flex-1 min-w-0">
                <div className="text-white text-[13px] font-bold truncate">{card.name}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${accent}33`, color: accent }}>
                    {card.elixir} elixir
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${roleColor}33`, color: roleColor }}>
                    {card.role}
                  </span>
                </div>
              </div>
              <input
                type="number" min="1" max="15"
                value={levels[card.id] ?? 11}
                onChange={(e) => onLevelChange(card.id, Math.max(1, Math.min(15, parseInt(e.target.value) || 1)))}
                className="w-12 px-1 py-1 rounded bg-white/10 text-white text-[13px] font-semibold text-center"
                title="Kart seviyesi"
              />
              <button onClick={() => onRemove(card.id)} className="p-1 hover:bg-red-500/20 rounded transition">
                <X className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          );
        })}

        {total === 0 && (
          <div className="text-center py-10 text-white/35">
            <Layers className="w-8 h-8 mx-auto mb-2" />
            <p className="text-[13px] font-medium">Kart, şampiyon veya kahraman seçerek başla</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SpecialRow({ item, kind, levelValue, onLevelChange, onRemove }) {
  const tColor = TIER_COLORS[item.tier];
  return (
    <div className="flex items-center gap-2.5 bg-[#c9a227]/[0.08] rounded-lg p-1.5 pr-2 ring-1 ring-[#c9a227]/30">
      <CrestIcon accent={tColor} size={36} kind={kind} cardId={item.id} />
      <div className="flex-1 min-w-0">
        <div className="text-white text-[13px] font-bold truncate flex items-center gap-1.5">
          {item.name}
          <span className="text-[10px] font-bold px-1 rounded" style={{ background: `${tColor}33`, color: tColor }}>{item.tier}</span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#c9a227]/20 text-[#e0c258]">
            {kind === "champion" ? "Şampiyon" : "Kahraman"}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${getElixirColor(item.elixir)}33`, color: getElixirColor(item.elixir) }}>
            {item.elixir} elixir
          </span>
        </div>
      </div>
      <input
        type="number" min="1" max="15"
        value={levelValue ?? 11}
        onChange={(e) => onLevelChange(item.id, Math.max(1, Math.min(15, parseInt(e.target.value) || 1)))}
        className="w-12 px-1 py-1 rounded bg-white/10 text-white text-[13px] font-semibold text-center"
      />
      <button onClick={onRemove} className="p-1 hover:bg-red-500/20 rounded transition">
        <X className="w-3.5 h-3.5 text-red-400" />
      </button>
    </div>
  );
}

/* ---------------- Deste Analizi ---------------- */
function DeckAnalysis({ avgElixir, synergyScore, upgradePriority, favoriteCard, curveItems, synergies }) {
  return (
    <div className="bg-white/[0.05] rounded-2xl p-4 border border-white/10 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Ort. Elixir" value={avgElixir} icon={<Swords className="w-4 h-4" />} accent="#3f7fc1" />
        <Stat label="Sinerji Puanı" value={`${synergyScore}/100`} icon={<TrendingUp className="w-4 h-4" />} accent="#3a7a5a" />
      </div>

      <div>
        <div className="text-[12px] font-bold text-white/65 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5" /> Elixir Eğrisi
        </div>
        <ElixirCurveChart items={curveItems} />
      </div>

      {synergies && synergies.length > 0 && (
        <div>
          <div className="text-[12px] font-bold text-white/65 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Kart Sinerjisi Haritası
          </div>
          <div className="space-y-1.5">
            {synergies.map((s, i) => {
              const cardA = CARDS.find((c) => c.id === s.a);
              const cardB = CARDS.find((c) => c.id === s.b);
              return (
                <div key={i} className="bg-[#3a7a5a]/10 rounded-lg p-2">
                  <div className="text-[12px] font-bold text-[#8fd4b0] mb-0.5">
                    {cardA?.name} + {cardB?.name}
                  </div>
                  <p className="text-[11px] font-medium text-white/55 leading-snug">{s.note}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {favoriteCard && (
        <div className="flex items-center gap-2 text-[13px] font-semibold text-[#d9bfe0] bg-[#5a4a8a]/20 rounded-lg p-2">
          <Heart className="w-4 h-4 fill-[#d9bfe0]" />
          Bu destede en sevdiğin kart: <span className="font-bold">{favoriteCard.name}</span>
        </div>
      )}

      {upgradePriority.length > 0 && (
        <div>
          <div className="text-[12px] font-bold text-white/65 uppercase tracking-wide mb-1.5">Kart Yükseltme Önceliği</div>
          <div className="space-y-1">
            {upgradePriority.map((u, i) => (
              <div key={u.id} className="flex items-center gap-2 text-[13px]">
                <span className="text-white/35 font-bold w-4">{i + 1}.</span>
                <span className="text-white/90 font-medium flex-1 truncate">{u.name}</span>
                <span className="text-white/45 font-semibold">Sv.{u.level}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon, accent }) {
  return (
    <div className="rounded-lg p-2.5" style={{ background: `${accent}1c` }}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/60 mb-1">{icon}{label}</div>
      <div className="text-xl font-extrabold" style={{ color: accent }}>{value}</div>
    </div>
  );
}

/* ---------------- Deste Şablonları Sekmesi ---------------- */
function DeckTemplatesTab({ onLoadDeck }) {
  const levelColors = { "Başlangıç": "#3a7a5a", "Orta Seviye": "#3f7fc1", "İleri Seviye": "#7a3b5a" };
  return (
    <div>
      <p className="text-[12px] font-medium text-white/40 mb-3">
        Bunlar küratörlü, sabit başlangıç desteleridir — Meta Desteler sekmesindeki AI önerilerinden farklı olarak değişmezler.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {DECK_TEMPLATES.map((tpl) => {
          const cards = CARDS.filter((c) => tpl.cardIds.includes(c.id));
          const levelColor = levelColors[tpl.level] || "#5a6478";
          return (
            <div key={tpl.id} className="bg-white/[0.05] rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[14px] font-extrabold text-white">{tpl.name}</div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${levelColor}33`, color: levelColor }}>
                  {tpl.level}
                </span>
              </div>
              <p className="text-[12px] font-medium text-white/55 mb-3">{tpl.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {cards.map((c) => (
                  <CrestIcon key={c.id} accent={getElixirColor(c.elixir)} size={32} kind={c.evolution ? "evo" : "card"} role={c.role} cardId={c.id} />
                ))}
              </div>
              <button
                onClick={() => onLoadDeck(tpl.cardIds)}
                className="w-full py-1.5 text-[12px] font-bold bg-[#c9a227]/20 hover:bg-[#c9a227]/30 text-[#e0c258] rounded-lg transition"
              >
                Bu Desteyi Yükle
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Favori Desteler ---------------- */
const DECK_TAGS = ["Köprü Baskısı", "Savunma", "Döngü", "Hava", "Kontrol", "Beatdown", "Kuşatma"];
const DECK_TAG_COLORS = {
  "Köprü Baskısı": "#a9852f", Savunma: "#2f7a72", Döngü: "#3f7fc1",
  Hava: "#5a4a8a", Kontrol: "#7a3b3b", Beatdown: "#7a3b5a", Kuşatma: "#3a7a5a",
};

function FavoritesTab({ favorites, onLoad, onDelete, onUpdateNote, onToggleTag }) {
  const [tagFilter, setTagFilter] = useState(null);

  const filtered = useMemo(
    () => (tagFilter ? favorites.filter((f) => (f.tags || []).includes(tagFilter)) : favorites),
    [favorites, tagFilter]
  );

  if (favorites.length === 0) {
    return (
      <div className="text-center py-16 text-white/40">
        <Heart className="w-8 h-8 mx-auto mb-2" />
        <p className="text-[14px] font-medium">Henüz favori desten yok. Deste kurucudan bir deste favorile.</p>
      </div>
    );
  }
  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto pb-3">
        <FilterChip active={tagFilter === null} label="Tümü" onClick={() => setTagFilter(null)} />
        {DECK_TAGS.map((tag) => (
          <FilterChip
            key={tag}
            active={tagFilter === tag}
            label={tag}
            color={DECK_TAG_COLORS[tag]}
            onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-10 text-[13px] font-medium text-white/35">Bu etikete sahip favori deste yok</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((fav) => (
            <div key={fav.savedAt} className="bg-white/[0.05] rounded-xl p-3 border border-white/10">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[12px] font-semibold text-white/50">{new Date(fav.savedAt).toLocaleDateString("tr-TR")}</span>
                <button onClick={() => onDelete(fav.savedAt)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {fav.items.map((it) => (
                  <CrestIcon key={it.id} accent={it.accent} size={28} kind={it.kind} cardId={it.id} />
                ))}
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                {DECK_TAGS.map((tag) => {
                  const active = (fav.tags || []).includes(tag);
                  const color = DECK_TAG_COLORS[tag];
                  return (
                    <button
                      key={tag}
                      onClick={() => onToggleTag(fav.savedAt, tag)}
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full transition"
                      style={active ? { background: `${color}33`, color } : { background: "#ffffff0d", color: "#ffffff55" }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              <input
                value={fav.note || ""}
                onChange={(e) => onUpdateNote(fav.savedAt, e.target.value)}
                placeholder="Not ekle (örn. köprü baskısı için)"
                className="w-full mb-2 bg-white/[0.05] text-white/80 text-[12px] font-medium rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-[#c9a227]/30 placeholder:text-white/25"
              />
              <button onClick={() => onLoad(fav)} className="w-full py-1.5 text-[13px] bg-[#c9a227]/20 hover:bg-[#c9a227]/30 text-[#e0c258] rounded-lg font-bold transition">
                Bu desteyi yükle
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Ana Menü / Karşılama Ekranı ---------------- */
function HomeCard({ icon: Icon, title, description, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative p-5 rounded-2xl text-left bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 transition-all"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}99)` }}
      >
        <Icon className="w-6 h-6 text-[#0a0e1a]" />
      </div>
      <div className="text-white font-extrabold text-[16px] mb-1">{title}</div>
      <p className="text-[13px] font-medium text-white/50 leading-snug">{description}</p>
    </button>
  );
}

function HomeScreen({ onNavigate, favoriteCount }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-7 pt-2">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "linear-gradient(135deg, #c9a227, #8a6b2e)" }}
        >
          <Crown className="w-8 h-8 text-[#0a0e1a]" />
        </div>
        <h1 className="text-white font-extrabold text-[24px] tracking-tight mb-1.5">Arena Taktik Masası</h1>
        <p className="text-[14px] font-medium text-white/45">Deste kur, meta'yı keşfet, Domuz Binici'ye sor</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <HomeCard
          icon={Layers}
          title="Deste Kur"
          description="Kartları, şampiyonu ve kahramanı seç, elixir eğrini ve sinerjini gör."
          accent="#c9a227"
          onClick={() => onNavigate("builder")}
        />
        <HomeCard
          icon={TrendingUp}
          title="Meta Desteler"
          description="Domuz Binici'nin güncel meta yorumuna göre güçlü deste arketipleri."
          accent="#3f7fc1"
          onClick={() => onNavigate("metadecks")}
        />
        <HomeCard
          icon={Heart}
          title="Favoriler"
          description={favoriteCount > 0 ? `${favoriteCount} favori desten var, hızlıca eriş.` : "Beğendiğin desteleri burada topla."}
          accent="#7a3b5a"
          onClick={() => onNavigate("favorites")}
        />
        <HomeCard
          icon={Shield}
          title="Karşılaştır"
          description="Kendi desteni ve rastgele bir rakip desteyi yan yana incele."
          accent="#3a7a5a"
          onClick={() => onNavigate("compare")}
        />
        <HomeCard
          icon={BookOpen}
          title="Deste Şablonları"
          description="Başlangıç, orta ve ileri seviye için küratörlü, sabit deste arketipleri."
          accent="#a9852f"
          onClick={() => onNavigate("templates")}
        />
      </div>

      <button
        onClick={() => onNavigate("assistant")}
        className="w-full mt-4 p-4 rounded-2xl bg-[#c9a227]/[0.08] hover:bg-[#c9a227]/[0.14] border border-[#c9a227]/20 transition-all flex items-center gap-3"
      >
        <span className="text-2xl">🐗</span>
        <div className="text-left">
          <div className="text-white font-bold text-[14px]">Domuz Binici'ye Sor</div>
          <div className="text-[12px] font-medium text-white/45">Strateji, kart önerisi veya karşı-deste sorular</div>
        </div>
      </button>
    </div>
  );
}


function findClosestCardId(name) {
  const cleaned = name.toLowerCase().trim();
  let best = null;
  let bestScore = 0;
  for (const card of CARDS) {
    const cardName = card.name.toLowerCase();
    if (cardName === cleaned) return card.id;
    if (cardName.includes(cleaned) || cleaned.includes(cardName)) {
      const score = Math.min(cardName.length, cleaned.length);
      if (score > bestScore) { bestScore = score; best = card.id; }
    }
  }
  return best;
}

function MetaDecksTab({ onLoadDeck }) {
  const [loading, setLoading] = useState(false);
  const [decks, setDecks] = useState(null);
  const [error, setError] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);

  const fetchMeta = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cardNameList = CARDS.map((c) => c.name).join(", ");
      const archetypeAngles = [
        "köprü baskısı (bridge spam) ve hızlı saldırı arketipleri",
        "ağır tank ve kontrol arketipleri",
        "döngü (cycle) ve düşük elixir ortalamalı arketipler",
        "hava birlikleri ve uçan saldırı arketipleri",
        "savunma odaklı ve karşı-saldırı (counter-push) arketipleri",
        "az bilinen ama güçlü, sürpriz unsuru taşıyan arketipler",
      ];
      const angle = archetypeAngles[Math.floor(Math.random() * archetypeAngles.length)];
      const varietySeed = Math.floor(Math.random() * 100000);

      const systemPrompt =
        "Sen bir Clash Royale meta analistisin. Aşağıdaki kart adlarını KULLANARAK (başka isim icat etme) " +
        "şu anki rekabetçi metada güçlü olduğu bilinen 4 farklı deste arketipi öner. " +
        "Bu istekte özellikle şu açıdan çeşitlilik göster: " + angle + ". " +
        "Sitede 113 farklı kart var; sadece en bilinen 10-15 kartı kullanma, daha az yaygın ama gerçekten işlevsel kartları da dahil et. " +
        "Her istek farklı bir varyasyon (seed: " + varietySeed + ") içermeli, önceki önerilerle aynı 4 desteyi tekrar verme. " +
        "Mevcut kartlar: " + cardNameList + ". " +
        "SADECE şu JSON formatında yanıt ver, başka hiçbir metin ekleme: " +
        '{"decks":[{"name":"arketip adı (örn. Köprü Baskısı)","summary":"1 cümlelik açıklama","cards":["kart1","kart2",...8 kart]}]}';

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          system: systemPrompt,
          messages: [{ role: "user", content: `Şu anki meta için 4 deste arketipi öner (varyasyon: ${varietySeed}).` }],
        }),
      });

      if (!response.ok) throw new Error("API yanıt vermedi");
      const data = await response.json();
      const textBlock = data.content?.find((b) => b.type === "text");
      const raw = textBlock?.text?.trim() || "";
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      const mapped = (parsed.decks || []).map((d) => ({
        name: d.name,
        summary: d.summary,
        cardIds: (d.cards || []).map(findClosestCardId).filter(Boolean),
      }));
      setDecks(mapped);
      setFetchedAt(new Date());
    } catch (err) {
      setError("Meta desteler alınamadı, tekrar dener misin?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  return (
    <div>
      <div className="bg-white/[0.05] rounded-2xl p-4 border border-white/10 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-white/80 text-[13px] font-bold uppercase tracking-wide">
            <TrendingUp className="w-4 h-4" /> Meta Desteler
          </div>
          <button
            onClick={fetchMeta}
            disabled={loading}
            className="flex items-center gap-1.5 text-[12px] font-bold px-2.5 py-1.5 rounded-full bg-[#c9a227]/15 hover:bg-[#c9a227]/25 disabled:opacity-40 text-[#e0c258] transition"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Yenile
          </button>
        </div>
        <p className="text-[11px] font-medium text-white/30 mt-2">
          Domuz Binici'nin güncel meta yorumu — sekme her açıldığında veya "Yenile"ye basıldığında taze üretilir.
          Bu, haftalık otomatik bir güncelleme değildir; her istek anlık olarak AI'a soruluyor.
          {fetchedAt && <> Son güncelleme: {fetchedAt.toLocaleTimeString("tr-TR")}</>}
        </p>
      </div>

      {loading && !decks && (
        <div className="text-center py-16 text-white/40">
          <Loader2 className="w-7 h-7 mx-auto mb-2 animate-spin" />
          <p className="text-[13px] font-medium">Domuz Binici meta'ya bakıyor...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-10">
          <p className="text-[13px] font-semibold text-[#e8a5a5] mb-2">{error}</p>
          <button onClick={fetchMeta} className="text-[12px] font-bold text-[#e0c258] hover:text-[#f0d56a] transition">
            Tekrar dene
          </button>
        </div>
      )}

      {decks && decks.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {decks.map((d, i) => (
            <div key={i} className="bg-white/[0.05] rounded-xl p-4 border border-white/10">
              <div className="text-[14px] font-extrabold text-white mb-1">{d.name}</div>
              <p className="text-[12px] font-medium text-white/55 mb-3">{d.summary}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {d.cardIds.map((id) => {
                  const card = CARDS.find((c) => c.id === id);
                  if (!card) return null;
                  return <CrestIcon key={id} accent={getElixirColor(card.elixir)} size={32} kind={card.evolution ? "evo" : "card"} role={card.role} cardId={card.id} />;
                })}
              </div>
              <button
                onClick={() => onLoadDeck(d.cardIds)}
                disabled={d.cardIds.length === 0}
                className="w-full py-1.5 text-[12px] font-bold bg-[#c9a227]/20 hover:bg-[#c9a227]/30 disabled:opacity-30 text-[#e0c258] rounded-lg transition"
              >
                Bu Desteyi Dene
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Deste Karşılaştırma ---------------- */
function CompareSlot({ label, cardIds, onRegenerate, onClear }) {
  const cards = useMemo(() => CARDS.filter((c) => cardIds.includes(c.id)), [cardIds]);
  const avg = cards.length ? (cards.reduce((s, c) => s + c.elixir, 0) / cards.length).toFixed(1) : "0.0";

  return (
    <div className="bg-white/[0.05] rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[12px] font-bold text-white/65 uppercase">{label}</div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-full bg-[#c9a227] hover:bg-[#dab542] text-[#0a0e1a] transition shadow-sm"
            title="Rastgele deste oluştur"
          >
            <Dices className="w-3.5 h-3.5" /> Yeniden Oluştur
          </button>
          {cards.length > 0 && (
            <button onClick={onClear} className="p-1.5 hover:bg-white/10 rounded-full transition" title="Temizle">
              <X className="w-3.5 h-3.5 text-white/40" />
            </button>
          )}
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-10 text-white/30">
          <Shield className="w-7 h-7 mx-auto mb-2" />
          <p className="text-[12px] font-medium">Henüz deste yok</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {cards.map((c) => (
              <CrestIcon key={c.id} accent={getElixirColor(c.elixir)} size={36} kind={c.evolution ? "evo" : "card"} role={c.role} cardId={c.id} />
            ))}
          </div>
          <div className="text-[13px] font-medium text-white/60">Ortalama elixir: <span className="text-white font-bold">{avg}</span></div>
          <div className="text-[13px] font-medium text-white/60">Kart sayısı: <span className="text-white font-bold">{cards.length}/8</span></div>
        </>
      )}
    </div>
  );
}

/* ---------------- Deste Gücü Puanlama (eğlence amaçlı, gerçek tahmin değil) ----------------
   Rol çeşitliliği, elixir dengesi ve temel sinerji kriterlerinden basit bir skor üretir. */
function scoreDeckPower(cards) {
  if (cards.length === 0) return 0;
  const roles = new Set(cards.map((c) => c.role));
  const avgElixir = cards.reduce((s, c) => s + c.elixir, 0) / cards.length;
  const hasTank = cards.some((c) => c.role === "Tank" || c.role === "Tank-Mini");
  const hasSpell = cards.some((c) => c.role === "Büyü");
  const hasSwarmAnswer = cards.some((c) => c.role === "Sürü" || c.role === "Büyü");
  const hasBuilding = cards.some((c) => c.role === "Bina");
  const evoCount = cards.filter((c) => c.evolution).length;
  const completeness = (cards.length / 8) * 20;
  const elixirBalance = avgElixir >= 2.8 && avgElixir <= 4.2 ? 15 : 8;

  let score = completeness + elixirBalance + roles.size * 6 + (hasTank ? 12 : 0) + (hasSpell ? 10 : 0) +
    (hasSwarmAnswer ? 8 : 0) + (hasBuilding ? 6 : 0) + evoCount * 3;
  return Math.max(5, Math.min(100, Math.round(score)));
}

function CompareTab({ myDeckIds, onMyDeckChange }) {
  const [opponentDeckIds, setOpponentDeckIds] = useState([]);

  const regenerateMine = useCallback(() => onMyDeckChange(generateRandomDeck()), [onMyDeckChange]);
  const regenerateOpponent = useCallback(() => setOpponentDeckIds(generateRandomDeck()), []);
  const clearMine = useCallback(() => onMyDeckChange([]), [onMyDeckChange]);
  const clearOpponent = useCallback(() => setOpponentDeckIds([]), []);

  const myCards = useMemo(() => CARDS.filter((c) => myDeckIds.includes(c.id)), [myDeckIds]);
  const oppCards = useMemo(() => CARDS.filter((c) => opponentDeckIds.includes(c.id)), [opponentDeckIds]);
  const myScore = useMemo(() => scoreDeckPower(myCards), [myCards]);
  const oppScore = useMemo(() => scoreDeckPower(oppCards), [oppCards]);
  const total = myScore + oppScore;
  const myWinChance = total > 0 ? Math.round((myScore / total) * 100) : 50;

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <CompareSlot label="Senin Desten" cardIds={myDeckIds} onRegenerate={regenerateMine} onClear={clearMine} />
        <CompareSlot label="Karşı Taraf" cardIds={opponentDeckIds} onRegenerate={regenerateOpponent} onClear={clearOpponent} />
      </div>

      {(myCards.length > 0 || oppCards.length > 0) && (
        <div className="bg-white/[0.05] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-3 text-white/80 text-[13px] font-bold uppercase tracking-wide">
            <BarChart3 className="w-4 h-4" /> Deste Başarı Tahmini
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[12px] font-bold text-white/60 w-20">Senin Desten</span>
            <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-[#c9a227] transition-all" style={{ width: `${myWinChance}%` }} />
            </div>
            <span className="text-[13px] font-extrabold text-white w-10 text-right">{myScore}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-bold text-white/60 w-20">Karşı Taraf</span>
            <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-[#7a3b3b] transition-all" style={{ width: `${100 - myWinChance}%` }} />
            </div>
            <span className="text-[13px] font-extrabold text-white w-10 text-right">{oppScore}</span>
          </div>
          <p className="text-[11px] font-medium text-white/30 mt-3">
            Bu tahmin gerçek bir maç sonucu değildir — sadece rol çeşitliliği, elixir dengesi ve
            temel sinerji kriterlerine göre eğlence amaçlı hesaplanan bir puandır.
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------------- Domuz Binici — AI Asistan ---------------- */
function HogRiderAssistant({ open, onClose, deckContext, tone }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Selam, ben Domuz Binici 🐗 Deste sorularını, kart önerilerini ya da strateji takıldığın yerleri sorabilirsin." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const lastDeckSnapshot = useRef(null); // Hafıza: panel açıldığındaki/son bilinen deste durumu

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendText = useCallback(async (text) => {
    if (!text || loading) return;

    // Hafıza: deste son konuşulan andan beri değiştiyse, bunu kullanıcı mesajına
    // sessizce ekleyerek AI'a fark ettirelim — böylece "az önce şunu sormuştun, şimdi
    // desten değişti" bağlamını koruyabilir.
    const prevSnapshot = lastDeckSnapshot.current;
    const currentSnapshotStr = JSON.stringify(deckContext);
    let contextNote = "";
    if (prevSnapshot !== null && prevSnapshot !== currentSnapshotStr) {
      contextNote = `\n\n[Not: Kullanıcı son mesajından sonra destesini değiştirdi. Güncel deste: ${currentSnapshotStr}]`;
    }
    lastDeckSnapshot.current = currentSnapshotStr;

    const next = [...messages, { role: "user", content: text + contextNote }];
    setMessages([...messages, { role: "user", content: text }]); // ekranda not gösterilmez, sade kalır
    setInput("");
    setLoading(true);

    try {
      const toneInstruction =
        tone === "fun"
          ? "TON: Eğlenceli, esprili, arkadaş canlısı bir arkadaş gibi konuş; emoji kullanabilirsin, rahat bir dil tut."
          : "TON: Ciddi, profesyonel bir koç gibi konuş; net ve odaklı tavsiyeler ver, gereksiz şaka yapma.";
      const systemPrompt =
        "Sen 'Domuz Binici', bir Clash Royale deste kurucusu sitesinde çalışan bir oyun asistanısın. " +
        "Türkçe, kısa cevaplar ver. Elixir eğrisi, kart sinerjisi, seviye yükseltme önceliği gibi konularda yardımcı ol. " +
        toneInstruction + " " +
        "Kullanıcı bir desteye karşı ne oynaması gerektiğini sorduğunda: rakip destenin zayıf noktalarını (örn. hava savunması yok, sürü temizleme yok, yavaş döngü) belirle ve buna göre somut karşı kart / karşı strateji öner, varsayım yapma, elindeki bilgiye dayan. " +
        "Kullanıcı 'bu desteyi açıkla' dediğinde: destedeki her kartın deste içindeki rolünü (win condition / tank / destek / savunma / sürü temizleme / büyü) tek tek, yeni başlayan birinin anlayacağı şekilde açıkla. " +
        "HAFIZA: Konuşma sırasında kullanıcının destesi değişebilir; mesajların içinde '[Not: ...]' şeklinde bir bilgi görürsen bu, destenin değiştiğini gösterir — yeni durumu dikkate al ve fark ettiğini doğal bir şekilde belirtebilirsin (örn. 'desteni güncellemişsin, şimdi...'). " +
        "ÇEŞİTLİLİK: Sitede 113 farklı kart var, sadece en bilinen 10-15 kartı (Şövalye, Ejderha, Roket gibi) tekrar tekrar önerme. Aynı soru farklı şekillerde sorulsa bile her seferinde aynı kartlara/destelere yönlendirme; uygun olduğunda daha az bilinen ama işlevsel kartları da öner (örn. Mezar Taşı, Goblin Kafesi, Sarmaşıklar, Elektrik Ruhu gibi). Önceki mesajlarında verdiğin önerileri tekrarlamak yerine alternatif seçenekler sun. " +
        "Kullanıcının şu anki destesi hakkında bağlam: " + currentSnapshotStr;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: systemPrompt,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error("API yanıt vermedi");
      const data = await response.json();
      const textBlock = data.content?.find((b) => b.type === "text");
      const reply = textBlock?.text || "Şu an cevap veremedim, tekrar dener misin?";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: "Bağlantıda bir sorun oldu 🐗 Birazdan tekrar dener misin?" }]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, deckContext, tone]);

  const send = useCallback(() => sendText(input.trim()), [input, sendText]);

  const hasDeck = deckContext.kartlar.length > 0 || deckContext.sampiyon || deckContext.kahraman;
  const quickActions = [
    { label: "Bu desteyi açıkla", enabled: hasDeck },
    { label: "Bu desteye karşı ne oynamalıyım?", enabled: hasDeck },
    { label: "Hangi kartı önce yükseltmeliyim?", enabled: hasDeck },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:w-[420px] sm:max-h-[640px] h-[80vh] bg-[#0e1320] sm:rounded-2xl rounded-t-2xl flex flex-col border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#c9a227]/20 flex items-center justify-center text-lg">🐗</div>
            <div>
              <div className="text-white font-bold text-[14px]">Domuz Binici</div>
              <div className="text-[12px] font-medium text-white/45">Senin kişisel Clash Royale yapay zekan</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-[14px] font-medium leading-snug whitespace-pre-wrap ${
                  m.role === "user" ? "bg-[#c9a227] text-[#0a0e1a] font-semibold" : "bg-white/10 text-white/90"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/10 px-3 py-2 rounded-xl flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-white/60 animate-spin" />
                <span className="text-[12px] font-medium text-white/45">yazıyor...</span>
              </div>
            </div>
          )}
        </div>

        <div className="px-3 pt-2 flex gap-1.5 overflow-x-auto">
          {quickActions.map((qa) => (
            <button
              key={qa.label}
              onClick={() => qa.enabled && sendText(qa.label)}
              disabled={!qa.enabled || loading}
              className="flex-shrink-0 text-[12px] font-semibold px-2.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-30 disabled:cursor-not-allowed text-white/75 transition whitespace-nowrap"
              title={qa.enabled ? "" : "Önce bir deste kur"}
            >
              {qa.label}
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-white/10 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Bir şey sor..."
            className="flex-1 bg-white/[0.06] text-white text-[14px] font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#c9a227]/50"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="p-2 bg-[#c9a227] hover:bg-[#dab542] disabled:opacity-40 rounded-lg transition"
          >
            <Send className="w-4 h-4 text-[#0a0e1a]" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Ayarlar Paneli ---------------- */
function SettingsPanel({ open, onClose, onOpenAssistant, tone, onToneChange, theme, onThemeChange }) {
  if (!open) return null;
  const isLight = theme === "light";
  const panelBg = isLight ? "#f4f1e8" : "#0e1320";
  const textMain = isLight ? "text-[#1a1410]" : "text-white";
  const textSub = isLight ? "text-[#5a5246]" : "text-white/45";
  const textLabel = isLight ? "text-[#3a342c]" : "text-white/65";
  const inactiveBtn = isLight ? "bg-black/[0.06] text-[#3a342c] hover:bg-black/[0.1]" : "bg-white/[0.06] text-white/60 hover:bg-white/[0.1]";

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60" onClick={onClose}>
      <div
        className="w-80 h-full border-l p-4 overflow-y-auto"
        style={{ background: panelBg, borderColor: isLight ? "#00000018" : "#ffffff1a" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-bold text-[15px] flex items-center gap-2 ${textMain}`}>
            <Settings className="w-4 h-4" /> Ayarlar
          </h3>
          <button onClick={onClose} className={`p-1.5 rounded-lg transition ${isLight ? "hover:bg-black/[0.06]" : "hover:bg-white/10"}`}>
            <X className={`w-4 h-4 ${isLight ? "text-[#5a5246]" : "text-white/50"}`} />
          </button>
        </div>

        <button
          onClick={() => { onOpenAssistant(); onClose(); }}
          className="w-full flex items-center gap-3 p-3 bg-[#c9a227]/15 hover:bg-[#c9a227]/25 rounded-xl transition text-left mb-3"
        >
          <div className="w-9 h-9 rounded-full bg-[#c9a227]/25 flex items-center justify-center text-base">🐗</div>
          <div>
            <div className={`text-[14px] font-bold ${textMain}`}>Domuz Binici</div>
            <div className={`text-[12px] font-medium ${textSub}`}>Kişisel AI asistanını aç</div>
          </div>
        </button>

        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 p-2.5 bg-[#c9a227] hover:bg-[#dab542] rounded-xl transition text-[#0a0e1a] text-[13px] font-extrabold mb-4"
        >
          <Layers className="w-4 h-4" /> Deste Kurucuya Dön
        </button>

        <div className="mb-4">
          <div className={`text-[12px] font-bold uppercase tracking-wide mb-2 ${textLabel}`}>Domuz Binici'nin Tonu</div>
          <div className="flex gap-2">
            <button
              onClick={() => onToneChange("serious")}
              className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition ${
                tone === "serious" ? "bg-[#c9a227] text-[#0a0e1a]" : inactiveBtn
              }`}
            >
              Ciddi Koç
            </button>
            <button
              onClick={() => onToneChange("fun")}
              className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition ${
                tone === "fun" ? "bg-[#c9a227] text-[#0a0e1a]" : inactiveBtn
              }`}
            >
              Eğlenceli Arkadaş
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className={`text-[12px] font-bold uppercase tracking-wide mb-2 ${textLabel}`}>Görünüm</div>
          <div className="flex gap-2">
            <button
              onClick={() => onThemeChange("dark")}
              className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition ${
                theme === "dark" ? "bg-[#c9a227] text-[#0a0e1a]" : inactiveBtn
              }`}
            >
              Koyu
            </button>
            <button
              onClick={() => onThemeChange("light")}
              className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition ${
                theme === "light" ? "bg-[#c9a227] text-[#0a0e1a]" : inactiveBtn
              }`}
            >
              Açık
            </button>
          </div>
        </div>

        <div className="pt-3 border-t" style={{ borderColor: isLight ? "#00000018" : "#ffffff1a" }}>
          <div className={`text-[12px] font-bold uppercase tracking-wide mb-2 ${textLabel}`}>Hakkında</div>
          <div className={`text-[12px] font-medium leading-relaxed space-y-2 ${textSub}`}>
            <p>
              <strong className={textMain}>Arena Taktik Masası</strong>, <strong className={textMain}>Clash Royale</strong> (© Supercell Oy) için
              geliştirilmiş bağımsız bir fan projesidir. Bu site Supercell tarafından desteklenmemekte,
              yetkilendirilmemekte veya onaylanmamaktadır.
            </p>
            <p>
              Tüm kart görselleri, gerçek oyun sanatı kullanılmadan bu site tarafından
              üretilen orijinal rozet ikonlardır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Telif Bildirimi ---------------- */
function CopyrightNotice() {
  return (
    <div className="text-[11px] font-medium text-white/35 px-1 py-3 text-center leading-relaxed">
      Bağımsız bir fan projesidir. Clash Royale ve ilgili tüm markalar Supercell Oy'a aittir.
      Görseller orijinal sanat eserleri değildir, bu site tarafından üretilen rozet ikonlardır.
      Bkz: Supercell Fan İçerik Politikası.
    </div>
  );
}

/* ========================= ANA UYGULAMA ========================= */
export default function ClashDeckBuilder() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [championId, setChampionId] = useState(null);
  const [heroId, setHeroId] = useState(null);
  const [levels, setLevels] = useState({});
  const [favoriteCardId, setFavoriteCardId] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [detailCard, setDetailCard] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [favoriteToast, setFavoriteToast] = useState(false);
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState(null);
  const [roleFilter, setRoleFilter] = useState(null);
  const [ownedCardIds, setOwnedCardIds] = useState([]);
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [tone, setTone] = useState("serious");
  const [theme, setTheme] = useState("dark");

  const toggleOwned = useCallback((id) => {
    setOwnedCardIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  // Sayfa açılışında URL'deki paylaşım kodunu oku ve desteyi yükle
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("deste");
      if (code) {
        const decoded = decodeDeck(code);
        if (decoded) {
          setSelectedCardIds(decoded.cardIds.filter((id) => CARDS.some((c) => c.id === id)));
          setChampionId(decoded.championId);
          setHeroId(decoded.heroId);
          setLevels(decoded.levels);
        }
      }
    } catch {
      // sessizce yoksay — bozuk link bekleyen davranışı bozmasın
    }
  }, []);

  const selectedCards = useMemo(() => CARDS.filter((c) => selectedCardIds.includes(c.id)), [selectedCardIds]);
  const champion = useMemo(() => CHAMPIONS.find((c) => c.id === championId) || null, [championId]);
  const hero = useMemo(() => HEROES.find((h) => h.id === heroId) || null, [heroId]);

  const filteredCards = useMemo(() => {
    return CARDS.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (rarityFilter && c.rarity !== rarityFilter) return false;
      if (roleFilter && c.role !== roleFilter) return false;
      if (ownedOnly && !ownedCardIds.includes(c.id)) return false;
      return true;
    });
  }, [search, rarityFilter, roleFilter, ownedOnly, ownedCardIds]);

  const allRoles = useMemo(() => [...new Set(CARDS.map((c) => c.role))], []);

  const totalCount = selectedCards.length + (champion ? 1 : 0) + (hero ? 1 : 0);
  const evolutionCount = selectedCards.filter((c) => c.evolution).length;
  // Şu an destede aktif olan evrimli kartın kendisi (varsa) — yeni bir evrim eklerken bunun yerini alabilir
  const activeEvolutionCard = selectedCards.find((c) => c.evolution) || null;

  const toggleCard = useCallback((id) => {
    setSelectedCardIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);

      const card = CARDS.find((c) => c.id === id);
      const occupiedSlots = prev.length + (championId ? 1 : 0) + (heroId ? 1 : 0);
      if (occupiedSlots >= 8) return prev;

      // Kural: deste başına en fazla 1 evrimli kart. Yeni eklenen kart evrimliyse
      // ve destede zaten başka bir evrimli kart varsa, eski evrimi otomatik çıkarmak
      // yerine kullanıcıyı şaşırtmamak için ekleme reddedilir.
      if (card?.evolution) {
        const alreadyHasEvolution = prev.some((pid) => CARDS.find((c) => c.id === pid)?.evolution);
        if (alreadyHasEvolution) return prev;
      }

      return [...prev, id];
    });
  }, [championId, heroId]);

  const removeCard = useCallback((id) => setSelectedCardIds((prev) => prev.filter((x) => x !== id)), []);
  const updateLevel = useCallback((id, lvl) => setLevels((prev) => ({ ...prev, [id]: lvl })), []);

  // Kural: Şampiyon ve Kahraman aynı destede birlikte olamaz (ikisi de aynı tek
  // "özel slot"u paylaşır) — biri seçilince diğeri otomatik temizlenir.
  const selectChampion = useCallback((id) => {
    setChampionId((prev) => {
      if (id && id !== prev && selectedCardIds.length + (prev ? 1 : 0) >= 8 && !prev) return prev;
      return id;
    });
    if (id) setHeroId(null);
  }, [selectedCardIds]);

  const selectHero = useCallback((id) => {
    setHeroId((prev) => {
      if (id && id !== prev && selectedCardIds.length + (prev ? 1 : 0) >= 8 && !prev) return prev;
      return id;
    });
    if (id) setChampionId(null);
  }, [selectedCardIds]);

  const removeSpecial = useCallback((kind) => {
    if (kind === "champion") setChampionId(null);
    if (kind === "hero") setHeroId(null);
  }, []);

  const avgElixir = useMemo(() => {
    const all = [...selectedCards, ...(champion ? [champion] : []), ...(hero ? [hero] : [])];
    if (all.length === 0) return "0.0";
    return (all.reduce((s, c) => s + c.elixir, 0) / all.length).toFixed(1);
  }, [selectedCards, champion, hero]);

  const synergyScore = useMemo(() => {
    if (selectedCards.length < 2) return 0;
    const roles = new Set(selectedCards.map((c) => c.role));
    const hasTank = selectedCards.some((c) => c.role === "Tank" || c.role === "Tank-Mini");
    const hasSpell = selectedCards.some((c) => c.role === "Büyü");
    const hasSwarmAnswer = selectedCards.some((c) => c.role === "Sürü" || c.role === "Büyü");
    const evoCount = selectedCards.filter((c) => c.evolution).length;
    let score = roles.size * 9 + (hasTank ? 12 : 0) + (hasSpell ? 10 : 0) + (hasSwarmAnswer ? 8 : 0) + evoCount * 4;
    return Math.max(0, Math.min(100, score));
  }, [selectedCards]);

  const deckSynergies = useMemo(() => getDeckSynergies(selectedCardIds), [selectedCardIds]);

  const upgradePriority = useMemo(() => {
    const all = [...selectedCards, ...(champion ? [champion] : []), ...(hero ? [hero] : [])];
    return all
      .map((c) => ({ id: c.id, name: c.name, level: levels[c.id] ?? 11 }))
      .sort((a, b) => a.level - b.level)
      .slice(0, 5);
  }, [selectedCards, champion, hero, levels]);

  const favoriteCard = useMemo(() => CARDS.find((c) => c.id === favoriteCardId) || null, [favoriteCardId]);

  const toggleFavoriteCard = useCallback((id) => setFavoriteCardId((prev) => (prev === id ? null : id)), []);

  const currentDeckSignature = useMemo(() => {
    const sortedCards = [...selectedCardIds].sort().join(",");
    return `${sortedCards}|${championId || ""}|${heroId || ""}`;
  }, [selectedCardIds, championId, heroId]);

  const isCurrentDeckFavorited = useMemo(
    () => favorites.some((f) => f.signature === currentDeckSignature),
    [favorites, currentDeckSignature]
  );

  const saveFavoriteDeck = useCallback(() => {
    if (totalCount === 0 || isCurrentDeckFavorited) return;
    const items = [
      ...(champion ? [{ id: champion.id, accent: TIER_COLORS[champion.tier], kind: "champion" }] : []),
      ...(hero ? [{ id: hero.id, accent: TIER_COLORS[hero.tier], kind: "hero" }] : []),
      ...selectedCards.map((c) => ({ id: c.id, accent: getElixirColor(c.elixir), kind: c.evolution ? "evo" : "card" })),
    ];
    setFavorites((prev) => [
      { savedAt: Date.now(), signature: currentDeckSignature, items, cardIds: selectedCardIds, championId, heroId, levels, note: "", tags: [] },
      ...prev,
    ]);
    setFavoriteToast(true);
    setTimeout(() => setFavoriteToast(false), 2200);
  }, [totalCount, isCurrentDeckFavorited, champion, hero, selectedCards, selectedCardIds, championId, heroId, levels, currentDeckSignature]);

  const updateFavoriteNote = useCallback((savedAt, note) => {
    setFavorites((prev) => prev.map((f) => (f.savedAt === savedAt ? { ...f, note } : f)));
  }, []);

  const toggleFavoriteTag = useCallback((savedAt, tag) => {
    setFavorites((prev) =>
      prev.map((f) => {
        if (f.savedAt !== savedAt) return f;
        const tags = f.tags || [];
        return { ...f, tags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag] };
      })
    );
  }, []);

  const loadFavorite = useCallback((fav) => {
    setSelectedCardIds(fav.cardIds);
    setChampionId(fav.championId);
    setHeroId(fav.heroId);
    setLevels(fav.levels);
    setActiveTab("builder");
  }, []);

  const deleteFavorite = useCallback((savedAt) => setFavorites((prev) => prev.filter((f) => f.savedAt !== savedAt)), []);

  const shuffleDeck = useCallback(() => {
    const ids = generateRandomDeck();
    setSelectedCardIds(ids);
    setChampionId(null);
    setHeroId(null);
    setActiveTab("builder");
  }, []);

  const importDeck = useCallback((decoded) => {
    setSelectedCardIds(decoded.cardIds.filter((id) => CARDS.some((c) => c.id === id)));
    setChampionId(decoded.championId);
    setHeroId(decoded.heroId);
    setLevels(decoded.levels || {});
  }, []);

  const loadDeckFromCardIds = useCallback((cardIds) => {
    setSelectedCardIds(cardIds);
    setChampionId(null);
    setHeroId(null);
    setActiveTab("builder");
  }, []);

  const shareDeck = useCallback(async () => {
    if (totalCount === 0) return;
    const code = encodeDeck({ cardIds: selectedCardIds, championId, heroId, levels });
    if (!code) return;
    const url = `${window.location.origin}${window.location.pathname}?deste=${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // panoya yazma izni yoksa sessizce geç
    }
  }, [totalCount, selectedCardIds, championId, heroId, levels]);

  const deckContext = useMemo(
    () => ({
      kartlar: selectedCards.map((c) => c.name),
      sampiyon: champion?.name || null,
      kahraman: hero?.name || null,
      ortalamaElixir: avgElixir,
      sinerjiPuani: synergyScore,
    }),
    [selectedCards, champion, hero, avgElixir, synergyScore]
  );

  const tabs = [
    { id: "home", label: "Ana Menü", icon: Crown },
    { id: "builder", label: "Deste Kurucu", icon: Layers },
    { id: "templates", label: "Şablonlar", icon: BookOpen },
    { id: "compare", label: "Karşılaştır", icon: Shield },
    { id: "favorites", label: "Favoriler", icon: Heart },
    { id: "metadecks", label: "Meta Desteler", icon: TrendingUp },
  ];

  const navigateFromHome = useCallback((dest) => {
    if (dest === "assistant") {
      setAssistantOpen(true);
    } else {
      setActiveTab(dest);
    }
  }, []);

  const bgStyle =
    theme === "light"
      ? { background: "radial-gradient(circle at 20% -10%, #e8ecf2, #cfd6e0 55%)" }
      : { background: "radial-gradient(circle at 20% -10%, #18243a, #0a0e1a 55%)" };
  const bgFallbackClass = theme === "light" ? "bg-[#cfd6e0]" : "bg-[#0a0e1a]";

  return (
    <div className={"min-h-screen w-full " + bgFallbackClass} style={bgStyle}>
      <style>{`
        @keyframes deckRowEnter {
          from { opacity: 0; transform: translateX(-8px) scale(0.97); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .deck-row-enter { animation: deckRowEnter 0.25s ease-out; }
      `}</style>
      {/* Üst Bar */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-[#0a0e1a]/85 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => setActiveTab("home")} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #c9a227, #8a6b2e)" }}>
              <Crown className="w-5 h-5 text-[#0a0e1a]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-white font-extrabold text-[17px] sm:text-[19px] tracking-tight leading-tight">Arena Taktik Masası</span>
              <span className="text-[11px] font-semibold text-white/40 leading-tight hidden sm:block">
                {CARDS.length} Kart · {CHAMPIONS.length} Şampiyon · {HEROES.length} Kahraman
              </span>
            </div>
          </button>
          <button onClick={() => setSettingsOpen(true)} className="p-2 hover:bg-white/10 rounded-lg transition">
            <Settings className="w-5 h-5 text-white/75" />
          </button>
        </div>

        {activeTab !== "home" && (
          <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-bold border-b-2 transition whitespace-nowrap ${
                    active ? "text-[#e0c258] border-[#c9a227]" : "text-white/45 border-transparent hover:text-white/80"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5">
        {activeTab === "home" && (
          <HomeScreen onNavigate={navigateFromHome} favoriteCount={favorites.length} />
        )}

        {activeTab === "builder" && (
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <SpecialPicker title="Şampiyon" icon={Crown} items={CHAMPIONS} selectedId={championId} onSelect={selectChampion} kind="champion" lockedByOther={!!heroId} />
              <SpecialPicker title="Kahraman" icon={Wand2} items={HEROES} selectedId={heroId} onSelect={selectHero} kind="hero" lockedByOther={!!championId} />

              <div>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-white/80 text-[13px] font-bold uppercase tracking-wide">
                    <Layers className="w-4 h-4" /> Kartlar
                    <span className="text-white/40 font-medium normal-case">(✦ = evrim mevcut)</span>
                  </div>
                  <button
                    onClick={shuffleDeck}
                    className="flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-full bg-[#c9a227] hover:bg-[#dab542] text-[#0a0e1a] transition shadow-sm"
                    title="Dengeli rastgele deste öner"
                  >
                    <Dices className="w-3.5 h-3.5" /> Rastgele Deste Öner
                  </button>
                </div>

                <FilterBar
                  search={search}
                  onSearch={setSearch}
                  rarityFilter={rarityFilter}
                  onRarityFilter={setRarityFilter}
                  roleFilter={roleFilter}
                  onRoleFilter={setRoleFilter}
                  roles={allRoles}
                  ownedOnly={ownedOnly}
                  onOwnedOnlyChange={setOwnedOnly}
                  ownedCount={ownedCardIds.length}
                />

                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
                  {filteredCards.map((card) => (
                    <div key={card.id} className="flex-shrink-0 w-[88px] snap-start">
                      <CardChip
                        card={card}
                        selected={selectedCardIds.includes(card.id)}
                        onClick={() => toggleCard(card.id)}
                        onShowDetail={setDetailCard}
                        owned={ownedCardIds.includes(card.id)}
                        onToggleOwned={toggleOwned}
                        evolutionLocked={card.evolution && evolutionCount >= 1 && !selectedCardIds.includes(card.id)}
                      />
                    </div>
                  ))}
                  {filteredCards.length === 0 && (
                    <p className="text-center py-8 text-[13px] font-medium text-white/35 w-full">Aramana uyan kart bulunamadı</p>
                  )}
                </div>
                <p className="text-[11px] font-medium text-white/30 mt-1.5">
                  ← Kartları kaydırarak gezebilirsin · En fazla 1 evrim ve 1 şampiyon/kahraman seçilebilir
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <DeckPreview
                cards={selectedCards}
                levels={levels}
                onLevelChange={updateLevel}
                onRemove={removeCard}
                champion={champion}
                hero={hero}
                onRemoveSpecial={removeSpecial}
                onImport={importDeck}
              />

              <DeckAnalysis
                avgElixir={avgElixir}
                synergyScore={synergyScore}
                upgradePriority={upgradePriority}
                favoriteCard={favoriteCard}
                curveItems={[...selectedCards, ...(champion ? [champion] : []), ...(hero ? [hero] : [])]}
                synergies={deckSynergies}
              />

              {selectedCards.length > 0 && (
                <div>
                  <div className="text-[12px] font-bold text-white/65 uppercase tracking-wide mb-1.5">Bu destede en sevdiğin kart</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCards.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => toggleFavoriteCard(c.id)}
                        className={`px-2.5 py-1 rounded-full text-[12px] font-semibold transition flex items-center gap-1.5 ${
                          favoriteCardId === c.id ? "bg-[#7a3b5a]/40 text-[#e8b4cf]" : "bg-white/5 text-white/55 hover:bg-white/10"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${favoriteCardId === c.id ? "fill-[#e8b4cf]" : ""}`} />
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={saveFavoriteDeck}
                  disabled={totalCount === 0 || isCurrentDeckFavorited}
                  className="flex-1 py-3 bg-[#c9a227] hover:bg-[#dab542] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-[#0a0e1a] text-[14px] font-extrabold flex items-center justify-center gap-2 transition"
                >
                  <Star className="w-4 h-4" fill={isCurrentDeckFavorited ? "#0a0e1a" : "none"} />
                  {isCurrentDeckFavorited ? "Favorilerde" : "Favorile"}
                </button>
                <button
                  onClick={shareDeck}
                  disabled={totalCount === 0}
                  className="px-4 py-3 bg-white/[0.07] hover:bg-white/[0.12] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-white text-[14px] font-bold flex items-center justify-center gap-2 transition"
                  title="Deste linkini kopyala"
                >
                  {shareCopied ? <Check className="w-4 h-4 text-[#3a7a5a]" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
              {favoriteToast && (
                <p className="text-[12px] font-semibold text-[#e0c258] text-center flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Favorilere eklendi
                </p>
              )}
              {shareCopied && (
                <p className="text-[12px] font-semibold text-[#8fd4b0] text-center">Link panoya kopyalandı</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "templates" && (
          <DeckTemplatesTab onLoadDeck={loadDeckFromCardIds} />
        )}

        {activeTab === "compare" && (
          <CompareTab myDeckIds={selectedCardIds} onMyDeckChange={setSelectedCardIds} />
        )}

        {activeTab === "favorites" && (
          <FavoritesTab favorites={favorites} onLoad={loadFavorite} onDelete={deleteFavorite} onUpdateNote={updateFavoriteNote} onToggleTag={toggleFavoriteTag} />
        )}

        {activeTab === "metadecks" && (
          <MetaDecksTab onLoadDeck={loadDeckFromCardIds} />
        )}

        <CopyrightNotice />
      </div>

      {/* Sağ alt sabit AI butonu */}
      <button
        onClick={() => setAssistantOpen(true)}
        className="fixed bottom-5 right-5 z-30 w-14 h-14 rounded-full bg-[#c9a227] hover:bg-[#dab542] shadow-lg shadow-black/40 flex items-center justify-center text-2xl transition hover:scale-105"
        title="Domuz Binici'ye sor"
      >
        🐗
      </button>

      <HogRiderAssistant open={assistantOpen} onClose={() => setAssistantOpen(false)} deckContext={deckContext} tone={tone} />
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenAssistant={() => setAssistantOpen(true)}
        tone={tone}
        onToneChange={setTone}
        theme={theme}
        onThemeChange={setTheme}
      />
      <CardDetailModal card={detailCard} onClose={() => setDetailCard(null)} />
    </div>
  );
}
