import fs from 'fs';
import { BigQuery } from '@google-cloud/bigquery';
require('dotenv').config();

const USE_MOCK = false;

const bigquery = new BigQuery({
    projectId: process.env.GOOGLE_PROJECT_ID,
    keyFilename: process.env.GOOGLE_KEY_FILE,
});

export async function fetchPYUSDTransfers() {
    if (USE_MOCK) {
        const filePath = "./src/queries/mockData.json";
        const rawData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(rawData);
    }

    const query = `
    WITH pyusd_transfers AS (
  SELECT
    t.block_number,
    t.transaction_hash,
    t.from_address,
    t.to_address,
    t.block_timestamp,
    t.token_address,
    tx.transaction_index,
    tx.gas_price,
    tx.gas,
    tx.from_address AS tx_from_address,
    tx.to_address AS tx_to_address,
    CAST(t.value AS FLOAT64) / 1e6 AS amount
  FROM
    \`bigquery-public-data.crypto_ethereum.token_transfers\` AS t
  JOIN
    \`bigquery-public-data.crypto_ethereum.transactions\` AS tx
  ON
    t.transaction_hash = tx.hash
  WHERE
    t.block_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
),

known_dex_contracts AS (
  SELECT * FROM UNNEST([
    -- Main DEX Routers
    STRUCT('UniswapV2Router' AS dex_name, LOWER('0x7a250d5630b4cf539739df2c5dacb4c659f2488d') AS contract_address),
    STRUCT('UniswapV3Router' AS dex_name, LOWER('0xe592427a0aece92de3edee1f18e0157c05861564') AS contract_address),
    STRUCT('SushiSwapRouter' AS dex_name, LOWER('0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f') AS contract_address),
    STRUCT('PancakeSwapRouter' AS dex_name, LOWER('0x05fF5FfCd03A2e68757B6dD39c92D3cbb8B9f634') AS contract_address),
    STRUCT('CurveFinanceRouter' AS dex_name, LOWER('0x9C365DB4B74a1a12e5ABcd8C47497E6214F42a70') AS contract_address),
    STRUCT('UniswapV2RouterProxy' AS dex_name, LOWER('0x5c69b8e6324b6b6e8b8e3a0b3d9b7e815fd6e65b') AS contract_address),

    -- Aggregators & Meta Routers
    STRUCT('1inchRouter' AS dex_name, LOWER('0x1111111254EEB25477B68fb85Ed929f73A960582') AS contract_address),
    STRUCT('0xExchangeProxy' AS dex_name, LOWER('0xdef1c0ded9bec7f1a1670819833240f027b25eff') AS contract_address),
    STRUCT('MatchaRouter' AS dex_name, LOWER('0x61935cbdd02287b511119ddb11aeb42f1593b7ef') AS contract_address),
    STRUCT('ParaSwap' AS dex_name, LOWER('0xdef171fe48cf0115b1d80b88dc8eab59176fee57') AS contract_address),
    STRUCT('MetaMaskSwapRouter' AS dex_name, LOWER('0x881D40237659C251811CEC9c364ef91dC08D300C') AS contract_address),
    STRUCT('CowSwapSettlement' AS dex_name, LOWER('0x9008d19f58aabd9ed0d60971565aa8510560ab41') AS contract_address)
  ])
)

SELECT
  p.block_number,
  p.transaction_index,
  p.transaction_hash,
    p.token_address,
  p.from_address,
  p.to_address,
  COALESCE(k.dex_name, 'DEX not found') AS dex_name,
  p.block_timestamp,
  p.gas_price,
  p.gas,
  p.amount
FROM
  pyusd_transfers AS p
LEFT JOIN
  known_dex_contracts AS k
ON
  LOWER(p.tx_to_address) = LOWER(k.contract_address) 
  OR LOWER(p.tx_from_address) = LOWER(k.contract_address)
ORDER BY
  p.block_number DESC,
  p.transaction_index ASC
LIMIT 10000
`;

    try {
        const [rows] = await bigquery.query({ query });
        return rows;
    } catch (error) {
        if (error.code === 403 && error.errors.some(e => e.reason === 'quotaExceeded')) {
            console.error('Quota exceeded.');
        } else {
            console.error('Error fetching data:', error);
        }
        throw error;
    }
}


