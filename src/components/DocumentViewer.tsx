import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Folder, 
  File, 
  Search, 
  MoreVertical, 
  Trash2, 
  Eye, 
  X,
  FolderPlus,
  Upload,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  Files
} from 'lucide-react';
import { DocumentStorage, Document } from '@/utils/DocumentStorage';
import { useToast } from '@/hooks/use-toast';
import { FilePreview } from './FilePreview';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DocumentViewerProps {
  onClose: () => void;
  onUploadClick: () => void;
  onDocumentSelect?: (document: Document) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  onClose, 
  onUploadClick, 
  onDocumentSelect 
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    const docs = DocumentStorage.getDocuments();
    const folderList = DocumentStorage.getFolders();
    setDocuments(docs);
    setFolders(['All', ...folderList]);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesFolder = selectedFolder === 'All' || doc.folder === selectedFolder;
    const matchesSearch = searchQuery === '' || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFolder && matchesSearch;
  });

  const deleteDocument = (docId: string) => {
    DocumentStorage.deleteDocument(docId);
    loadDocuments();
    toast({
      title: "Document deleted",
      description: "Document has been removed",
    });
  };

  const createFolder = () => {
    if (newFolderName.trim()) {
      DocumentStorage.createFolder(newFolderName.trim());
      loadDocuments();
      setNewFolderName('');
      setShowCreateFolder(false);
      toast({
        title: "Folder created",
        description: `Folder "${newFolderName}" has been created`,
      });
    }
  };

  const deleteFolder = (folderName: string) => {
    DocumentStorage.deleteFolder(folderName);
    loadDocuments();
    setSelectedFolder('All');
    toast({
      title: "Folder deleted",
      description: `Folder "${folderName}" has been removed`,
    });
  };

  const previewDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowPreview(true);
  };

  const selectDocument = (document: Document) => {
    onDocumentSelect?.(document);
    toast({
      title: "Document selected",
      description: `"${document.name}" is now available in chat context`,
    });
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'pdf':
        return <Files className="w-4 h-4 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <FileVideo className="w-4 h-4 text-orange-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'webp':
        return <FileImage className="w-4 h-4 text-purple-500" />;
      case 'md':
      case 'markdown':
        return <FileText className="w-4 h-4 text-gray-500" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card className="w-full max-w-2xl h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-foreground">Documents</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCreateFolder(true)}>
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
            <Button variant="outline" size="sm" onClick={onUploadClick}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Folder Tabs */}
        <div className="flex gap-1 overflow-x-auto">
          {folders.map(folder => (
            <Button
              key={folder}
              variant={selectedFolder === folder ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedFolder(folder)}
              className="whitespace-nowrap"
            >
              {folder === 'All' ? 'All' : (
                <div className="flex items-center gap-1">
                  <Folder className="w-3 h-3" />
                  {folder}
                </div>
              )}
              {folder !== 'All' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="ml-1 h-4 w-4 p-0">
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem 
                      onClick={() => deleteFolder(folder)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Folder
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Document List */}
      <ScrollArea className="flex-1 p-4">
        {filteredDocuments.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No documents found</p>
            <p className="text-sm">Upload some documents to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDocuments.map(document => (
              <div
                key={document.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(document.name)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{document.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{DocumentStorage.formatFileSize(document.size)}</span>
                      <span>•</span>
                      <span>{formatDate(document.uploadDate)}</span>
                      <Badge variant="outline" className="text-xs">
                        {document.folder}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selectDocument(document)}
                    title="Add to chat context"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => previewDocument(document)}
                    title="Preview document"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => previewDocument(document)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => deleteDocument(document.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createFolder()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
                Cancel
              </Button>
              <Button onClick={createFolder} disabled={!newFolderName.trim()}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDocument && getFileIcon(selectedDocument.name)}
              {selectedDocument?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] mt-4">
            {selectedDocument && <FilePreview document={selectedDocument} />}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DocumentViewer;