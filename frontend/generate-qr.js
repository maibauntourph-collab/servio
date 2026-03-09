import QRCode from 'qrcode';

const generate = async () => {
    try {
        await QRCode.toFile('public/images/premium-qr-install.png', 'https://barbershop-ui.pages.dev', {
            color: {
                dark: '#000000FF',  // Solid black dots for CSS masking
                light: '#00000000' // Fully transparent background
            },
            width: 1000,
            margin: 2,
            errorCorrectionLevel: 'H'
        });
        console.log('✅ Transparent Background QR Code generated successfully!');
    } catch (err) {
        console.error('❌ Failed to generate QR:', err);
    }
}
generate();
