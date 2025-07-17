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
  Img,
} from '@react-email/components';
import * as React from 'react';

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  totalAmount: string;
  orderItems: Array<{
    productName: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
  shippingAddress?: string;
  locale?: string;
  supportEmail?: string;
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  orderNumber,
  customerName,
  customerEmail,
  orderDate,
  totalAmount,
  orderItems,
  shippingAddress,
  locale = 'en',
  supportEmail = process.env.MAIL_FROM || 'support@jackpot.com',
}) => {
  // Localized text based on locale
  const getLocalizedText = (key: string) => {
    const translations = {
      en: {
        subject: 'Order Confirmation - Jackpote',
        preview: `Thank you for your order #${orderNumber}`,
        title: 'Order Confirmation',
        subtitle: 'Thank you for your purchase!',
        orderNumber: 'Order Number',
        orderDate: 'Order Date',
        totalAmount: 'Total Amount',
        customerInfo: 'Customer Information',
        name: 'Name',
        email: 'Email',
        address: 'Shipping Address',
        orderItems: 'Order Items',
        product: 'Product',
        quantity: 'Quantity',
        unitPrice: 'Unit Price',
        total: 'Total',
        nextSteps: 'What happens next?',
        emailConfirmation: 'You will receive an email confirmation shortly',
        shippingPreparation: 'We will prepare your order for shipping',
        orderProcessing: 'Your order is being processed',
        support: 'Need help?',
        supportDescription: 'If you have questions about your order, our support team is here to help.',
        contactSupport: 'Contact Support',
        thankYou: 'Thank you for choosing Jackpote!',
        orderSummary: 'Order Summary',
        shippingInfo: 'Shipping Information',
        paymentInfo: 'Payment Information',
        status: 'Status',
        paid: 'Paid',
        processing: 'Processing',
        pending: 'Pending',
        payment_processing: 'Payment Processing',
        payment_failed: 'Payment Failed',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        refunded: 'Refunded',
      },
      fr: {
        subject: 'Confirmation de commande - Jackpote',
        preview: `Merci pour votre commande #${orderNumber}`,
        title: 'Confirmation de commande',
        subtitle: 'Merci pour votre achat !',
        orderNumber: 'Numéro de commande',
        orderDate: 'Date de commande',
        totalAmount: 'Montant total',
        customerInfo: 'Informations client',
        name: 'Nom',
        email: 'Email',
        address: 'Adresse de livraison',
        orderItems: 'Articles commandés',
        product: 'Produit',
        quantity: 'Quantité',
        unitPrice: 'Prix unitaire',
        total: 'Total',
        nextSteps: 'Que se passe-t-il ensuite ?',
        emailConfirmation: 'Vous recevrez un email de confirmation sous peu',
        shippingPreparation: 'Nous préparerons votre commande pour l\'expédition',
        orderProcessing: 'Votre commande est en cours de traitement',
        support: 'Besoin d\'aide ?',
        supportDescription: 'Si vous avez des questions sur votre commande, notre équipe de support est là pour vous aider.',
        contactSupport: 'Contacter le support',
        thankYou: 'Merci d\'avoir choisi Jackpote !',
        orderSummary: 'Résumé de la commande',
        shippingInfo: 'Informations de livraison',
        paymentInfo: 'Informations de paiement',
        status: 'Statut',
        paid: 'Payé',
        processing: 'En cours',
        pending: 'En attente',
        payment_processing: 'En cours de paiement',
        payment_failed: 'Échec du paiement',
        shipped: 'Expédié',
        delivered: 'Livré',
        cancelled: 'Annulé',
        refunded: 'Remboursé',
      },
      es: {
        subject: 'Confirmación de pedido - Jackpote',
        preview: `Gracias por su pedido #${orderNumber}`,
        title: 'Confirmación de pedido',
        subtitle: '¡Gracias por su compra!',
        orderNumber: 'Número de pedido',
        orderDate: 'Fecha del pedido',
        totalAmount: 'Monto total',
        customerInfo: 'Información del cliente',
        name: 'Nombre',
        email: 'Email',
        address: 'Dirección de envío',
        orderItems: 'Artículos del pedido',
        product: 'Producto',
        quantity: 'Cantidad',
        unitPrice: 'Precio unitario',
        total: 'Total',
        nextSteps: '¿Qué sigue?',
        emailConfirmation: 'Recibirá un email de confirmación pronto',
        shippingPreparation: 'Prepararemos su pedido para envío',
        orderProcessing: 'Su pedido está siendo procesado',
        support: '¿Necesita ayuda?',
        supportDescription: 'Si tiene preguntas sobre su pedido, nuestro equipo de soporte está aquí para ayudar.',
        contactSupport: 'Contactar soporte',
        thankYou: '¡Gracias por elegir Jackpote!',
        orderSummary: 'Resumen del pedido',
        shippingInfo: 'Información de envío',
        paymentInfo: 'Información de pago',
        status: 'Estado',
        paid: 'Pagado',
        processing: 'Procesando',
        pending: 'Pendiente',
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

  return (
    <Html>
      <Head />
      <Preview>{t('preview')}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Row>
              <Column style={headerContent}>
                <Text style={logo}>🌱 Jackpote</Text>
                <Text style={headerSubtitle}>Smart Gardening Solutions</Text>
              </Column>
            </Row>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {/* Success Message */}
            <Row>
              <Column style={successSection}>
                <Text style={successIcon}>✅</Text>
                <Heading style={h1}>{t('title')}</Heading>
                <Text style={subtitle}>{t('subtitle')}</Text>
              </Column>
            </Row>

            {/* Order Summary Card */}
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
                  <Text style={orderInfoLabel}>{t('status')}</Text>
                  <Text style={statusBadge}>{t('paid')}</Text>
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

              {/* Total */}
              <Section style={totalSection}>
                <Row style={totalRow}>
                  <Text style={totalLabel}>{t('total')}</Text>
                  <Text style={totalValue}>{totalAmount}</Text>
                </Row>
              </Section>
            </Section>

            {/* Customer Information */}
            <Section style={card}>
              <Text style={cardTitle}>{t('customerInfo')}</Text>
              <Row style={infoRow}>
                <Column style={infoColumn}>
                  <Text style={infoLabel}>{t('name')}</Text>
                  <Text style={infoValue}>{customerName}</Text>
                </Column>
                <Column style={infoColumn}>
                  <Text style={infoLabel}>{t('email')}</Text>
                  <Text style={infoValue}>{customerEmail}</Text>
                </Column>
              </Row>
              
              {shippingAddress && (
                <Row style={infoRow}>
                  <Column style={infoColumn}>
                    <Text style={infoLabel}>{t('address')}</Text>
                    <Text style={infoValue}>{shippingAddress}</Text>
                  </Column>
                </Row>
              )}
            </Section>

            {/* Next Steps */}
            <Section style={nextStepsSection}>
              <Text style={nextStepsTitle}>{t('nextSteps')}</Text>
              <Row style={stepItem}>
                <Column style={stepIconColumn}>
                  <Text style={stepIcon}>📧</Text>
                </Column>
                <Column style={stepTextColumn}>
                  <Text style={stepText}>{t('emailConfirmation')}</Text>
                </Column>
              </Row>
              <Row style={stepItem}>
                <Column style={stepIconColumn}>
                  <Text style={stepIcon}>📦</Text>
                </Column>
                <Column style={stepTextColumn}>
                  <Text style={stepText}>{t('shippingPreparation')}</Text>
                </Column>
              </Row>
              <Row style={stepItem}>
                <Column style={stepIconColumn}>
                  <Text style={stepIcon}>⚙️</Text>
                </Column>
                <Column style={stepTextColumn}>
                  <Text style={stepText}>{t('orderProcessing')}</Text>
                </Column>
              </Row>
            </Section>

            {/* Support Section */}
            <Section style={supportSection}>
              <Text style={supportTitle}>{t('support')}</Text>
              <Text style={supportDescription}>{t('supportDescription')}</Text>
              <Button style={supportButton} href={`mailto:${supportEmail}`}>
                {t('contactSupport')}
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>{t('thankYou')}</Text>
            <Text style={footerSubtext}>🌱 Growing together, smarter.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: 0,
  padding: 0,
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
};

const header = {
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  padding: '40px 0',
  textAlign: 'center' as const,
  color: '#ffffff',
};

const headerContent = {
  textAlign: 'center' as const,
};

const logo = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const headerSubtitle = {
  color: '#d1fae5',
  fontSize: '16px',
  margin: 0,
};

const content = {
  padding: '32px 24px',
};

const successSection = {
  background: '#f0f9ff',
  border: '2px solid #3b82f6',
  borderRadius: '12px',
  padding: '32px',
  textAlign: 'center' as const,
  margin: '32px 0',
};

const successIcon = {
  width: '64px',
  height: '64px',
  margin: '0 auto 16px',
  background: '#3b82f6',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  fontSize: '32px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  textAlign: 'center' as const,
};

const subtitle = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: 0,
  textAlign: 'center' as const,
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

const statusBadge = {
  background: '#3b82f6',
  color: '#ffffff',
  padding: '4px 12px',
  borderRadius: '16px',
  fontSize: '12px',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  display: 'inline-block',
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

const totalSection = {
  background: '#f8fafc',
  border: '2px solid #3b82f6',
  borderRadius: '12px',
  padding: '24px',
  marginTop: '24px',
};

const totalRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
};

const totalLabel = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
};

const totalValue = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#3b82f6',
};

const infoRow = {
  marginBottom: '16px',
};

const infoColumn = {
  padding: '0 8px',
};

const infoLabel = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px 0',
};

const infoValue = {
  color: '#1f2937',
  fontSize: '14px',
  margin: 0,
};

const nextStepsSection = {
  background: '#f0f9ff',
  border: '1px solid #3b82f6',
  borderRadius: '12px',
  padding: '24px',
  marginTop: '24px',
};

const nextStepsTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  marginBottom: '16px',
  textAlign: 'center' as const,
};

const stepItem = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '12px',
  padding: '12px',
  background: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
};

const stepIconColumn = {
  width: '40px',
  paddingRight: '12px',
};

const stepTextColumn = {
  flex: 1,
};

const stepIcon = {
  width: '24px',
  height: '24px',
  marginRight: '12px',
  color: '#3b82f6',
};

const stepText = {
  fontSize: '14px',
  color: '#374151',
  fontWeight: '500',
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

const footerSubtext = {
  color: '#9ca3af',
  fontSize: '14px',
  margin: 0,
}; 