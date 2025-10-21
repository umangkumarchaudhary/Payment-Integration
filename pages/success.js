import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Success() {
  const router = useRouter();
  const { subscriptionId } = router.query;

  return (
    <>
      <Head>
        <title>AutoPay Setup Successful</title>
      </Head>

      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.iconSuccess}>✓</div>
          <h1 style={styles.title}>AutoPay Setup Successful!</h1>
          <p style={styles.message}>
            Your automatic payment mandate has been successfully created.
            Monthly installments will be automatically deducted from your account.
          </p>

          {subscriptionId && (
            <div style={styles.details}>
              <p><strong>Subscription ID:</strong></p>
              <p style={styles.subscriptionId}>{subscriptionId}</p>
            </div>
          )}

          <div style={styles.infoBox}>
            <h3 style={styles.infoTitle}>What happens next?</h3>
            <ul style={styles.list}>
              <li>Your first installment will be processed on the scheduled date</li>
              <li>You'll receive SMS notifications before each payment</li>
              <li>Payments will continue automatically every month</li>
              <li>You can cancel the mandate anytime from your PhonePe app</li>
            </ul>
          </div>

          <button
            onClick={() => router.push('/')}
            style={styles.button}
          >
            Setup Another AutoPay
          </button>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
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
  iconSuccess: {
    width: '80px',
    height: '80px',
    background: '#38ef7d',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    color: 'white',
    margin: '0 auto 24px'
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
  details: {
    background: '#f8f9fa',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px'
  },
  subscriptionId: {
    fontFamily: 'monospace',
    fontSize: '14px',
    color: '#333',
    wordBreak: 'break-all'
  },
  infoBox: {
    background: '#e8f5e9',
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
  button: {
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    color: 'white',
    padding: '14px 28px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  }
};
