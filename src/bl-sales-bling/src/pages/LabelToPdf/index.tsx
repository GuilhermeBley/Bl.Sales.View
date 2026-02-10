import React, { useState, useRef, useEffect } from 'react';
import { Container, Card, Button, ProgressBar, Alert, Form } from 'react-bootstrap';
import { jsPDF } from 'jspdf';
import Navbar from '../../components/Navbar';
import labelaryService from '../../services/labelaryService';
import LocalStorageManager from '../../services/localStorageService';

interface LabelProcessResult {
    index: number;
    success: boolean;
    imageDataUrl?: string;
    error?: string;
}

const MAX_FILE_SIZE_MB = 64;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const REQUEST_DELAY_MS = 500; // Delay between requests to avoid rate limiting
const DEFAULT_MAX_PDF_PAGES = 200;
const MAX_PDF_PAGES_STORAGE_KEY = 'labelToPdf_maxPdfPages';

const maxPdfPagesStorage = new LocalStorageManager<number>(MAX_PDF_PAGES_STORAGE_KEY);

const LabelToPdf: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [maxPdfPages, setMaxPdfPages] = useState<number>(DEFAULT_MAX_PDF_PAGES);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentLabel, setCurrentLabel] = useState(0);
    const [totalLabels, setTotalLabels] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<LabelProcessResult[]>([]);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const storedMaxPages = maxPdfPagesStorage.get();
        if (storedMaxPages !== null && storedMaxPages > 0) {
            setMaxPdfPages(storedMaxPages);
        }
    }, []);

    const handleMaxPdfPagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value, 10);
        if (!isNaN(value) && value > 0) {
            setMaxPdfPages(value);
            maxPdfPagesStorage.set(value);
        }
    };

    const delay = (ms: number): Promise<void> => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        setError(null);
        setResults([]);
        setProgress(0);
        setStatusMessage('');

        if (!selectedFile) {
            setFile(null);
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            setError(`O arquivo excede o limite de ${MAX_FILE_SIZE_MB}MB.`);
            setFile(null);
            return;
        }

        if (!selectedFile.name.endsWith('.txt')) {
            setError('Por favor, selecione um arquivo .txt.');
            setFile(null);
            return;
        }

        setFile(selectedFile);
    };

    const blobToDataUrl = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const processLabels = async () => {
        if (!file) {
            setError('Por favor, selecione um arquivo.');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setResults([]);
        setProgress(0);

        try {
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim().length > 0);
            
            if (lines.length === 0) {
                setError('O arquivo está vazio ou não contém linhas válidas.');
                setIsProcessing(false);
                return;
            }

            setTotalLabels(lines.length);
            const processedResults: LabelProcessResult[] = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                setCurrentLabel(i + 1);
                setStatusMessage(`Processando etiqueta ${i + 1} de ${lines.length}...`);
                setProgress(Math.round(((i + 1) / lines.length) * 100));

                try {
                    const pngBlob = await labelaryService.generateLabelByText(line, 3, 2000);
                    const dataUrl = await blobToDataUrl(pngBlob);
                    
                    processedResults.push({
                        index: i,
                        success: true,
                        imageDataUrl: dataUrl
                    });
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
                    processedResults.push({
                        index: i,
                        success: false,
                        error: errorMessage
                    });
                    console.error(`Erro ao processar etiqueta ${i + 1}:`, err);
                }
                finally {
                    await delay(REQUEST_DELAY_MS); // Delay to avoid hitting rate limits
                }
            }

            setResults(processedResults);
            const successCount = processedResults.filter(r => r.success).length;
            setStatusMessage(`Processamento concluído: ${successCount} de ${lines.length} etiquetas processadas com sucesso.`);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(`Erro ao processar arquivo: ${errorMessage}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const generatePdf = async () => {
        const allSuccessfulResults = results.filter(r => r.success && r.imageDataUrl);
        
        if (allSuccessfulResults.length === 0) {
            setError('Nenhuma etiqueta foi processada com sucesso.');
            return;
        }

        // Split results into chunks based on maxPdfPages
        const chunks: LabelProcessResult[][] = [];
        for (let i = 0; i < allSuccessfulResults.length; i += maxPdfPages) {
            chunks.push(allSuccessfulResults.slice(i, i + maxPdfPages));
        }

        const totalPdfs = chunks.length;
        setStatusMessage(`Gerando ${totalPdfs} PDF(s)...`);

        try {
            // Create PDF with 4x6 inch label size (in mm: 101.6 x 152.4)
            const labelWidthMm = 101.6;
            const labelHeightMm = 152.4;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

            for (let pdfIndex = 0; pdfIndex < chunks.length; pdfIndex++) {
                const chunk = chunks[pdfIndex];
                
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: [labelWidthMm, labelHeightMm]
                });

                for (let i = 0; i < chunk.length; i++) {
                    const result = chunk[i];
                    
                    if (i > 0) {
                        pdf.addPage([labelWidthMm, labelHeightMm], 'portrait');
                    }

                    if (result.imageDataUrl) {
                        pdf.addImage(
                            result.imageDataUrl,
                            'PNG',
                            0,
                            0,
                            labelWidthMm,
                            labelHeightMm
                        );
                    }
                }

                // Download the PDF with part number if multiple PDFs
                const partSuffix = totalPdfs > 1 ? `_parte${pdfIndex + 1}de${totalPdfs}` : '';
                pdf.save(`etiquetas_${timestamp}${partSuffix}.pdf`);
                
                // Small delay between PDF downloads to avoid browser blocking
                if (pdfIndex < chunks.length - 1) {
                    await delay(500);
                }
            }

            const pdfMessage = totalPdfs > 1 
                ? `${totalPdfs} PDFs gerados com sucesso! Total: ${allSuccessfulResults.length} etiquetas.`
                : `PDF gerado com sucesso! ${allSuccessfulResults.length} etiquetas incluídas.`;
            setStatusMessage(pdfMessage);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(`Erro ao gerar PDF: ${errorMessage}`);
        }
    };

    const resetForm = () => {
        setFile(null);
        setResults([]);
        setProgress(0);
        setError(null);
        setStatusMessage('');
        setCurrentLabel(0);
        setTotalLabels(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    const pdfCount = Math.ceil(successCount / maxPdfPages);

    return (
        <div className="min-vh-100 bg-light">
            <Navbar />
            <Container className="py-4">
                <Card>
                    <Card.Header className="bg-primary text-white">
                        <h4 className="mb-0">Gerar PDF de Etiquetas</h4>
                    </Card.Header>
                    <Card.Body>
                        <p className="text-muted mb-4">
                            Selecione um arquivo .txt onde cada linha representa uma etiqueta ZPL.
                            O sistema irá converter cada etiqueta em imagem e gerar um PDF.
                        </p>

                        <div className="row mb-4">
                            <div className="col-md-8">
                                <Form.Group>
                                    <Form.Label>Arquivo de Etiquetas (.txt)</Form.Label>
                                    <Form.Control
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".txt"
                                        onChange={handleFileChange}
                                        disabled={isProcessing}
                                    />
                                    <Form.Text className="text-muted">
                                        Tamanho máximo: {MAX_FILE_SIZE_MB}MB
                                    </Form.Text>
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group>
                                    <Form.Label>Máximo de páginas no PDF</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        value={maxPdfPages}
                                        onChange={handleMaxPdfPagesChange}
                                        disabled={isProcessing}
                                    />
                                    <Form.Text className="text-muted">
                                        Limite de etiquetas por PDF
                                    </Form.Text>
                                </Form.Group>
                            </div>
                        </div>

                        {error && (
                            <Alert variant="danger" dismissible onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}

                        {statusMessage && !error && (
                            <Alert variant="info">
                                {statusMessage}
                            </Alert>
                        )}

                        {isProcessing && (
                            <div className="mb-4">
                                <ProgressBar 
                                    now={progress} 
                                    label={`${progress}%`} 
                                    animated 
                                    striped 
                                />
                                <p className="text-center mt-2 text-muted">
                                    Processando etiqueta {currentLabel} de {totalLabels}
                                </p>
                            </div>
                        )}

                        {results.length > 0 && !isProcessing && (
                            <div className="mb-4">
                                <h5>Resultado do Processamento</h5>
                                <div className="d-flex gap-3">
                                    <span className="badge bg-success fs-6">
                                        ✓ Sucesso: {successCount}
                                    </span>
                                    {errorCount > 0 && (
                                        <span className="badge bg-danger fs-6">
                                            ✗ Erros: {errorCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="d-flex gap-2 flex-wrap">
                            <Button
                                variant="primary"
                                onClick={processLabels}
                                disabled={!file || isProcessing}
                            >
                                {isProcessing ? 'Processando...' : 'Processar Etiquetas'}
                            </Button>

                            <Button
                                variant="success"
                                onClick={generatePdf}
                                disabled={successCount === 0 || isProcessing}
                            >
                                Gerar {pdfCount > 1 ? `${pdfCount} PDFs` : 'PDF'} ({successCount} etiquetas)
                            </Button>

                            <Button
                                variant="secondary"
                                onClick={resetForm}
                                disabled={isProcessing}
                            >
                                Limpar
                            </Button>
                        </div>

                        {errorCount > 0 && !isProcessing && (
                            <div className="mt-4">
                                <h5 className="text-danger">Etiquetas com Erro</h5>
                                <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {results.filter(r => !r.success).map((result) => (
                                        <div key={result.index} className="text-danger small">
                                            Linha {result.index + 1}: {result.error}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default LabelToPdf;
