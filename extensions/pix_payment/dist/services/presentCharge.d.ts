/** Render the exact copy/paste payload locally without an external QR service. */
export declare function presentCharge(charge: any): Promise<{
    provider_reference: any;
    copy_paste: any;
    qr_code: any;
    qr_image: any;
    status: any;
    expires_at: string;
    simulator: boolean;
}>;
