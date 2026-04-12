// // boucherie-backend/seeders/product.seeder.js
// const { Product } = require('../models');

// const productData = [
//     {
//         name: "Entrecôte de Boeuf Maturée",
//         description: "Morceau noble de boeuf, maturé 30 jours pour une tendreté exceptionnelle.",
//         category: "Bœuf",
//         price_per_kg: 3550,
//         unit_type: "Poids",
//         stock_quantity: 50, // en kg
//         is_new_arrival: true,
//         image_url: "https://www.natureviande.fr/wp-content/uploads/2021/10/basse-co%CC%82te-mature%CC%81e.png",
//         details:["Viande Rouge", "Bio", "Origine France"],
//     },
//     {
//         name: "Saucisse Artisanale Traditionnelle",
//         description: "Préparée par nos soins avec de la viande de porc de qualité supérieure et des épices naturelles.",
//         category: "Porc & Charcuterie",
//         price_per_unit: 1200,
//         unit_type: "Pièce",
//         stock_quantity: 150, // en pièces (lots)
//         is_on_promotion: true,
//         image_url: "https://selectiondugout.fr/wp-content/uploads/2021/01/02-saucisse-seche-traditionnelle-selection-du-gout.jpg.jpg"
//     },
//     {
//         name: "Filet de Poulet Fermier",
//         description: "Volaille élevée en plein air, garantie sans OGM. Le filet est tendre et juteux.",
//         category: "Volaille",
//         price_per_kg: 1890,
//         unit_type: "Poids",
//         stock_quantity: 80, // en kg
//         image_url: "https://fridg-front.s3.amazonaws.com/media/CACHE/images/products/filet-de-poulet-fermier-halal-x-2-200-250-g-/059b02d5130c3823be54ea192ec6b400.jpg",
//         details:["Frais", "Bio", "Origine Maroc"],
//     },
// ];

// exports.seedProducts = async () => {
//     try {
//         await Product.bulkCreate(productData, { 
//             ignoreDuplicates: true // Pour éviter les erreurs si la table n'est pas vide
//         });
//         console.log('✅ Produits ajoutés ou mis à jour avec succès.');
//     } catch (error) {
//         console.error('❌ Erreur lors du seeding des produits:', error);
//     }
// };

// // // Exécute la fonction de seeding si le fichier est appelé directement
// // if (require.main === module) {
// //     // Vous devez d'abord vous connecter à la DB et charger les modèles pour que cela fonctionne.
// //     // Pour une exécution simple, nous allons juste l'exporter et l'appeler via un script.
// //     // Vous pouvez créer un script dans package.json pour le lancer : "seed": "node -e 'require(\"./seeders/product.seeder\").seedProducts()'"
// // }