import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ÖNEMLİ: "base" değerini kendi repo adınla değiştir.
// Örnek: repo adın "arena-taktik-masasi" ise base "/arena-taktik-masasi/" olmalı.
// Kullanıcı adın.github.io gibi bir repo kullanıyorsan base "/" yap.
export default defineConfig({
  plugins: [react()],
  base: "/arena-taktik-masasi/",
});
