class LabelaryService {
    private baseUrl = 'https://api.labelary.com/v1/printers';
    private url = 'https://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/';

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Returns a PDF Blob generated from the provided ZPL text, with retry logic for handling rate limits (HTTP 429)
    async generatePdfByText(
        zpl: string,
        options: {
            density?: number;
            width?: number;
            height?: number;
            allLabels?: boolean;
            labelIndex?: number;
        } = {},
        maxRetries: number = 3,
        retryDelayMs: number = 2000
    ): Promise<Blob> {
        const {
            density = 8,
            width = 4,
            height = 6,
            allLabels = true,
            labelIndex = 0,
        } = options;

        const url = allLabels
            ? `${this.baseUrl}/${density}dpmm/labels/${width}x${height}/`
            : `${this.baseUrl}/${density}dpmm/labels/${width}x${height}/${labelIndex}/`;

        const blob = new Blob([zpl], { type: 'text/plain' });
        const formData = new FormData();
        formData.append('file', blob, 'label.zpl');
        formData.append('_charset_', 'UTF-8');

        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/pdf',
                    },
                });

                if (response.status === 429) {
                    if (attempt < maxRetries) {
                        console.warn(`Rate limit hit (429), retrying in ${retryDelayMs}ms... (attempt ${attempt + 1}/${maxRetries})`);
                        await this.delay(retryDelayMs);
                        continue;
                    }
                    throw new Error('Labelary API rate limit exceeded after max retries.');
                }

                if (!response.ok) {
                    throw new Error(`Labelary API error: ${response.status} ${response.statusText}`);
                }

                return await response.blob();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (attempt < maxRetries && lastError.message.includes('429')) {
                    await this.delay(retryDelayMs);
                    continue;
                }
                console.error('Error generating PDF from Labelary API:', error);
            }
        }

        throw lastError ?? new Error('Failed to generate PDF from Labelary API');
    }

    splitLabelText(zpl: string): string[] {
        const labelMark = zpl.startsWith('^XA') ? '^XA' : '\n';
        const parts = zpl.split(labelMark).filter(part => part.trim() !== '');
        return parts.map(part => labelMark + part.trim() + labelMark);
    }

    async generateLabelByText(zpl: string, maxRetries: number = 3, retryDelayMs: number = 2000): Promise<Blob> {
        const blob = new Blob([zpl], { type: 'text/plain' });
        return this.generateLabel(blob, maxRetries, retryDelayMs);
    }

    async generateLabel(zpl: Blob, maxRetries: number = 3, retryDelayMs: number = 2000): Promise<Blob> {
        const formData = new FormData();
        formData.append('file', zpl, 'label.zpl');
        formData.append('_charset_', 'UTF-8');
        
        let lastError: Error | null = null;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {            
                const response = await fetch(this.url, {
                    method: 'POST',
                    body: formData,
                });

                if (response.status === 429) {
                    if (attempt < maxRetries) {
                        console.warn(`Rate limit hit (429), retrying in ${retryDelayMs}ms... (attempt ${attempt + 1}/${maxRetries})`);
                        await this.delay(retryDelayMs);
                        continue;
                    }
                    throw new Error('Labelary API rate limit exceeded after max retries.');
                }

                if (!response.ok) {
                    throw new Error(`Labelary API error: ${response.status} ${response.statusText}`);
                }
                const blob = await response.blob();
                return blob;
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (attempt < maxRetries && lastError.message.includes('429')) {
                    await this.delay(retryDelayMs);
                    continue;
                }
                console.error('Error generating label from Labelary API:', error);
            }
        }
        
        throw lastError ?? new Error('Failed to generate label from Labelary API');
    }
}

export default new LabelaryService;