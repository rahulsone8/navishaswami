module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=0, max-age=0, must-revalidate');

  const config = {
    SUPABASE_URL: process.env.SUPABASE_URL || "https://zpgahkzikzqoozmhwaja.supabase.co",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "sb_publishable_L8FYHXGZ5MzHr0hwDKRY4w_sw_hXUNs",
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "dju6e6g3j",
    CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET || "shivi_party_snaps"
  };

  res.status(200).send(`window.APP_CONFIG = Object.assign({}, window.APP_CONFIG, ${JSON.stringify(config, null, 2)});`);
};
