import { useState } from 'react';
import Head from 'next/head';

// Move styles outside component to prevent re-creation on each render
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  card: {
    maxWidth: '600px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
    textAlign: 'center'
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    marginBottom: '30px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  section: {
    borderTop: '2px solid #f0f0f0',
    paddingTop: '20px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '16px'
  },
  inputGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box'
  },
  hint: {
    fontSize: '12px',
    color: '#999',
    display: 'block',
    marginTop: '4px'
  },
  summary: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    border: '2px solid #e9ecef'
  },
  summaryTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#333'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px'
  },
  error: {
    background: '#fee',
    border: '1px solid #fcc',
    color: '#c33',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px'
  },
  success: {
    background: '#efe',
    border: '1px solid #cfc',
    color: '#3c3',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px'
  },
  button: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '16px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    marginTop: '10px'
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  }
};

export default function Home() {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    upiId: '',
    packageName: '',
    totalAmount: '',
    installmentAmount: '',
    totalInstallments: '',
    startDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateInstallment = () => {
    if (formData.totalAmount && formData.totalInstallments) {
      const installment = (parseFloat(formData.totalAmount) / parseInt(formData.totalInstallments)).toFixed(2);
      setFormData(prev => ({
        ...prev,
        installmentAmount: installment
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/phonepe/initiate-autopay-v3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          totalAmount: parseFloat(formData.totalAmount),
          installmentAmount: parseFloat(formData.installmentAmount),
          totalInstallments: parseInt(formData.totalInstallments),
          firstPaymentAmount: parseFloat(formData.installmentAmount)
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data);

        // If PhonePe returns a payment URL, redirect to it
        if (data.data?.paymentUrl) {
          window.location.href = data.data.paymentUrl;
        }
      } else {
        setError(data.error || 'Failed to initiate AutoPay');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>PhonePe AutoPay - Dealership Service Package</title>
        <meta name="description" content="Setup AutoPay for service packages" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Service Package AutoPay Setup</h1>
          <p style={styles.subtitle}>Setup automatic monthly payments for your service package</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Customer Details */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Customer Details</h2>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Customer Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Enter customer name"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                  style={styles.input}
                  placeholder="10-digit mobile number"
                />
                <small style={styles.hint}>Must be 10 digits</small>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>UPI ID (For Testing) *</label>
                <select
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleChange}
                  required
                  style={styles.input}
                >
                  <option value="">Select test VPA</option>
                  <option value="success@ybl">success@ybl (✓ Simulate Success)</option>
                  <option value="pending@ybl">pending@ybl (⏳ Simulate Pending)</option>
                  <option value="failed@ybl">failed@ybl (✗ Simulate Failed)</option>
                </select>
                <small style={styles.hint}>Use PhonePe Simulator App to test these VPAs</small>
              </div>
            </div>

            {/* Package Details */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Package Details</h2>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Package Name</label>
                <input
                  type="text"
                  name="packageName"
                  value={formData.packageName}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g., 3-Year Service Package"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Total Package Amount (₹) *</label>
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  onBlur={calculateInstallment}
                  required
                  min="1"
                  step="0.01"
                  style={styles.input}
                  placeholder="Total package cost"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Number of Installments *</label>
                <input
                  type="number"
                  name="totalInstallments"
                  value={formData.totalInstallments}
                  onChange={handleChange}
                  onBlur={calculateInstallment}
                  required
                  min="1"
                  max="60"
                  style={styles.input}
                  placeholder="e.g., 36 for 3 years"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Monthly Installment (₹) *</label>
                <input
                  type="number"
                  name="installmentAmount"
                  value={formData.installmentAmount}
                  onChange={handleChange}
                  required
                  min="1"
                  step="0.01"
                  style={styles.input}
                  placeholder="Auto-calculated"
                />
                <small style={styles.hint}>Auto-calculated or enter custom amount</small>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  style={styles.input}
                />
                <small style={styles.hint}>Leave empty to start immediately</small>
              </div>
            </div>

            {/* Summary */}
            {formData.totalAmount && formData.installmentAmount && formData.totalInstallments && (
              <div style={styles.summary}>
                <h3 style={styles.summaryTitle}>Payment Summary</h3>
                <div style={styles.summaryRow}>
                  <span>Total Package Cost:</span>
                  <strong>₹{parseFloat(formData.totalAmount).toFixed(2)}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Monthly Installment:</span>
                  <strong>₹{parseFloat(formData.installmentAmount).toFixed(2)}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Number of Months:</span>
                  <strong>{formData.totalInstallments}</strong>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div style={styles.error}>
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Success Display */}
            {result && (
              <div style={styles.success}>
                <strong>✅ Success!</strong> AutoPay subscription setup initiated.
                <br />
                <br />
                <div style={{ textAlign: 'left', fontSize: '14px' }}>
                  <strong>Order ID:</strong> {result.data?.orderId}
                  <br />
                  <strong>Subscription ID:</strong> {result.data?.subscriptionId}
                  <br />
                  <strong>Status:</strong> {result.data?.state || 'PENDING'}
                  <br />
                  <br />
                  <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '5px', color: '#856404' }}>
                    📱 <strong>Next Step:</strong> {result.data?.nextSteps || 'Customer will receive authorization request in their UPI app'}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {})
              }}
            >
              {loading ? 'Processing...' : 'Setup AutoPay'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
