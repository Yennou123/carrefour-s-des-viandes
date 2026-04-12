// src/components/profile/WhatsAppOrderButton.tsx
import React from "react";
import { MessageCircle } from "lucide-react";

interface WhatsAppOrderButtonProps {
  orderId: number;
  orderDate: string;
  customerName: string;
  orderStatus: string;
}

const WhatsAppOrderButton: React.FC<WhatsAppOrderButtonProps> = ({
  orderId,
  orderDate,
  customerName,
  orderStatus
}) => {
  // Le bouton n'est pas utile si la commande est annulée ou déjà livrée
  if (orderStatus.toLowerCase() === "cancelled" || orderStatus.toLowerCase() === "delivered") {
    return null;
  }

  const handleWhatsAppClick = async () => {
    // 📞 Numéro WhatsApp de l'entreprise (à remplacer par le vrai, sans '+' ou '00')
    const supportPhone = "22675551410";
    const formattedDate = new Date(orderDate).toLocaleDateString('fr-FR');

    // 💬 Le message d'accroche pré-rempli
    const message = `Bonjour, je souhaite suivre ma commande N°${orderId} passée le ${formattedDate} par ${customerName}. Pouvez-vous m'aider ?`;

    // 🔗 Génération du lien universel WhatsApp (encode l'espace et les caractères spéciaux)
    const whatsappUrl = `https://wa.me/${supportPhone}?text=${encodeURIComponent(message)}`;

    // 📊 Tracking en base de données (Optionnel)
    try {
      const api = (await import("@/lib/axios")).default;
      await api.post(`/orders/${orderId}/whatsapp-click`);
    } catch (error) {
      console.error("Erreur lors du tracking WhatsApp:", error);
    }

    // Ouverture dans un nouvel onglet
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="mt-8 mb-6 bg-[#25D366]/10 p-6 rounded-[2rem] border border-[#25D366]/20 flex flex-col md:flex-row items-center justify-between gap-6">
      <div>
        <h4 className="text-stone-900 font-black text-lg flex items-center gap-2">
          Une question sur l&apos;avancée de votre préparation ?
        </h4>
        <p className="text-stone-600 font-medium mt-1">
          Dialoguez en direct avec nos artisans sur WhatsApp.
          <br />
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
            Notre équipe vous répondra dans les plus brefs délais.
          </span>
        </p>
      </div>

      <button
        onClick={handleWhatsAppClick}
        className="group w-full md:w-auto flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 px-8 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#1ebd5b] transition-all shadow-lg shadow-[#25D366]/30 active:scale-95 whitespace-nowrap"
      >
        <MessageCircle size={22} className="group-hover:animate-pulse" />
        Suivre sur WhatsApp
      </button>
    </div>
  );
};

export default WhatsAppOrderButton;
