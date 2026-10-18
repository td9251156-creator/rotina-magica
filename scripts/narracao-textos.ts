// Lista os avisos e os passos das vivências para o gerador de narração: npx vite-node scripts/narracao-textos.ts
import { extraNarration } from '../src/domain/narration';

console.log(JSON.stringify(extraNarration(), null, 1));
