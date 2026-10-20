import { decryptText, encryptText, isEncryptedFile } from '@/platform/crypto';
import { exportData, importData, type KeyValueStorage } from './repositories/local';

/** Backup para baixar. Com senha, o arquivo vai cifrado (AES-GCM): sem a senha, ninguém lê. */
export async function makeBackup(storage: KeyValueStorage, now: Date, password: string): Promise<string> {
  if (password.trim().length < 8) throw new Error('Crie uma senha de pelo menos 8 caracteres para o backup.');
  const plain = exportData(storage, now);
  return JSON.stringify(await encryptText(plain, password));
}

/** Restaura backup comum ou cifrado. Diz quando falta a senha em vez de falhar calado. */
export async function restoreBackup(storage: KeyValueStorage, text: string, password?: string): Promise<void> {
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    // importData dá a mensagem certa.
  }
  if (isEncryptedFile(parsed)) {
    if (!password) throw new Error('Esse backup tem senha. Digite a senha e toque em Restaurar de novo.');
    importData(storage, await decryptText(parsed, password));
    return;
  }
  importData(storage, text);
}
