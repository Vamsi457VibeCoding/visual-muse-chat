export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  uploadDate: Date;
  folder: string;
}

export interface Folder {
  name: string;
  path: string;
  documents: Document[];
  subfolders: Folder[];
}

export class DocumentStorage {
  private static STORAGE_KEY = 'visual_mind_documents';
  private static FOLDERS_KEY = 'visual_mind_folders';

  static getDocuments(): Document[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    try {
      const docs = JSON.parse(stored);
      return docs.map((doc: any) => ({
        ...doc,
        uploadDate: new Date(doc.uploadDate)
      }));
    } catch {
      return [];
    }
  }

  static getFolders(): string[] {
    const stored = localStorage.getItem(this.FOLDERS_KEY);
    if (!stored) return ['General'];
    
    try {
      return JSON.parse(stored);
    } catch {
      return ['General'];
    }
  }

  static saveDocument(document: Document): void {
    const documents = this.getDocuments();
    documents.push(document);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(documents));
  }

  static deleteDocument(id: string): void {
    const documents = this.getDocuments().filter(doc => doc.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(documents));
  }

  static createFolder(folderName: string): void {
    const folders = this.getFolders();
    if (!folders.includes(folderName)) {
      folders.push(folderName);
      localStorage.setItem(this.FOLDERS_KEY, JSON.stringify(folders));
    }
  }

  static deleteFolder(folderName: string): void {
    if (folderName === 'General') return; // Can't delete default folder
    
    const folders = this.getFolders().filter(f => f !== folderName);
    localStorage.setItem(this.FOLDERS_KEY, JSON.stringify(folders));
    
    // Move documents from deleted folder to General
    const documents = this.getDocuments().map(doc => ({
      ...doc,
      folder: doc.folder === folderName ? 'General' : doc.folder
    }));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(documents));
  }

  static getDocumentsByFolder(folderName: string): Document[] {
    return this.getDocuments().filter(doc => doc.folder === folderName);
  }

  static async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      if (this.isImageFile(file)) {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      } else if (this.isBinaryFile(file)) {
        reader.onload = (e) => {
          const result = e.target?.result as ArrayBuffer;
          const base64 = btoa(new Uint8Array(result).reduce((data, byte) => data + String.fromCharCode(byte), ''));
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      } else {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      }
    });
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static isTextFile(file: File): boolean {
    const textTypes = [
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/json',
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript'
    ];
    
    const textExtensions = ['.txt', '.md', '.csv', '.json', '.html', '.css', '.js', '.ts', '.jsx', '.tsx'];
    
    return textTypes.includes(file.type) || 
           textExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  }

  static isImageFile(file: File): boolean {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
    
    return imageTypes.includes(file.type) || 
           imageExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  }

  static isBinaryFile(file: File): boolean {
    const binaryExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
    return binaryExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  }
}