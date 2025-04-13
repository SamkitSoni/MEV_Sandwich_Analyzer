import { fetchPYUSDTransfers } from '../queries/fetchPyusdTxs';
import fs from 'fs';

const UNISWAP_POOLS = new Set([
    // Uniswap pools...
    "0x3f48e6a50b75d0eb5f59f7c7201b577cffbdc132", "0x4a4d2410c3d4cfa8dd0d275bedefbd2f7b61ba2e",
    "0xd30ef9144a8d26f816bcfcebc1f0c7215adb4964", "0xd6a812d6b9b4610b6e621565604b6f59673078f0",
    "0x118e9e3587f86db802637b69c66ef1b02ca806cc", "0x13394005c1012e708fce1eb974f1130fdc73a5ce",
    "0x2cfc37c3a9fdc103374c2c343c48fef27c646b0a", "0xc30C8b862f7DE6bA5d7Eaeb113c78EC6B5dED04b",
    "0x643ea0885875a77bf8dc3e0f3ead866a125276b1", "0x81af3a74d9a2010a4e77a3f960a189fbc6d7cdd1",
    "0xa8b1a6acc942b8266f987c4b0cdf625e3479a26b", "0xaa4c9d6e5e349f319abb625aa8dca5f52abea757",
    "0xc30c8b862f7de6ba5d7eaeb113c78ec6b5ded04b", "0xd3f5c377a8506af29aeafbc90d1e5c6534f197b4",
    "0xdd2e0d86a45e4ef9bd490c2809e6405720cc357c", "0xf313d711d71eb9a607b4a61a827a9e32a7846621",
    "0x26d4c30a6b203911c7e435953d77c826ae254377", "0x74a50563786db25dd389ef08373ffe359eb198f1",
    "0x9001841320f89a6ca54acb8fce20d568ccdf42e8", "0xdaa19f38d3f5efab963dfefecee60aaddaf89145"
]);

export async function detectSandwiches() {
    try {
        const transactions = await fetchPYUSDTransfers();

        // Write to CSV for inspection
        const writeStream = fs.createWriteStream('transactions.csv');
        writeStream.write('block_number,transaction_index,transaction_hash,token_address,from_address,to_address,dex_name,block_timestamp,gas_price,gas,amount\n');
        transactions.forEach(tx => {
            writeStream.write(`${tx.block_number},${tx.transaction_index},${tx.transaction_hash},${tx.token_address},${tx.from_address},${tx.to_address},${tx.dex_name},${tx.block_timestamp},${tx.gas_price},${tx.gas},${tx.amount}\n`);
        });
        writeStream.end();

        console.log('Transactions written to transactions.csv');
        console.log("Total transactions:", transactions.length);

        // Group transactions by block
        const blocks = new Map();
        for (const tx of transactions) {
            const block = Number(tx.block_number);
            if (!blocks.has(block)) {
                blocks.set(block, []);
            }
            blocks.get(block).push(tx);
        }

        const sandwiches = [];

        // Process each block
        for (const [blockNumber, txs] of blocks.entries()) {
            txs.sort((a, b) => Number(a.transaction_index) - Number(b.transaction_index));

            const txsBySender = {};
            for (const tx of txs) {
                if (!txsBySender[tx.from_address]) {
                    txsBySender[tx.from_address] = [];
                }
                txsBySender[tx.from_address].push(tx);
            }

            for (const attacker in txsBySender) {
                const attackerTxs = txsBySender[attacker].sort((a, b) => Number(a.transaction_index) - Number(b.transaction_index));
                if (attackerTxs.length < 2) continue;

                for (let i = 0; i < attackerTxs.length - 1; i++) {
                    const frontRun = attackerTxs[i];
                    const backRun = attackerTxs[i + 1];

                    const midTxs = txs.filter(tx =>
                        Number(tx.transaction_index) > Number(frontRun.transaction_index) &&
                        Number(tx.transaction_index) < Number(backRun.transaction_index) &&
                        tx.from_address !== attacker &&
                        tx.to_address === frontRun.to_address &&
                        tx.to_address === backRun.to_address &&
                        Number(tx.gas_price) < Number(frontRun.gas_price) &&
                        Number(tx.gas_price) < Number(backRun.gas_price)
                    );

                    for (const victim of midTxs) {
                        sandwiches.push({
                            attacker: attacker,
                            victim: victim.from_address,
                            token: victim.to_address,
                            block_number: blockNumber.toString(),
                            victim_tx: victim.transaction_hash,
                            front_run_tx: frontRun.transaction_hash,
                            back_run_tx: backRun.transaction_hash,
                        });
                    }
                }
            }
        }

        return sandwiches;
    } catch (error) {
        console.error('Error detecting sandwich attacks:', error);
        throw error;
    }
}
