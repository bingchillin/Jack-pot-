const API_URL ="http://localhost:3000";

export const authApi = {
  resendVerification: async (email: string) => {
    const response = await fetch(`${API_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to resend verification email');
    }

    return response.json();
  },
}; 