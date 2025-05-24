import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface VerificationEmailProps {
  verificationUrl: string;
}

export const VerificationEmail: React.FC<VerificationEmailProps> = ({
  verificationUrl,
}) => (
  <Html>
    <Head />
    <Preview>Verify your email address for Jack Pot</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to Jack Pot!</Heading>
        <Text style={text}>
          Thank you for signing up. Please verify your email address by clicking the button below:
        </Text>
        <Link href={verificationUrl} style={button}>
          Verify Email Address
        </Link>
        <Text style={text}>
          If you did not create an account, you can safely ignore this email.
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
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#5F51E8',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
  margin: '20px auto',
  width: '200px',
}; 