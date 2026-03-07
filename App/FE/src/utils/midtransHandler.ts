export const loadSnapScript = () => {
  return new Promise((resolve) => {
    if (window.snap) {
      resolve(window.snap);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js"; 
    script.setAttribute("data-client-key", import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
    script.onload = () => resolve(window.snap);
    document.head.appendChild(script);
  });
};

export const openSnapPopup = async (snapToken: string, callbacks: {
  onSuccess?: (result: any) => void;
  onPending?: (result: any) => void;
  onError?: (result: any) => void;
  onClose?: () => void;
}) => {
  await loadSnapScript();
  
  if (window.snap) {
    window.snap.pay(snapToken, {
      onSuccess: (result: any) => callbacks.onSuccess?.(result),
      onPending: (result: any) => callbacks.onPending?.(result),
      onError: (result: any) => callbacks.onError?.(result),
      onClose: () => callbacks.onClose?.(),
    });
  }
};