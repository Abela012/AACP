import { vi } from 'vitest';

type ChapaMockOptions = {
  initializeStatus?: 'success' | 'failed';
  verifyStatus?: 'success' | 'pending' | 'failed';
  amount?: number;
};

export function mockChapaApi(options: ChapaMockOptions = {}) {
  const {
    initializeStatus = 'success',
    verifyStatus = 'success',
    amount = 50,
  } = options;

  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    const path = String(url);

    if (path.includes('/transaction/initialize')) {
      const body = init?.body ? JSON.parse(String(init.body)) : {};
      const txRef = body.tx_ref || `aacp_mock_${Date.now()}`;
      if (initializeStatus === 'failed') {
        return new Response(JSON.stringify({ status: 'failed', message: 'Init failed' }), {
          status: 400,
        });
      }
      return new Response(
        JSON.stringify({
          status: 'success',
          data: { checkout_url: `https://checkout.chapa.co/mock/${txRef}` },
        }),
        { status: 200 }
      );
    }

    if (path.includes('/transaction/verify/')) {
      if (verifyStatus === 'pending') {
        return new Response(
          JSON.stringify({ status: 'success', data: { status: 'pending', amount } }),
          { status: 200 }
        );
      }
      if (verifyStatus === 'failed') {
        return new Response(
          JSON.stringify({ status: 'success', data: { status: 'failed', amount } }),
          { status: 200 }
        );
      }
      return new Response(
        JSON.stringify({
          status: 'success',
          data: { status: 'success', amount, currency: 'ETB', id: 'chapa_tx_mock_1' },
        }),
        { status: 200 }
      );
    }

    return new Response(JSON.stringify({ status: 'failed', message: 'Unknown path' }), {
      status: 404,
    });
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
