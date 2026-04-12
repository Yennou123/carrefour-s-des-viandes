import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Mail, Trash2, Download } from 'lucide-react';
import { useSmartRefresh } from "@/hooks/useSmartRefresh";

const AdminNewsletter = () => {
  const { data: subscribers = [], loading, mutate } = useSmartRefresh<any[]>('/admin/newsletter/all');

  const deleteSubscriber = async (id: number) => {
    if (window.confirm("Supprimer cet abonné définitivement ?")) {
      try {
        // Assure-toi que cette route DELETE existe au backend
        await api.delete(`/admin/newsletter/delete/${id}`); 
        mutate();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const exportToCSV = () => {
    const csvRows = [
      ["ID", "Email", "Date d'inscription"],
      ...subscribers.map(s => [s.id, s.email, new Date(s.createdAt).toLocaleDateString('fr-FR')])
    ];

    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `subscribers_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-10 text-center">Chargement des abonnés...</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-stone-200">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 uppercase tracking-tight">Liste Newsletter</h2>
          <p className="text-stone-500 text-sm">Total : {subscribers.length} gourmets inscrits</p>
        </div>
        <button 
          onClick={exportToCSV}
          disabled={subscribers.length === 0}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition-all font-bold shadow-sm disabled:opacity-50"
        >
          <Download size={18} /> Exporter
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4 border-b">Abonné</th>
              <th className="px-6 py-4 border-b">Date</th>
              <th className="px-6 py-4 border-b text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {subscribers.map((sub) => (
              <tr key={sub.id} className="hover:bg-stone-50/50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 text-red-700 rounded-full">
                      <Mail size={14} />
                    </div>
                    <span className="font-medium text-stone-800">{sub.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-stone-500 text-sm">
                  {new Date(sub.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => deleteSubscriber(sub.id)}
                    className="text-stone-400 hover:text-red-600 p-2 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscribers.length === 0 && (
          <div className="text-center py-10 text-stone-400 italic">Aucun abonné pour le moment.</div>
        )}
      </div>
    </div>
  );
};

export default AdminNewsletter;