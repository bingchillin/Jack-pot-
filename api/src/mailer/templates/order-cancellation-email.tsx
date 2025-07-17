import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Row,
  Column,
  Hr,
  Button,
} from '@react-email/components';
import * as React from 'react';

interface OrderCancellationEmailProps {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  totalAmount: string;
  refundAmount: string;
  orderItems: Array<{
    productName: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
  locale?: string;
  supportEmail?: string;
}

export const OrderCancellationEmail: React.FC<OrderCancellationEmailProps> = ({
  orderNumber,
  customerName,
  customerEmail,
  orderDate,
  totalAmount,
  refundAmount,
  orderItems,
  locale = 'en',
  supportEmail = process.env.MAIL_FROM || 'support@jackpot.com',
}) => {
  // Localized text based on locale
  const getLocalizedText = (key: string) => {
    const translations = {
      en: {
        subject: 'Order Cancellation - Jackpote',
        preview: `Your order #${orderNumber} has been cancelled`,
        title: 'Order Cancelled',
        subtitle: 'Your order has been successfully cancelled',
        orderNumber: 'Order Number',
        orderDate: 'Order Date',
        totalAmount: 'Total Amount',
        refundAmount: 'Refund Amount',
        refundTimeline: 'Refund Timeline',
        refundDescription: 'Your refund will be processed within 3-5 business days and will appear in your original payment method.',
        orderItems: 'Cancelled Items',
        product: 'Product',
        quantity: 'Quantity',
        unitPrice: 'Unit Price',
        total: 'Total',
        support: 'Need help?',
        supportDescription: 'If you have any questions about your cancellation or refund, our support team is here to help.',
        contactSupport: 'Contact Support',
        thankYou: 'Thank you for choosing Jackpote!',
        orderSummary: 'Order Summary',
        cancellationConfirmed: 'Cancellation Confirmed',
        noRefundNeeded: 'No Refund Needed',
        noRefundDescription: 'This order did not require a refund.',
      },
      fr: {
        subject: 'Annulation de commande - Jackpote',
        preview: `Votre commande #${orderNumber} a été annulée`,
        title: 'Commande annulée',
        subtitle: 'Votre commande a été annulée avec succès',
        orderNumber: 'Numéro de commande',
        orderDate: 'Date de commande',
        totalAmount: 'Montant total',
        refundAmount: 'Montant du remboursement',
        refundTimeline: 'Délai de remboursement',
        refundDescription: 'Votre remboursement sera traité dans les 3-5 jours ouvrables et apparaîtra dans votre méthode de paiement originale.',
        orderItems: 'Articles annulés',
        product: 'Produit',
        quantity: 'Quantité',
        unitPrice: 'Prix unitaire',
        total: 'Total',
        support: 'Besoin d\'aide ?',
        supportDescription: 'Si vous avez des questions concernant votre annulation ou remboursement, notre équipe de support est là pour vous aider.',
        contactSupport: 'Contacter le support',
        thankYou: 'Merci d\'avoir choisi Jackpote !',
        orderSummary: 'Résumé de la commande',
        cancellationConfirmed: 'Annulation confirmée',
        noRefundNeeded: 'Pas de remboursement nécessaire',
        noRefundDescription: 'Cette commande ne nécessitait pas de remboursement.',
      },
      es: {
        subject: 'Cancelación de pedido - Jackpote',
        preview: `Su pedido #${orderNumber} ha sido cancelado`,
        title: 'Pedido cancelado',
        subtitle: 'Su pedido ha sido cancelado exitosamente',
        orderNumber: 'Número de pedido',
        orderDate: 'Fecha del pedido',
        totalAmount: 'Monto total',
        refundAmount: 'Monto del reembolso',
        refundTimeline: 'Tiempo de reembolso',
        refundDescription: 'Su reembolso será procesado dentro de 3-5 días hábiles y aparecerá en su método de pago original.',
        orderItems: 'Artículos cancelados',
        product: 'Producto',
        quantity: 'Cantidad',
        unitPrice: 'Precio unitario',
        total: 'Total',
        support: '¿Necesita ayuda?',
        supportDescription: 'Si tiene preguntas sobre su cancelación o reembolso, nuestro equipo de soporte está aquí para ayudar.',
        contactSupport: 'Contactar soporte',
        thankYou: '¡Gracias por elegir Jackpote!',
        orderSummary: 'Resumen del pedido',
        cancellationConfirmed: 'Cancelación confirmada',
        noRefundNeeded: 'No se necesita reembolsar',
        noRefundDescription: 'Este pedido no requirió reembolsar.',
      },
    };
    return translations[locale as keyof typeof translations]?.[key as keyof typeof translations.en] || translations.en[key as keyof typeof translations.en];
  };

  const t = getLocalizedText;

  return (
    <Html>
      <Head />
      <Preview>{t('preview')}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={companyName}>Jackpote</Text>
            <Text style={tagline}>Smart Gardening Solutions</Text>
          </Section>

          {/* Cancellation Confirmation */}
          <Section style={cancellationSection}>
            <Text style={cancellationIcon}>❌</Text>
            <Text style={cancellationTitle}>{t('cancellationConfirmed')}</Text>
            <Text style={cancellationSubtitle}>{t('subtitle')}</Text>
          </Section>

          {/* Order Summary */}
          <Section style={card}>
            <Text style={cardTitle}>{t('orderSummary')}</Text>
            
            <Row style={orderInfoRow}>
              <Column style={orderInfoColumn}>
                <Text style={orderInfoLabel}>{t('orderNumber')}</Text>
                <Text style={orderInfoValue}>#{orderNumber}</Text>
              </Column>
              <Column style={orderInfoColumn}>
                <Text style={orderInfoLabel}>{t('orderDate')}</Text>
                <Text style={orderInfoValue}>{orderDate}</Text>
              </Column>
              <Column style={orderInfoColumn}>
                <Text style={orderInfoLabel}>{t('totalAmount')}</Text>
                <Text style={orderInfoValue}>{totalAmount}</Text>
              </Column>
            </Row>

            <Hr style={divider} />

            {/* Order Items */}
            <Text style={sectionTitle}>{t('orderItems')}</Text>
            {orderItems.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={itemColumn}>
                  <Text style={itemName}>{item.productName}</Text>
                </Column>
                <Column style={itemColumn}>
                  <Text style={itemQuantity}>x{item.quantity}</Text>
                </Column>
                <Column style={itemColumn}>
                  <Text style={itemPrice}>{item.unitPrice}</Text>
                </Column>
                <Column style={itemColumn}>
                  <Text style={itemTotal}>{item.totalPrice}</Text>
                </Column>
              </Row>
            ))}

