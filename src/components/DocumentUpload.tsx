import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Upload, Plus, X, File, AlertCircle } from 'lucide-react';
import { DocumentStorage, Document } from '@/utils/DocumentStorage';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  onDocumentUploaded: (document: Document) => void;
  onClose: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onDocumentUploaded, onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('General');
  const [newFolder, setNewFolder] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const folders = DocumentStorage.getFolders();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (!DocumentStorage.isTextFile(file) && !DocumentStorage.isImageFile(file) && !DocumentStorage.isBinaryFile(file)) {
        toast({
          title: "Unsupported file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for all files
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const createNewFolder = () => {
    if (newFolder.trim() && !folders.includes(newFolder.trim())) {
      DocumentStorage.createFolder(newFolder.trim());
      setSelectedFolder(newFolder.trim());
      setNewFolder('');
      toast({
        title: "Folder created",
        description: `Created folder "${newFolder.trim()}"`,
      });
    }
  };

  const uploadDocuments = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (const file of selectedFiles) {
      try {
        const content = await DocumentStorage.readFileAsText(file);
        const document: Document = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type || 'text/plain',
          size: file.size,
          content,
          uploadDate: new Date(),
          folder: selectedFolder,
        };

        DocumentStorage.saveDocument(document);
        onDocumentUploaded(document);
        successCount++;
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    setIsUploading(false);
    setSelectedFiles([]);

    toast({
      title: "Upload complete",
      description: `Successfully uploaded ${successCount} document(s)`,
    });

    if (successCount > 0) {
      onClose();
    }
  };

  return (
    <Card className="p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Upload Documents</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* File Selection */}
      <div className="space-y-4">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.md,.csv,.json,.html,.css,.js,.ts,.jsx,.tsx,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.svg,.webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Select Files
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            Supported: Text files, Images (JPG, PNG, GIF, SVG, WebP), PDFs, MS Office files (max 10MB each)
          </p>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Selected Files:</h4>
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {DocumentStorage.formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Folder Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Folder:</label>
          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {folders.map(folder => (
                <SelectItem key={folder} value={folder}>
                  {folder}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* New Folder */}
        <div className="flex gap-2">
          <Input
            placeholder="New folder name"
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createNewFolder()}
          />
          <Button variant="outline" size="sm" onClick={createNewFolder}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Upload Button */}
        <Button
          onClick={uploadDocuments}
          disabled={selectedFiles.length === 0 || isUploading}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
        </Button>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded">
          <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <p>Documents are stored locally in your browser.</p>
            <p>The AI can reference uploaded documents in conversations.</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DocumentUpload;