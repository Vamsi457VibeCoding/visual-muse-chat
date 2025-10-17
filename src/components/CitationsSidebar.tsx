import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { FileText, X, Download } from 'lucide-react';
import { Document } from '@/utils/DocumentStorage';
import { FilePreview } from './FilePreview';

interface Citation {
  id: string;
  documentId: string;
  documentName: string;
  page?: number;
  excerpt?: string;
}

interface CitationsSidebarProps {
  documents: Document[];
  citations?: Citation[];
  onClose?: () => void;
}

const CitationsSidebar: React.FC<CitationsSidebarProps> = ({ 
  documents, 
  citations = [],
  onClose 
}) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const handleClosePreview = () => {
    setSelectedDocument(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <>
      <Card className="h-full flex flex-col bg-card border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Documents & Citations</h3>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1">
          {/* Documents Section */}
          <div className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Referenced Documents</h4>
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents available</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleDocumentClick(doc)}
                    className="w-full p-3 bg-muted/50 hover:bg-muted rounded-lg border border-border transition-colors text-left"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatFileSize(doc.size)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Citations Section */}
          {citations.length > 0 && (
            <div className="p-4 border-t border-border">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Citations</h4>
              <div className="space-y-2">
                {citations.map((citation) => (
                  <div
                    key={citation.id}
                    className="p-3 bg-muted/50 rounded-lg border border-border"
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{citation.documentName}</p>
                        {citation.page && (
                          <p className="text-xs text-muted-foreground mt-1">Page {citation.page}</p>
                        )}
                        {citation.excerpt && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            "{citation.excerpt}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Document Preview Sheet */}
      <Sheet open={selectedDocument !== null} onOpenChange={handleClosePreview}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {selectedDocument?.name}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 h-[calc(100vh-8rem)] overflow-auto">
            {selectedDocument && <FilePreview document={selectedDocument} />}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CitationsSidebar;
