import { useState, useEffect } from 'react';
import { Document } from '@/utils/DocumentStorage';
// Force refresh import
import MessageRenderer from './MessageRenderer';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import * as XLSX from 'xlsx';

interface FilePreviewProps {
  document: Document;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ document }) => {
  const [processedContent, setProcessedContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

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
            setProcessedContent('PDF preview not yet supported. Please download the file to view.');
            break;
            
          case 'doc':
          case 'docx':
            setProcessedContent('Word document preview not yet supported. Please download the file to view.');
            break;
            
          case 'ppt':
          case 'pptx':
            setProcessedContent('PowerPoint preview not yet supported. Please download the file to view.');
            break;
            
          default:
            // For other text files
            setProcessedContent(document.content);
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
      
      <div className="border border-border rounded-lg p-4 bg-muted/20">
        {processedContent.includes('not yet supported') ? (
          <div className="text-center py-8 text-muted-foreground">
            <ExternalLink className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{processedContent}</p>
          </div>
        ) : (
          <MessageRenderer content={processedContent} />
        )}
      </div>
    </div>
  );
};