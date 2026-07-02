const log = require("./log");

const MODEL_ID = process.env.LOCAL_EMBEDDING_MODEL || "Xenova/all-MiniLM-L6-v2";
let embeddingPipeline = null;

const getEmbeddingPipeline = async () => {
  if (embeddingPipeline) {
    return embeddingPipeline;
  }

  log.info("Initializing local embedding pipeline.", { model: MODEL_ID });
  const { pipeline } = await import("@xenova/transformers");
  embeddingPipeline = await pipeline("feature-extraction", MODEL_ID);
  return embeddingPipeline;
};

const meanPool = (matrix) => {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return [];
  }

  if (!Array.isArray(matrix[0])) {
    return matrix;
  }

  const dim = matrix[0].length;
  const result = new Array(dim).fill(0);

  matrix.forEach((row) => {
    for (let i = 0; i < dim; i += 1) {
      result[i] += row[i] || 0;
    }
  });

  return result.map((value) => value / matrix.length);
};

const normalize = (vector) => {
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  return norm === 0 ? vector : vector.map((value) => value / norm);
};

const embedText = async (text) => {
  const pipeline = await getEmbeddingPipeline();
  const result = await pipeline(text);
  let embedding = result?.data ?? result;

  if (embedding && typeof embedding === "object" && !Array.isArray(embedding)) {
    const flatData = Object.keys(embedding)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => Number(embedding[key]));

    if (Array.isArray(result.dims) && result.dims.length >= 2) {
      const dims = result.dims;
      if (dims.length === 3 && dims[0] === 1) {
        const seqLen = dims[1];
        const embSize = dims[2];
        const matrix = [];
        for (let i = 0; i < seqLen; i += 1) {
          matrix.push(flatData.slice(i * embSize, (i + 1) * embSize));
        }
        embedding = meanPool(matrix);
      } else if (dims.length === 2) {
        const seqLen = dims[0];
        const embSize = dims[1];
        const matrix = [];
        for (let i = 0; i < seqLen; i += 1) {
          matrix.push(flatData.slice(i * embSize, (i + 1) * embSize));
        }
        embedding = meanPool(matrix);
      } else {
        embedding = flatData;
      }
    } else {
      embedding = flatData;
    }
  }

  if (Array.isArray(embedding) && Array.isArray(embedding[0]) && Array.isArray(embedding[0][0])) {
    embedding = embedding[0];
  }

  if (Array.isArray(embedding) && Array.isArray(embedding[0])) {
    embedding = meanPool(embedding);
  }

  return normalize(embedding);
};

const cosineSimilarity = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
  }

  return dot;
};

module.exports = {
  embedText,
  cosineSimilarity,
};
