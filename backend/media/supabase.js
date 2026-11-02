// Media on Supabase Storage. Browsers upload straight to the bucket with a
// short-lived signed URL from the API, so files never pass through Vercel.

const { newPath, baseType } = require('./files');

function createSupabaseMedia(supabase, { url, bucket = 'media' }) {
  const publicPrefix = `${url.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/`;
  const storage = () => supabase.storage.from(bucket);

  return {
    publicPrefix,

    // True for links to files in our own bucket (and nothing sneaky like ../)
    isOurs: (value) => typeof value === 'string' && value.startsWith(publicPrefix) && !value.includes('..'),

    // Signed one-time upload slot for the browser
    async createUpload(contentType) {
      const path = newPath(contentType);
      const { data, error } = await storage().createSignedUploadUrl(path);
      if (error) throw new Error(`Storage: ${error.message}`);
      return { upload_url: data.signedUrl, public_url: publicPrefix + path, path };
    },

    // Server-side upload (legacy data URLs and the Mongo migration)
    async uploadBuffer(buffer, contentType, path = newPath(contentType)) {
      const { error } = await storage().upload(path, buffer, { contentType: baseType(contentType), upsert: true });
      if (error) throw new Error(`Storage: ${error.message}`);
      return publicPrefix + path;
    },
  };
}

module.exports = { createSupabaseMedia };
