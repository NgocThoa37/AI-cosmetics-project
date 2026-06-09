export default () => ({
  vnpay: {
    tmnCode: process.env.VNP_TMNCODE,
    hashSecret: process.env.VNP_HASHSECRET,
    vnpUrl: process.env.VNP_URL,
    vnpApiUrl: process.env.VNP_API_URL,
    returnUrl: process.env.VNP_RETURN_URL,
    ipnUrl: process.env.VNP_IPN_URL,
    version: process.env.VNP_VERSION,
    command: process.env.VNP_COMMAND,
    currency: process.env.VNP_CURRENCY,
    locale: process.env.VNP_LOCALE,
  },
});