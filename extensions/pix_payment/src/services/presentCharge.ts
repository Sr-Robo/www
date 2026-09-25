import QRCode from 'qrcode';

/** Render the exact copy/paste payload locally without an external QR service. */
export async function presentCharge(charge: any) {
  return {
    provider_reference: charge.provider_reference,
    copy_paste: charge.copy_paste,
    qr_code: charge.qr_code,
    qr_image: await QRCode.toDataURL(charge.copy_paste, {
      errorCorrectionLevel: 'M', margin: 4, width: 320
    }),
    status: charge.status,
    expires_at: new Date(charge.expires_at).toISOString(),
    simulator: true
  };
}
