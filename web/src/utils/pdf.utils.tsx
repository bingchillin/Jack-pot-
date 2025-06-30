import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { Order } from '@/interfaces/order.interface';
import { getStatusDescription } from './order.utils';
import { formatDate, formatAmountWithoutCurrency } from './format.utils';

// Create styles
const createStyles = () => StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
    borderBottom: '2 solid #3b82f6',
    paddingBottom: 20,
  },
  companyName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  receiptTitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 10,
  },
  orderInfo: {
    marginBottom: 25,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  orderLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  orderValue: {
    fontSize: 10,
    color: '#111827',
  },
  statusBadge: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 5,
  },
  customerInfo: {
    marginBottom: 20,
  },
  customerRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  customerLabel: {
    fontSize: 10,
    color: '#6b7280',
    width: 80,
  },
  customerValue: {
    fontSize: 10,
    color: '#111827',
    flex: 1,
  },
  itemsTable: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderBottom: '1 solid #e5e7eb',
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottom: '1 solid #f3f4f6',
  },
  tableCell: {
    fontSize: 10,
    color: '#111827',
  },
  productCell: {
    flex: 2,
  },
  quantityCell: {
    flex: 1,
    textAlign: 'center',
  },
  priceCell: {
    flex: 1,
    textAlign: 'right',
  },
  totalCell: {
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  summary: {
    marginTop: 20,
    borderTop: '2 solid #e5e7eb',
    paddingTop: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 3,
  },
});

// PDF Document Component
const OrderReceipt = ({ order, locale, user }: { order: Order; locale: string; user?: any }) => {
  const styles = createStyles();
  // Localized text based on locale
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
        address: 'Address',
        phone: 'Phone',
        orderItems: 'Order Items',
        product: 'Product',
        quantity: 'Qty',
        unitPrice: 'Unit Price',
        total: 'Total',
        thankYou: 'Thank you for your purchase!',
        support: 'For support, please contact our customer service.',
      },
      fr: {
        receipt: 'Reçu',
        orderNumber: 'Commande #',
        orderDate: 'Date de commande',
        status: 'Statut',
        customerInfo: 'Informations client',
        name: 'Nom',
        email: 'Email',
        address: 'Adresse',
        phone: 'Téléphone',
        orderItems: 'Articles commandés',
        product: 'Produit',
        quantity: 'Qté',
        unitPrice: 'Prix unitaire',
        total: 'Total',
        thankYou: 'Merci pour votre achat !',
        support: 'Pour le support, veuillez contacter notre service client.',
      },
      es: {
        receipt: 'Recibo',
        orderNumber: 'Pedido #',
        orderDate: 'Fecha del pedido',
        status: 'Estado',
        customerInfo: 'Información del cliente',
        name: 'Nombre',
        email: 'Email',
        address: 'Dirección',
        phone: 'Teléfono',
        orderItems: 'Artículos del pedido',
        product: 'Producto',
        quantity: 'Cant',
        unitPrice: 'Precio unitario',
        total: 'Total',
        thankYou: '¡Gracias por su compra!',
        support: 'Para soporte, por favor contacte nuestro servicio al cliente.',
      },
    };
    return translations[locale as keyof typeof translations]?.[key as keyof typeof translations.en] || translations.en[key as keyof typeof translations.en];
  };
  const t = getLocalizedText;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>Jack Pot</Text>
          <Text style={styles.receiptTitle}>{t('receipt')}</Text>
        </View>
        {/* Order Information */}
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>{t('orderNumber')}{order.idOrder}</Text>
          <View style={styles.orderDetails}>
            <Text style={styles.orderLabel}>{t('orderDate')}:</Text>
            <Text style={styles.orderValue}>{formatDate(order.createdAt, locale)}</Text>
          </View>
          <View style={styles.orderDetails}>
            <Text style={styles.orderLabel}>{t('status')}:</Text>
            <Text style={styles.statusBadge}>{order.status.toUpperCase()}</Text>
          </View>
        </View>
        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('customerInfo')}</Text>
          <View style={styles.customerInfo}>
            <View style={styles.customerRow}>
              <Text style={styles.customerLabel}>{t('name')}:</Text>
              <Text style={styles.customerValue}>
                {user ? `${user.firstname || ''} ${user.surname || ''}`.trim() : 'N/A'}
              </Text>
            </View>
            <View style={styles.customerRow}>
              <Text style={styles.customerLabel}>{t('email')}:</Text>
              <Text style={styles.customerValue}>{user?.email || 'N/A'}</Text>
            </View>
            {user?.numberPhone && (
              <View style={styles.customerRow}>
                <Text style={styles.customerLabel}>{t('phone')}:</Text>
                <Text style={styles.customerValue}>{user.numberPhone}</Text>
              </View>
            )}
            {order.shippingAddress && (
              <View style={styles.customerRow}>
                <Text style={styles.customerLabel}>{t('address')}:</Text>
                <Text style={styles.customerValue}>
                  {[
                    `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
                    order.shippingAddress.address,
                    [order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postalCode].filter(Boolean).join(' '),
                    order.shippingAddress.country
                  ].filter(Boolean).join(', ')}
                </Text>
              </View>
            )}
          </View>
        </View>
        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orderItems')}</Text>
          <View style={styles.itemsTable}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.productCell]}>{t('product')}</Text>
              <Text style={[styles.tableHeaderCell, styles.quantityCell]}>{t('quantity')}</Text>
              <Text style={[styles.tableHeaderCell, styles.priceCell]}>{t('unitPrice')}</Text>
              <Text style={[styles.tableHeaderCell, styles.totalCell]}>{t('total')}</Text>
            </View>
            {/* Table Rows */}
            {order.orderItems.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.productCell]}>{item.product.name}</Text>
                <Text style={[styles.tableCell, styles.quantityCell]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.priceCell]}>{formatAmountWithoutCurrency(item.unitPrice)} €</Text>
                <Text style={[styles.tableCell, styles.totalCell]}>{formatAmountWithoutCurrency(item.totalPrice)} €</Text>
              </View>
            ))}
          </View>
        </View>
        {/* Order Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('total')}</Text>
            <Text style={styles.summaryValue}>{formatAmountWithoutCurrency(order.totalAmount)} €</Text>
          </View>
        </View>
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('thankYou')}</Text>
          <Text style={styles.footerText}>{t('support')}</Text>
        </View>
      </Page>
    </Document>
  );
};

export const generateOrderReceipt = async (order: Order, locale: string = 'en', user?: any): Promise<void> => {
  try {
    const blob = await pdf(<OrderReceipt order={order} locale={locale} user={user} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `order-${order.idOrder}-receipt.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const generateOrderReceiptBlob = async (order: Order, locale: string = 'en', user?: any): Promise<Blob> => {
  try {
    return await pdf(<OrderReceipt order={order} locale={locale} user={user} />).toBlob();
  } catch (error) {
    console.error('Error generating PDF blob:', error);
    throw error;
  }
}; 