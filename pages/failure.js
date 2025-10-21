import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Failure() {
  const router = useRouter();
  const { reason } = router.query;

  return (
    <>
      <Head>
        <title>AutoPay Setup Failed</title>
      </Head>

      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.iconError}>✕</div>
          <h1 style={styles.title}>AutoPay Setup Failed</h1>
          <p style={styles.message}>
            We couldn't complete the AutoPay setup. Please try again.
          </p>

          {reason && (
            <div style={styles.errorBox}>
              <strong>Reason:</strong> {decodeURIComponent(reason)}
            </div>
          )}

          <div style={styles.infoBox}>
            <h3 style={styles.infoTitle}>Common reasons for failure:</h3>
            <ul style={styles.list}>
              <li>Payment declined by bank</li>
              <li>Insufficient funds</li>
              <li>UPI ID not found or invalid</li>
              <li>User cancelled the authorization</li>
              <li>Session timeout</li>
            </ul>
          </div>

          <div style={styles.actions}>
            <button
              onClick={() => router.push('/')}
              style={styles.buttonPrimary}
            >
              Try Again
            </button>
            <button
              onClick={() => alert('Contact support at: support@example.com')}
              style={styles.buttonSecondary}
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  card: {
    maxWidth: '500px',
    width: '100%',
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
  },
  iconError: {
    width: '80px',
    height: '80px',
    background: '#f5576c',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    color: 'white',
    margin: '0 auto 24px',
    fontWeight: 'bold'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '16px'
  },
  message: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '24px'
  },
  errorBox: {
    background: '#fee',
    border: '1px solid #fcc',
    color: '#c33',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '14px'
  },
  infoBox: {
    background: '#fff3cd',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'left',
    marginBottom: '24px'
  },
  infoTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '12px'
  },
  list: {
    margin: 0,
    paddingLeft: '20px',
    color: '#555',
    fontSize: '14px',
    lineHeight: '1.8'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    flexDirection: 'column'
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
    padding: '14px 28px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  buttonSecondary: {
    background: 'white',
    color: '#f5576c',
    padding: '14px 28px',
    border: '2px solid #f5576c',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};
