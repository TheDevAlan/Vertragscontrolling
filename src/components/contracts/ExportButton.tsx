'use client';

import { useState } from 'react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ExportButtonProps {
  contractId: string;
  contractNumber: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const ExportButton = ({ 
  contractId, 
  contractNumber,
  variant = 'secondary' 
}: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const response = await fetch(`/api/contracts/${contractId}/export`);
      
      if (!response.ok) {
        throw new Error('Export fehlgeschlagen');
      }

      // Blob aus Response erstellen
      const blob = await response.blob();
      
      // Download-Link erstellen und klicken
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Vertrag_${contractNumber}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Fehler beim Exportieren des Vertrags');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleExport}
      disabled={isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Exportiere...
        </>
      ) : (
        <>
          <FileSpreadsheet className="w-4 h-4" />
          Excel Export
        </>
      )}
    </Button>
  );
};

