'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  FileType,
  Bell,
  Plus,
  Trash2,
  BarChart3,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import type { ContractType, KpiType, KpiDataType } from '@/types';

const KPI_DATA_TYPE_OPTIONS = [
  { value: 'NUMBER', label: 'Zahl' },
  { value: 'PERCENT', label: 'Prozent (%)' },
  { value: 'CURRENCY', label: 'Währung (€)' },
];

const getDataTypeLabel = (dataType: string) => {
  const option = KPI_DATA_TYPE_OPTIONS.find((o) => o.value === dataType);
  return option?.label || dataType;
};

export default function EinstellungenPage() {
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [kpiTypes, setKpiTypes] = useState<KpiType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingKpis, setIsLoadingKpis] = useState(true);
  const [newType, setNewType] = useState({ name: '', color: '#be004a' });
  const [newKpi, setNewKpi] = useState({
    name: '',
    dataType: 'NUMBER' as KpiDataType,
    unit: '',
    description: '',
    color: '#3b82f6',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingKpi, setIsSavingKpi] = useState(false);

  // Vertragsarten laden
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await fetch('/api/contract-types');
        const data = await res.json();
        if (data.success) {
          setContractTypes(data.data);
        }
      } catch (error) {
        console.error('Error fetching contract types:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTypes();
  }, []);

  // Kennzahlen-Typen laden
  useEffect(() => {
    const fetchKpiTypes = async () => {
      try {
        const res = await fetch('/api/kpi-types');
        const data = await res.json();
        if (data.success) {
          setKpiTypes(data.data);
        }
      } catch (error) {
        console.error('Error fetching kpi types:', error);
      } finally {
        setIsLoadingKpis(false);
      }
    };
    fetchKpiTypes();
  }, []);

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType.name.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/contract-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newType),
      });

      const data = await res.json();
      if (data.success) {
        setContractTypes((prev) => [...prev, data.data]);
        setNewType({ name: '', color: '#be004a' });
      } else {
        alert(data.error || 'Fehler beim Erstellen');
      }
    } catch (error) {
      console.error('Error creating contract type:', error);
      alert('Fehler beim Erstellen der Vertragsart');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddKpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKpi.name.trim()) return;

    setIsSavingKpi(true);
    try {
      const res = await fetch('/api/kpi-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKpi),
      });

      const data = await res.json();
      if (data.success) {
        setKpiTypes((prev) => [...prev, data.data]);
        setNewKpi({
          name: '',
          dataType: 'NUMBER',
          unit: '',
          description: '',
          color: '#3b82f6',
        });
      } else {
        alert(data.error || 'Fehler beim Erstellen');
      }
    } catch (error) {
      console.error('Error creating kpi type:', error);
      alert('Fehler beim Erstellen der Kennzahl');
    } finally {
      setIsSavingKpi(false);
    }
  };

  const handleDeleteKpi = async (id: string) => {
    if (!confirm('Kennzahl wirklich löschen?')) return;

    try {
      const res = await fetch(`/api/kpi-types?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        setKpiTypes((prev) => prev.filter((k) => k.id !== id));
      } else {
        alert(data.error || 'Fehler beim Löschen');
      }
    } catch (error) {
      console.error('Error deleting kpi type:', error);
      alert('Fehler beim Löschen der Kennzahl');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Einstellungen"
        subtitle="Verwalten Sie Ihre Anwendungseinstellungen"
      />

      <div className="p-6 max-w-4xl space-y-6">
        {/* Vertragsarten */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileType className="w-5 h-5 text-primary-600" />
              Vertragsarten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Liste der Vertragsarten */}
            <div className="space-y-2">
              {isLoading ? (
                <p className="text-slate-500">Laden...</p>
              ) : contractTypes.length === 0 ? (
                <p className="text-slate-500">Keine Vertragsarten vorhanden</p>
              ) : (
                contractTypes.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="font-medium">{type.name}</span>
                      {type._count && (
                        <Badge variant="default" size="sm">
                          {type._count.contracts} Verträge
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={type.color}
                        disabled
                        className="w-8 h-8 rounded cursor-not-allowed"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Neue Vertragsart hinzufügen */}
            <form onSubmit={handleAddType} className="pt-4 border-t border-slate-200">
              <h4 className="text-sm font-medium text-slate-700 mb-3">
                Neue Vertragsart hinzufügen
              </h4>
              <div className="flex items-end gap-4">
                <Input
                  label="Name"
                  value={newType.name}
                  onChange={(e) =>
                    setNewType((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="z.B. Servicevertrag"
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Farbe
                  </label>
                  <input
                    type="color"
                    value={newType.color}
                    onChange={(e) =>
                      setNewType((prev) => ({ ...prev, color: e.target.value }))
                    }
                    className="w-12 h-10 rounded border border-slate-300 cursor-pointer"
                  />
                </div>
                <Button type="submit" variant="success" isLoading={isSaving}>
                  <Plus className="w-4 h-4 mr-2" />
                  Hinzufügen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Kennzahlen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              Kennzahlen (KPIs)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Liste der Kennzahlen */}
            <div className="space-y-2">
              {isLoadingKpis ? (
                <p className="text-slate-500">Laden...</p>
              ) : kpiTypes.length === 0 ? (
                <p className="text-slate-500">Keine Kennzahlen definiert</p>
              ) : (
                kpiTypes.map((kpi) => (
                  <div
                    key={kpi.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: kpi.color }}
                      />
                      <div>
                        <span className="font-medium">{kpi.name}</span>
                        <span className="text-slate-500 text-sm ml-2">
                          ({getDataTypeLabel(kpi.dataType)})
                        </span>
                        {kpi.description && (
                          <p className="text-xs text-slate-500">{kpi.description}</p>
                        )}
                      </div>
                      {kpi._count && (
                        <Badge variant="default" size="sm">
                          {kpi._count.contractKpis} Verträge
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKpi(kpi.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Neue Kennzahl hinzufügen */}
            <form onSubmit={handleAddKpi} className="pt-4 border-t border-slate-200">
              <h4 className="text-sm font-medium text-slate-700 mb-3">
                Neue Kennzahl hinzufügen
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Name"
                  value={newKpi.name}
                  onChange={(e) =>
                    setNewKpi((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="z.B. Bindung, Bewilligung, Zahlung"
                />
                <Select
                  label="Datentyp"
                  value={newKpi.dataType}
                  onChange={(e) =>
                    setNewKpi((prev) => ({
                      ...prev,
                      dataType: e.target.value as KpiDataType,
                    }))
                  }
                  options={KPI_DATA_TYPE_OPTIONS}
                />
                <Input
                  label="Beschreibung (optional)"
                  value={newKpi.description}
                  onChange={(e) =>
                    setNewKpi((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="z.B. Prozentsatz der Mittelbindung"
                />
                <div className="flex items-end gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Farbe
                    </label>
                    <input
                      type="color"
                      value={newKpi.color}
                      onChange={(e) =>
                        setNewKpi((prev) => ({ ...prev, color: e.target.value }))
                      }
                      className="w-12 h-10 rounded border border-slate-300 cursor-pointer"
                    />
                  </div>
                  <Button type="submit" variant="success" isLoading={isSavingKpi}>
                    <Plus className="w-4 h-4 mr-2" />
                    Hinzufügen
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* E-Mail-Benachrichtigungen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-600" />
              E-Mail-Benachrichtigungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-2">
                Automatische Erinnerungen
              </h4>
              <p className="text-sm text-slate-600 mb-4">
                Erinnerungen werden automatisch gesendet, wenn Vertragsfristen näher
                rücken. Die Anzahl der Tage vor der Frist kann pro Vertrag
                eingestellt werden.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="info">SendGrid</Badge>
                <span className="text-sm text-slate-500">
                  {process.env.NEXT_PUBLIC_SENDGRID_CONFIGURED === 'true'
                    ? 'Konfiguriert'
                    : 'Nicht konfiguriert - siehe .env.local'}
                </span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-800 mb-2">Cron-Job Setup</h4>
              <p className="text-sm text-amber-700 mb-2">
                Für automatische E-Mail-Benachrichtigungen muss ein täglicher
                Cron-Job eingerichtet werden:
              </p>
              <code className="block bg-white p-3 rounded text-sm font-mono text-slate-800 overflow-x-auto">
                POST /api/cron/check-deadlines?secret=CRON_SECRET
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Benutzer-Info (Platzhalter) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              Benutzerverwaltung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 rounded-lg p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">
                Benutzerverwaltung wird in einer zukünftigen Version verfügbar
                sein.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System-Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary-600" />
              System-Informationen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Version</p>
                <p className="font-medium">0.3.0</p>
              </div>
              <div>
                <p className="text-slate-500">Framework</p>
                <p className="font-medium">Next.js 14</p>
              </div>
              <div>
                <p className="text-slate-500">Datenbank</p>
                <p className="font-medium">SQLite (lokal)</p>
              </div>
              <div>
                <p className="text-slate-500">ORM</p>
                <p className="font-medium">Prisma</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

