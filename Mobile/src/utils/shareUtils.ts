// Utilitário de Compartilhamento de Produtos

import { Share, Alert } from 'react-native';
import type { Product } from '../types';

export const shareProduct = async (product: Product) => {
    try {
        const price = product.promotionalPrice || product.sellingPrice || product.price || 0;
        const formattedPrice = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);

        const hasDiscount = product.promotionalPrice && product.sellingPrice &&
            product.promotionalPrice < product.sellingPrice;

        let message = `🛍️ Confira este produto!\n\n`;
        message += `${product.name}\n\n`;

        if (hasDiscount) {
            const originalPrice = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(product.sellingPrice!);
            message += `💰 De ${originalPrice} por ${formattedPrice}\n`;
        } else {
            message += `💰 ${formattedPrice}\n`;
        }

        if (product.description) {
            const shortDescription = product.description.length > 100
                ? product.description.substring(0, 100) + '...'
                : product.description;
            message += `\n${shortDescription}\n`;
        }

        // TODO: Adicionar deep link quando implementado
        // message += `\n🔗 Ver produto: https://sigeve.com/products/${product.id}`;

        const result = await Share.share({
            message,
            title: product.name,
        });

        if (result.action === Share.sharedAction) {
            console.log('Product shared successfully');
        }
    } catch (error: any) {
        console.error('Error sharing product:', error);
        Alert.alert('Erro', 'Não foi possível compartilhar o produto.');
    }
};
