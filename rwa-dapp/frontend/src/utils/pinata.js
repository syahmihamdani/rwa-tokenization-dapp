const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs";

/**
 * Upload a file to IPFS via Pinata
 * @param {File} file - The file to upload
 * @param {string} name - Optional name/label for the pin
 * @returns {Promise<{cid: string, url: string}>}
 */
export async function uploadToIPFS(file, name = "") {
  if (!PINATA_JWT) {
    throw new Error("Pinata JWT not configured. Set VITE_PINATA_JWT in .env");
  }

  const formData = new FormData();
  formData.append("file", file);

  if (name) {
    const metadata = JSON.stringify({ name });
    formData.append("pinataMetadata", metadata);
  }

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.details || `Pinata upload failed (${res.status})`);
  }

  const data = await res.json();
  return {
    cid: data.IpfsHash,
    url: `${PINATA_GATEWAY}/${data.IpfsHash}`,
  };
}

/**
 * Get the gateway URL for a given CID
 * @param {string} cid - IPFS CID (can be raw CID or ipfs://... format)
 * @returns {string} Full gateway URL
 */
export function getIPFSUrl(cid) {
  if (!cid) return "#";
  // Strip "ipfs://" prefix if present
  const cleanCid = cid.replace(/^ipfs:\/\//, "");
  return `${PINATA_GATEWAY}/${cleanCid}`;
}
