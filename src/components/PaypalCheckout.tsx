'use client';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from 'next/navigation';

interface PaypalCheckoutProps {
  amount: string;
  description: string;
  onSuccess?: (details: any) => void;
}

export default function PaypalCheckout({ amount, description, onSuccess }: PaypalCheckoutProps) {
  const router = useRouter();

  return (
    <div style={{ minWidth: '200px' }}>
      <PayPalScriptProvider options={{ 
        "clientId": "AYVMrjaWV6MFUjSKdJunMewqnWLJI3ESdrgw0Ay9Q4aOXxeiKT_ler1jckqAFi_rnRTQFDmeYq1VXvTo",
        currency: "BRL",
        intent: "capture"
      }}>
        <PayPalButtons
          style={{ layout: "vertical", color: "blue", shape: "rect", label: "checkout" }}
          createOrder={async () => {
            const res = await fetch('/api/checkout/paypal/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount, description })
            });
            const order = await res.json();
            return order.id;
          }}
          onApprove={async (data, actions) => {
            const res = await fetch('/api/checkout/paypal/capture', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderID: data.orderID })
            });
            const details = await res.json();
            
            if (details.status === 'COMPLETED') {
              alert('Pagamento aprovado com sucesso! Bem-vindo à área VIP.');
              if (onSuccess) onSuccess(details);
            } else {
              alert('Houve um problema ao processar seu pagamento. Por favor, tente novamente.');
            }
          }}
          onError={(err) => {
            console.error('Erro no PayPal Button:', err);
            alert('Erro ao carregar o sistema de pagamentos.');
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
}
