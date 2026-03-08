import React, { useState } from 'react';

/**
 * QRPaymentModal - 고객이 QR 코드를 스캔한 후 결제를 진행하는 모달 컴포넌트입니다.
 * 학생 여러분: 이 컴포넌트는 Supabase와 연동되어 결제 상태를 실시간으로 업데이트합니다.
 */
const QRPaymentModal = ({ amount, shopName, onPaymentComplete }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('gcash'); // 기본 결제 수단: GCash

    const handlePayment = async () => {
        setIsProcessing(true);

        // 실제 환경에서는 여기서 API 호출 (Hono Backend)을 통해 결제 프로세스를 시작합니다.
        console.log(`${amount} 결제 시도 중 (수단: ${paymentMethod})...`);

        // 인위적인 지연 시간 (결제 처리 시뮬레이션)
        setTimeout(() => {
            setIsProcessing(false);
            alert('결제가 성공적으로 완료되었습니다!');
            if (onPaymentComplete) onPaymentComplete();
        }, 2000);
    };

    return (
        <div className="payment-modal-overlay">
            <div className="payment-modal-content">
                <h2 className="premium-title">{shopName} - 결제하기</h2>
                <div className="amount-display">
                    <span className="label">결제 금액:</span>
                    <span className="value">₱ {amount.toLocaleString()}</span>
                </div>

                <div className="payment-methods">
                    <p>결제 수단 선택:</p>
                    <button
                        className={`method-btn ${paymentMethod === 'gcash' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('gcash')}
                    >
                        GCash
                    </button>
                    <button
                        className={`method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('card')}
                    >
                        Credit Card
                    </button>
                </div>

                <button
                    className="pay-now-btn"
                    disabled={isProcessing}
                    onClick={handlePayment}
                >
                    {isProcessing ? '처리 중...' : '지금 결제하기'}
                </button>
            </div>

            <style jsx>{`
        .payment-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .payment-modal-content {
          background: #fff;
          padding: 2rem;
          border-radius: 15px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .premium-title {
          font-family: 'Inter', sans-serif;
          margin-bottom: 1.5rem;
          color: #333;
        }
        .amount-display {
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
        }
        .payment-methods {
          margin-bottom: 2rem;
        }
        .method-btn {
          margin-right: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          border-radius: 5px;
          background: #fff;
          cursor: pointer;
        }
        .method-btn.active {
          background: #007bff;
          color: #fff;
          border-color: #007bff;
        }
        .pay-now-btn {
          width: 100%;
          padding: 1rem;
          background: #28a745;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
        }
        .pay-now-btn:disabled {
          background: #ccc;
        }
      `}</style>
        </div>
    );
};

export default QRPaymentModal;