            <Hr style={divider} />

            {/* Refund Information */}
            <Section style={refundSection}>
              {refundAmount === '0.00 €' ? (
                <>
                  <Text style={refundTitle}>{t('noRefundNeeded')}</Text>
                  <Text style={refundDescription}>{t('noRefundDescription')}</Text>
                </>
              ) : (
                <>
                  <Text style={refundTitle}>{t('refundTimeline')}</Text>
                  <Text style={refundDescription}>{t('refundDescription')}</Text>
                  <Row style={refundRow}>
                    <Text style={refundLabel}>{t('refundAmount')}</Text>
                    <Text style={refundValue}>{refundAmount}</Text>
                  </Row>
                </>
              )}
            </Section>
          </Section>

          {/* Support Section */}
          <Section style={supportSection}>
            <Text style={supportTitle}>{t('support')}</Text>
            <Text style={supportDescription}>{t('supportDescription')}</Text>
            <Button style={supportButton} href={`mailto:${supportEmail}`}>
              {t('contactSupport')}
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>{t('thankYou')}</Text>
            <Text style={footerText}>Jackpote Team</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  padding: '40px 0',
  textAlign: 'center' as const,
  color: '#ffffff',
};

const companyName = {
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const tagline = {
  fontSize: '16px',
  margin: '0',
  opacity: 0.9,
};

const cancellationSection = {
  background: '#fef2f2',
  border: '2px solid #ef4444',
  borderRadius: '12px',
  padding: '32px',
  textAlign: 'center' as const,
  margin: '32px 0',
};

const cancellationIcon = {
  fontSize: '48px',
  margin: '0 0 16px 0',
};

const cancellationTitle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#dc2626',
  margin: '0 0 8px 0',
};

const cancellationSubtitle = {
  fontSize: '16px',
  color: '#7f1d1d',
  margin: '0',
};

const card = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
};

const cardTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  marginBottom: '16px',
  borderBottom: '2px solid #3b82f6',
  paddingBottom: '8px',
};

const orderInfoRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '16px',
};

const orderInfoColumn = {
  flex: 1,
  textAlign: 'center' as const,
};

const orderInfoLabel = {
  fontSize: '12px',
  color: '#6b7280',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  marginBottom: '4px',
};

const orderInfoValue = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1f2937',
};

const divider = {
  border: 'none',
  borderTop: '1px solid #e5e7eb',
  margin: '24px 0',
};

const sectionTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1f2937',
  marginBottom: '16px',
  borderBottom: '2px solid #3b82f6',
  paddingBottom: '8px',
};

const itemRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: '1px solid #f3f4f6',
};

const itemColumn = {
  flex: 1,
  textAlign: 'center' as const,
};

const itemName = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1f2937',
};

const itemQuantity = {
  fontSize: '14px',
  color: '#6b7280',
  fontWeight: 'bold',
};

const itemPrice = {
  fontSize: '14px',
  color: '#6b7280',
};

const itemTotal = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1f2937',
};

const refundSection = {
  background: '#f0f9ff',
  border: '2px solid #3b82f6',
  borderRadius: '12px',
  padding: '24px',
  marginTop: '24px',
};

const refundTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  marginBottom: '8px',
};

const refundDescription = {
  fontSize: '14px',
  color: '#374151',
  marginBottom: '16px',
  lineHeight: '20px',
};

const refundRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const refundLabel = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1f2937',
};

const refundValue = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#3b82f6',
};

const supportSection = {
  background: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '12px',
  padding: '24px',
  marginTop: '24px',
  textAlign: 'center' as const,
};

const supportTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#92400e',
  marginBottom: '8px',
};

const supportDescription = {
  fontSize: '14px',
  color: '#92400e',
  marginBottom: '16px',
};

const supportButton = {
  background: '#3b82f6',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
  fontWeight: 'bold',
  fontSize: '14px',
};

const footer = {
  background: '#f8fafc',
  padding: '32px 0',
  textAlign: 'center' as const,
  marginTop: '32px',
};

const footerText = {
  fontSize: '14px',
  color: '#6b7280',
  marginBottom: '8px',
}; 