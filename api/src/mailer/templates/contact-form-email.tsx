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
} from '@react-email/components';
import * as React from 'react';

interface ContactFormEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const ContactFormEmail: React.FC<ContactFormEmailProps> = ({
  name,
  email,
  subject,
  message,
}) => (
  <Html>
    <Head />
    <Preview>New contact form submission from {name}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Contact Form Submission</Heading>
        
        <Section style={section}>
          <Row>
            <Column>
              <Text style={label}>Name:</Text>
              <Text style={value}>{name}</Text>
            </Column>
          </Row>
          
          <Row>
            <Column>
              <Text style={label}>Email:</Text>
              <Text style={value}>{email}</Text>
            </Column>
          </Row>
          
          <Row>
            <Column>
              <Text style={label}>Subject:</Text>
              <Text style={value}>{subject}</Text>
            </Column>
          </Row>
        </Section>
        
        <Section style={section}>
          <Text style={label}>Message:</Text>
          <Text style={messageText}>{message}</Text>
        </Section>
        
        <Text style={footer}>
          This message was sent from the Jack Pot contact form.
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const h1 = {
  color: '#22c55e',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0 32px',
  padding: '0',
  textAlign: 'center' as const,
};

const section = {
  padding: '0 40px',
  marginBottom: '24px',
};

const label = {
  color: '#374151',
  fontSize: '14px',
  fontWeight: '600',
  margin: '8px 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const value = {
  color: '#111827',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
  padding: '12px 16px',
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
};

const messageText = {
  color: '#111827',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  padding: '16px',
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
  whiteSpace: 'pre-wrap' as const,
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 40px 0',
  textAlign: 'center' as const,
  fontStyle: 'italic',
}; 