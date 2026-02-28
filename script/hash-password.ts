/**
 * Genera un hash bcrypt para usar como ADMIN_PASSWORD_HASH en .env
 * Uso: node script/hash-password.js "tu_contraseña"
 * o:   npx tsx script/hash-password.ts "tu_contraseña"
 */
import bcrypt from "bcrypt";

const password = process.argv[2];
if (!password) {
  console.error("Uso: npx tsx script/hash-password.ts <contraseña>");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
console.log("\nPega esto en tu .env como ADMIN_PASSWORD_HASH:\n");
console.log("ADMIN_PASSWORD_HASH=" + hash);
console.log("");
