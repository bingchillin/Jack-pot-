import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ResetPasswordEmailProps {
  resetCode: string;
}

export const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({
  resetCode,
}) => (
  <Html>
    <Head />
    <Preview>Reset your password for Jack Pot</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reset Your Password</Heading>
        <Text style={text}>
          You requested to reset your password. Please use the following code to reset your password:
        </Text>
        <Text style={code}>
          {resetCode}
        </Text>
        <Text style={text}>
          This code will expire in 10 minutes.
        </Text>
        <Text style={text}>
          If you did not request a password reset, you can safely ignore this email.
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

const code = {
  backgroundColor: '#f4f4f4',
  borderRadius: '4px',
  color: '#333',
  fontSize: '32px',
  fontWeight: 'bold',
  letterSpacing: '4px',
  lineHeight: '48px',
  margin: '32px auto',
  padding: '16px',
  textAlign: 'center' as const,
  width: '200px',
}; 