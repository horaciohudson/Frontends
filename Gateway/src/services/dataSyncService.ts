import api from './api';
import { ExportRequest, ImportResult } from '../types';

export const dataSyncService = {
    async exportData(request: ExportRequest): Promise<Blob> {
        const response = await api.post('/data/export', request, {
            responseType: 'blob',
        });
        return response.data;
    },

    async importData(
        module: string,
        entity: string,
        file: File
    ): Promise<ImportResult> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<ImportResult>(
            `/data/import/${module}/${entity}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    downloadFile(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },
};
