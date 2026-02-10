class LabelaryService {
    private url = 'https://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/';

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
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