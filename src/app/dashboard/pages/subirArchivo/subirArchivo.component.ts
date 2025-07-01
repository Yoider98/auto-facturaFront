import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface FileItem {
  file: File;
  name: string;
  size: number;
  uploading: boolean;
  uploaded: boolean;
  error: boolean;
  errorMessage?: string;
  xmlResults?: { filename: string, status: string, message: string }[];
}

@Component({
  selector: 'app-subirArchivo',
  templateUrl: './subirArchivo.component.html',
  styleUrls: ['./subirArchivo.component.css']
})
export class SubirArchivoComponent implements OnInit {
  selectedFiles: FileItem[] = [];
  isDragOver = false;
  isUploading = false;
  uploadProgress = 0;
  uploadSuccess = '';
  uploadError = '';

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  // Drag & Drop handlers
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer.files;
    if (files) {
      this.processFiles(Array.from(files));
    }
  }

  // File selection handler
  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      this.processFiles(Array.from(files));
    }
  }

  // Process selected files
  processFiles(files: File[]) {
    files.forEach(file => {
      if (this.isValidZipFile(file)) {
        const fileItem: FileItem = {
          file: file,
          name: file.name,
          size: file.size,
          uploading: false,
          uploaded: false,
          error: false
        };
        
        // Check if file is already in the list
        const exists = this.selectedFiles.find(f => f.name === file.name);
        if (!exists) {
          this.selectedFiles.push(fileItem);
        }
      } else {
        this.uploadError = `El archivo "${file.name}" no es un archivo ZIP válido.`;
        setTimeout(() => this.uploadError = '', 5000);
      }
    });
  }

  // Validate ZIP file
  isValidZipFile(file: File): boolean {
    return file.type === 'application/zip' || 
           file.type === 'application/x-zip-compressed' ||
           file.name.toLowerCase().endsWith('.zip');
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Remove file from list
  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  // Clear all files
  clearFiles() {
    this.selectedFiles = [];
    this.uploadSuccess = '';
    this.uploadError = '';
  }

  // Check if can upload
  canUpload(): boolean {
    return this.selectedFiles.length > 0 && 
           this.selectedFiles.some(f => !f.uploading && !f.uploaded);
  }

  // Utilidad para obtener el nombre base sin extensión
  getBaseName(filename: string): string {
    return filename.replace(/\.[^/.]+$/, "");
  }

  // Upload files
  async uploadFiles() {
    if (!this.canUpload()) return;

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadSuccess = '';
    this.uploadError = '';

    const filesToUpload = this.selectedFiles.filter(f => !f.uploaded);
    const totalFiles = filesToUpload.length;

    try {
      // Marcar todos los archivos como subiendo
      filesToUpload.forEach(file => file.uploading = true);
      
      // Crear FormData con todos los archivos
      const formData = new FormData();
      filesToUpload.forEach(fileItem => {
        formData.append('zip', fileItem.file);
      });

      // Simular progreso durante la carga
      const progressInterval = setInterval(() => {
        if (this.uploadProgress < 90) {
          this.uploadProgress += Math.random() * 10;
        }
      }, 200);

      // Enviar todos los archivos en una sola petición
      const result: any = await this.http.post('https://auto-factura.onrender.com/unzip', formData).toPromise();
      clearInterval(progressInterval);
      this.uploadProgress = 100;

      // Limpiar resultados previos
      this.selectedFiles.forEach(f => {
        f.xmlResults = [];
        f.uploading = false;
        f.uploaded = false;
        f.error = false;
        f.errorMessage = '';
      });

      if (Array.isArray(result)) {
      
        this.selectedFiles.forEach(fileItem => {
          const zipBaseName = this.getBaseName(fileItem.name).toLowerCase().replace(/\s/g, '');
        
          // Extrae solo los números del nombre del zip
          const zipNumber = zipBaseName.replace(/[^\d]/g, '');
        
          let xmlResult: any = null;
        
          for (const group of result) {
            if (Array.isArray(group.files) && group.files.length > 0) {
              const xmlFile = group.files[0];
              const xmlBaseName = this.getBaseName(xmlFile.filename).toLowerCase().replace(/\s/g, '');
        
              // Extrae solo los números del XML
              const xmlNumber = xmlBaseName.replace(/[^\d]/g, '');
        
              if (zipNumber === xmlNumber) {
                xmlResult = xmlFile;
                break;
              }
            }
          }
        
          if (xmlResult) {
            fileItem.xmlResults = [xmlResult];
            fileItem.uploaded = xmlResult.status === 'success';
            fileItem.error = xmlResult.status !== 'success';
            fileItem.errorMessage = xmlResult.message;
          } else {
            fileItem.xmlResults = [];
            fileItem.uploaded = false;
            fileItem.error = true;
            fileItem.errorMessage = 'No se encontró respuesta para este archivo ZIP.';
          }
        });
      }
      
      
      

      // Mensaje global de éxito si al menos uno fue exitoso
      const successCount = this.selectedFiles.filter(f => f.uploaded).length;
      if (successCount > 0) {
        this.uploadSuccess = `Se procesaron correctamente ${successCount} archivo(s) ZIP.`;
        setTimeout(() => this.uploadSuccess = '', 5000);
      }
      // Mensaje global de error si todos fallaron
      if (successCount === 0) {
        this.uploadError = 'Todos los archivos tuvieron error al procesarse.';
        setTimeout(() => this.uploadError = '', 8000);
      }

    } catch (error) {
      // Marcar todos los archivos como error
      filesToUpload.forEach(file => {
        file.uploading = false;
        file.error = true;
        file.errorMessage = 'Error al procesar el archivo';
      });
      this.uploadError = 'Error al procesar los archivos ZIP';
      setTimeout(() => this.uploadError = '', 8000);
    }

    this.isUploading = false;
  }
}
