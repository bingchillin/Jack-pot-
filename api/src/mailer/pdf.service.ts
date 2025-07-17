import { Injectable, Logger } from '@nestjs/common';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Order } from '../order/entities/order.entity';
import { Person } from '../person/entities/person.entity';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 40,
    borderBottom: '3px solid #3b82f6',
    paddingBottom: 20,
  },
  companyName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 8,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    borderBottom: '2px solid #3b82f6',
    paddingBottom: 8,
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 12,
    color: '#1f2937',
  },
  status: {
    fontSize: 12,
    color: '#059669',
    fontWeight: 'bold',
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  customerLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  customerValue: {
    fontSize: 12,
    color: '#1f2937',
  },
  tableHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#3b82f6',
    padding: 8,
    textAlign: 'left',
  },
  tableCell: {
    fontSize: 12,
    color: '#1f2937',
    padding: 8,
    borderBottom: '1px solid #e5e7eb',
  },
  tableCellCenter: {
    fontSize: 12,
    color: '#1f2937',
    padding: 8,
    borderBottom: '1px solid #e5e7eb',
    textAlign: 'center',
  },
  tableCellRight: {
    fontSize: 12,
    color: '#1f2937',
    padding: 8,
    borderBottom: '1px solid #e5e7eb',
    textAlign: 'right',
  },
  tableCellRightBold: {
    fontSize: 12,
    color: '#1f2937',
    padding: 8,
    borderBottom: '1px solid #e5e7eb',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  summary: {
    marginTop: 20,
    paddingTop: 20,
    borderTop: '2px solid #e5e7eb',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  footer: {
    marginTop: 40,
    textAlign: 'center',
    borderTop: '1px solid #e5e7eb',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
});

const OrderReceipt = ({ order, locale, person }: { 
  order: Order; 
  locale: string; 
  person: Person;
}) => {
  const getLocalizedText = (key: string) => {
    const translations = {
      en: {
        receipt: 'Receipt',
        orderNumber: 'Order #',
        orderDate: 'Order Date',
        status: 'Status',
        customerInfo: 'Customer Information',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        orderItems: 'Order Items',
        product: 'Product',
        quantity: 'Qty',
        unitPrice: 'Unit Price',
        total: 'Total',
        thankYou: 'Thank you for your purchase!',
        support: 'For support, please contact our customer service.',
        paid: 'Paid',
        pending: 'Pending',
        processing: 'Processing',
        payment_processing: 'Payment Processing',
        payment_failed: 'Payment Failed',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        refunded: 'Refunded',
      },
      fr: {
        receipt: 'Reçu',
        orderNumber: 'Commande #',
        orderDate: 'Date de commande',
        status: 'Statut',
        customerInfo: 'Informations client',
        name: 'Nom',
        email: 'Email',
        phone: 'Téléphone',
        orderItems: 'Articles commandés',
        product: 'Produit',
        quantity: 'Qté',
        unitPrice: 'Prix unitaire',
        total: 'Total',
        thankYou: 'Merci pour votre achat !',
        support: 'Pour le support, veuillez contacter notre service client.',
        paid: 'Payé',
        pending: 'En attente',
        processing: 'En cours',
        payment_processing: 'En cours de paiement',
        payment_failed: 'Paiement échoué',
        shipped: 'Expédié',
        delivered: 'Livré',
        cancelled: 'Annulé',
        refunded: 'Remboursé',
      },
      es: {
        receipt: 'Recibo',
        orderNumber: 'Pedido #',
        orderDate: 'Fecha del pedido',
        status: 'Estado',
        customerInfo: 'Información del cliente',
        name: 'Nombre',
        email: 'Email',
        phone: 'Teléfono',
        orderItems: 'Artículos del pedido',
        product: 'Producto',
        quantity: 'Cant',
        unitPrice: 'Precio unitario',
        total: 'Total',
        thankYou: '¡Gracias por su compra!',
        support: 'Para soporte, por favor contacte nuestro servicio al cliente.',
        paid: 'Pagado',
        pending: 'Pendiente',
        processing: 'Procesando',
        payment_processing: 'Procesando pago',
        payment_failed: 'Pago fallido',
        shipped: 'Enviado',
        delivered: 'Entregado',
        cancelled: 'Cancelado',
        refunded: 'Reembolsado',
      },
    };
    return translations[locale as keyof typeof translations]?.[key as keyof typeof translations.en] || translations.en[key as keyof typeof translations.en];
  };

  const t = getLocalizedText;
  const formatDate = (date: Date) => new Date(date).toLocaleDateString(locale);
  const formatAmount = (amount: any) => {
    if (amount === null || amount === undefined) return '0.00 €';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${numAmount.toFixed(2)} €`;
  };

  return React.createElement(Document, {}, 
    React.createElement(Page, { size: "A4", style: styles.page }, [
      // Header
      React.createElement(View, { key: 'header', style: styles.header }, [
        React.createElement(Text, { key: 'company', style: styles.companyName }, 'Jackpote'),
        React.createElement(Text, { key: 'title', style: styles.title }, t('receipt'))
      ]),
      
      // Order Information
      React.createElement(View, { key: 'orderInfo', style: styles.section }, [
        React.createElement(Text, { key: 'orderNumber', style: styles.orderNumber }, `${t('orderNumber')}${order.idOrder}`),
        
        React.createElement(View, { key: 'orderDate', style: styles.row }, [
          React.createElement(Text, { key: 'label', style: styles.label }, `${t('orderDate')}:`),
          React.createElement(Text, { key: 'value', style: styles.value }, formatDate(order.createdAt))
        ]),
        
        React.createElement(View, { key: 'status', style: styles.row }, [
          React.createElement(Text, { key: 'label', style: styles.label }, `${t('status')}:`),
          React.createElement(Text, { key: 'value', style: styles.status }, t(order.status.toLowerCase()) || order.status.toUpperCase())
        ])
      ]),
      
      // Customer Information
      React.createElement(View, { key: 'customerInfo', style: styles.section }, [
        React.createElement(Text, { key: 'title', style: styles.sectionTitle }, t('customerInfo')),
        
        React.createElement(View, { key: 'name', style: styles.customerRow }, [
          React.createElement(Text, { key: 'label', style: styles.customerLabel }, `${t('name')}:`),
          React.createElement(Text, { key: 'value', style: styles.customerValue }, `${person.firstname} ${person.surname}`)
        ]),
        
        React.createElement(View, { key: 'email', style: styles.customerRow }, [
          React.createElement(Text, { key: 'label', style: styles.customerLabel }, `${t('email')}:`),
          React.createElement(Text, { key: 'value', style: styles.customerValue }, person.email)
        ]),
        
        person.numberPhone && React.createElement(View, { key: 'phone', style: styles.customerRow }, [
          React.createElement(Text, { key: 'label', style: styles.customerLabel }, `${t('phone')}:`),
          React.createElement(Text, { key: 'value', style: styles.customerValue }, person.numberPhone)
        ])
      ].filter(Boolean)),
      
      // Order Items
      React.createElement(View, { key: 'orderItems', style: styles.section }, [
        React.createElement(Text, { key: 'title', style: styles.sectionTitle }, t('orderItems')),
        
        // Table Header
        React.createElement(View, { key: 'tableHeader', style: { flexDirection: 'row' } }, [
          React.createElement(Text, { key: 'product', style: [styles.tableHeader, { width: '40%' }] }, t('product')),
          React.createElement(Text, { key: 'quantity', style: [styles.tableHeader, { width: '20%', textAlign: 'center' }] }, t('quantity')),
          React.createElement(Text, { key: 'price', style: [styles.tableHeader, { width: '20%', textAlign: 'right' }] }, t('unitPrice')),
          React.createElement(Text, { key: 'total', style: [styles.tableHeader, { width: '20%', textAlign: 'right' }] }, t('total'))
        ]),
        
        // Table Body
        ...(order.orderItems || []).map((item, index) => 
          React.createElement(View, { key: `item-${index}`, style: { flexDirection: 'row' } }, [
            React.createElement(Text, { key: 'product', style: [styles.tableCell, { width: '40%' }] }, 
              item.product?.name || `Product ${item.idProduct}`
            ),
            React.createElement(Text, { key: 'quantity', style: [styles.tableCellCenter, { width: '20%' }] }, 
              (item.quantity || 0).toString()
            ),
            React.createElement(Text, { key: 'price', style: [styles.tableCellRight, { width: '20%' }] }, 
              formatAmount(item.unitPrice)
            ),
            React.createElement(Text, { key: 'total', style: [styles.tableCellRightBold, { width: '20%' }] }, 
              formatAmount(item.totalPrice)
            )
          ])
        )
      ]),
      
      // Summary
      React.createElement(View, { key: 'summary', style: styles.summary }, [
        React.createElement(View, { key: 'total', style: styles.totalRow }, [
          React.createElement(Text, { key: 'label', style: styles.totalLabel }, `${t('total')}:`),
          React.createElement(Text, { key: 'value', style: styles.totalValue }, formatAmount(order.totalAmount))
        ])
      ]),
      
      // Footer
      React.createElement(View, { key: 'footer', style: styles.footer }, [
        React.createElement(Text, { key: 'thankYou', style: styles.footerText }, t('thankYou')),
        React.createElement(Text, { key: 'support', style: styles.footerText }, t('support'))
      ])
    ])
  );
};

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generateOrderReceipt(order: Order, person: Person, locale: string = 'en'): Promise<Buffer> {
    try {
      this.logger.log(`Generating PDF receipt for order ${order.idOrder}`);
      this.logger.log(`Order data:`, {
        idOrder: order.idOrder,
        totalAmount: order.totalAmount,
        orderItemsCount: order.orderItems?.length || 0,
        orderItems: order.orderItems?.map(item => ({
          idProduct: item.idProduct,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          productName: item.product?.name || 'No product name',
        })) || [],
      });

      const pdfBuffer = await renderToBuffer(
        React.createElement(OrderReceipt, { order, person, locale })
      );
      
      this.logger.log(`PDF receipt generated successfully for order ${order.idOrder}`);
      return pdfBuffer;
    } catch (error) {
      this.logger.error(`Failed to generate PDF receipt for order ${order.idOrder}:`, error);
      throw error;
    }
  }
} 