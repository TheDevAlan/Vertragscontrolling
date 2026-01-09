'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Eye, Pencil, Trash2, MoreHorizontal, Search } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate, formatCurrency, getStatusText, daysUntil } from '@/lib/utils';
import type { ContractWithType } from '@/types';

interface ContractTableProps {
  contracts: ContractWithType[];
}

export const ContractTable = ({ contracts }: ContractTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filtern der Verträge
  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.partner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || contract.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'TERMINATED':
        return 'warning';
      case 'EXPIRED':
        return 'danger';
      default:
        return 'default';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diesen Vertrag wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/contracts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Fehler beim Löschen des Vertrags');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Fehler beim Löschen des Vertrags');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter-Leiste */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Suchen nach Titel, Partner oder Vertragsnummer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
        >
          <option value="all">Alle Status</option>
          <option value="ACTIVE">Aktiv</option>
          <option value="TERMINATED">Gekündigt</option>
          <option value="EXPIRED">Abgelaufen</option>
          <option value="DRAFT">Entwurf</option>
        </select>
      </div>

      {/* Tabelle */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vertragsnr.</TableHead>
              <TableHead>Bezeichnung</TableHead>
              <TableHead>Partner</TableHead>
              <TableHead>Art</TableHead>
              <TableHead>Laufzeit</TableHead>
              <TableHead>Kündigungsfrist</TableHead>
              <TableHead>Wert</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                  Keine Verträge gefunden
                </TableCell>
              </TableRow>
            ) : (
              filteredContracts.map((contract) => {
                const daysToTermination = daysUntil(contract.terminationDate);
                const isUrgent = daysToTermination !== null && daysToTermination <= 30 && daysToTermination >= 0;

                return (
                  <TableRow key={contract.id} className={isUrgent ? 'bg-amber-50' : ''}>
                    <TableCell className="font-mono text-sm">
                      {contract.contractNumber}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/vertraege/${contract.id}`}
                        className="font-medium text-slate-900 hover:text-primary-600"
                      >
                        {contract.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {contract.partner}
                    </TableCell>
                    <TableCell>
                      <span
                        className="inline-flex items-center gap-1.5 text-sm"
                        style={{ color: contract.type.color }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: contract.type.color }}
                        />
                        {contract.type.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                    </TableCell>
                    <TableCell>
                      {contract.terminationDate ? (
                        <span className={isUrgent ? 'text-amber-600 font-medium' : 'text-slate-600'}>
                          {formatDate(contract.terminationDate)}
                          {isUrgent && (
                            <span className="block text-xs">
                              ({daysToTermination} Tage)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(contract.value)}
                      {contract.paymentInterval && (
                        <span className="text-xs text-slate-500 block">
                          / {contract.paymentInterval}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(contract.status)}>
                        {getStatusText(contract.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/vertraege/${contract.id}`}>
                          <Button variant="ghost" size="sm" className="p-2">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/vertraege/${contract.id}/bearbeiten`}>
                          <Button variant="ghost" size="sm" className="p-2">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDelete(contract.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Zusammenfassung */}
      <div className="text-sm text-slate-500">
        {filteredContracts.length} von {contracts.length} Verträgen
      </div>
    </div>
  );
};

