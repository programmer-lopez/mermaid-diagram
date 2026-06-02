import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UrlStorageService {

    // --- Compression / Decompression (DEFLATE + Base64) ---

    async compress(target: string): Promise<string> {
        const arrayBufferToBinaryString = (buf: ArrayBuffer): string => {
            const bytes = new Uint8Array(buf);
            let bin = '';
            for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
            return bin;
        };
        const blob = new Blob([target]);
        const compressed = blob.stream().pipeThrough(new CompressionStream('deflate'));
        const buf = await new Response(compressed).arrayBuffer();
        return btoa(arrayBufferToBinaryString(buf));
    }

    async decompress(target: string): Promise<string> {
        const binaryStringToBytes = (str: string): ArrayBuffer => {
            const buf = new ArrayBuffer(str.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i < str.length; i++) view[i] = str.charCodeAt(i);
            return buf;
        };
        const bytes = binaryStringToBytes(atob(target));
        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
        return await new Response(stream).text();
    }

    // --- URL hash storage (for Mermaid text) ---

    async getText(): Promise<string | null> {
        const hash = new URL(window.location.href).hash.slice(1);
        if (!hash) return null;
        try {
            return await this.decompress(hash);
        } catch {
            console.info('Failed to decompress; treating as URL-encoded text.');
            return decodeURIComponent(hash);
        }
    }

    async setText(value: string): Promise<void> {
        window.history.replaceState({}, '', '#' + await this.compress(value));
    }

    // --- Query param storage (for sequence-number) ---

    get(key: string): string | null {
        return new URL(window.location.href).searchParams.get(key);
    }

    set(key: string, value: string): void {
        const url = new URL(window.location.href);
        url.searchParams.set(key, value);
        window.history.replaceState({}, '', url.toString());
    }
}
