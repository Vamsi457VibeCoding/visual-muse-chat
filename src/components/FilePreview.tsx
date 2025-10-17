import { useState, useEffect } from 'react';
import { Document as DocStorageType } from '@/utils/DocumentStorage';
import MessageRenderer from './MessageRenderer';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Document as PDFDocument, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface FilePreviewProps {
  document: DocStorageType;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ document }) => {
  const [processedContent, setProcessedContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfData, setPdfData] = useState<string | null>(null);

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  const processExcelContent = async (content: string) => {
    try {
      // For Excel files, we expect base64 content
      const workbook = XLSX.read(content, { type: 'base64' });
      let result = '';
      
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const csvContent = XLSX.utils.sheet_to_csv(sheet);
        result += `## Sheet: ${sheetName}\n\n`;
        result += '```csv\n' + csvContent + '\n```\n\n';
      });
      
      return result;
    } catch (error) {
      console.error('Error processing Excel file:', error);
      return 'Error: Unable to process Excel file content.';
    }
  };

  const processImageContent = (fileName: string, content: string) => {
    try {
      // If content is base64, create data URL
      const isBase64 = content.includes('base64') || !content.startsWith('http');
      const imageSrc = isBase64 
        ? (content.startsWith('data:') ? content : `data:image/${getFileExtension(fileName)};base64,${content}`)
        : content;
      
      return `![${fileName}](${imageSrc})`;
    } catch (error) {
      console.error('Error processing image:', error);
      return 'Error: Unable to display image.';
    }
  };

  useEffect(() => {
    const processContent = async () => {
      setLoading(true);
      const ext = getFileExtension(document.name);
      
      try {
        switch (ext) {
          case 'md':
          case 'markdown':
            setProcessedContent(document.content);
            break;
            
          case 'txt':
          case 'log':
            setProcessedContent('```\n' + document.content + '\n```');
            break;
            
          case 'xls':
          case 'xlsx':
            const excelContent = await processExcelContent(document.content);
            setProcessedContent(excelContent);
            break;
            
          case 'csv':
            setProcessedContent('```csv\n' + document.content + '\n```');
            break;
            
          case 'json':
            try {
              const formatted = JSON.stringify(JSON.parse(document.content), null, 2);
              setProcessedContent('```json\n' + formatted + '\n```');
            } catch {
              setProcessedContent('```json\n' + document.content + '\n```');
            }
            break;
            
          case 'jpg':
          case 'jpeg':
          case 'png':
          case 'gif':
          case 'svg':
          case 'webp':
            const imageMarkdown = processImageContent(document.name, document.content);
            setProcessedContent(imageMarkdown);
            break;
            
          case 'pdf':
            // Prepare PDF data for react-pdf
            const pdfBase64 = document.content.startsWith('data:') 
              ? document.content 
              : `data:application/pdf;base64,${document.content}`;
            setPdfData(pdfBase64);
            setProcessedContent(''); // Clear text content for PDF
            break;
            
          case 'doc':
          case 'docx':
            setProcessedContent('**Word Document Preview**\n\nTo view the full document, please download the file. DOCX files require special processing for complete preview.');
            break;
            
          case 'ppt':
          case 'pptx':
            setProcessedContent('**PowerPoint Preview**\n\nTo view the full presentation, please download the file.');
            break;
            
          default:
            // For other text files
            setProcessedContent('```\n' + document.content + '\n```');
        }
      } catch (error) {
        console.error('Error processing file content:', error);
        setProcessedContent('Error: Unable to process file content.');
      } finally {
        setLoading(false);
      }
    };

    processContent();
  }, [document]);

  const downloadFile = () => {
    const ext = getFileExtension(document.name);
    let blob: Blob;
    
    if (['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
      // Handle binary files (base64)
      try {
        const binaryString = atob(document.content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: document.type });
      } catch {
        blob = new Blob([document.content], { type: 'text/plain' });
      }
    } else {
      // Handle text files
      blob = new Blob([document.content], { type: document.type || 'text/plain' });
    }
    
    const url = URL.createObjectURL(blob);
    const linkElement = globalThis.document.createElement('a');
    linkElement.href = url;
    linkElement.download = document.name;
    globalThis.document.body.appendChild(linkElement);
    linkElement.click();
    globalThis.document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-muted-foreground">Loading preview...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          File size: {(document.size / 1024).toFixed(1)} KB
        </div>
        <Button variant="outline" size="sm" onClick={downloadFile}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
      
      <div className="border border-border rounded-lg p-4 bg-muted/20 max-h-[600px] overflow-auto">
        {pdfData ? (
          <div className="space-y-4">
            <PDFDocument
              file={pdfData}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center h-40">
                  <div className="text-muted-foreground">Loading PDF...</div>
                </div>
              }
            >
              <Page 
                pageNumber={pageNumber} 
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="mx-auto"
                width={Math.min(window.innerWidth * 0.4, 600)}
              />
            </PDFDocument>
            
            {numPages && numPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousPage}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pageNumber} of {numPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={pageNumber >= numPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ) : processedContent.includes('not yet supported') || processedContent.includes('require special processing') ? (
          <div className="text-center py-8 text-muted-foreground">
            <ExternalLink className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <MessageRenderer content={processedContent} />
          </div>
        ) : (
          <MessageRenderer content={processedContent} />
        )}
      </div>
    </div>
  );
};