"use client";

import { useState } from 'react';
import { motion } from "framer-motion";
import CSVUploader from '@/components/CSVUploader';
import SandwichChart from '@/components/SandwichChart';

export default function Dashboard() {
    interface TransformedDataItem {
        block_number: number;
        attack_count: number;
    }

    const [sandwichData, setSandwichData] = useState<TransformedDataItem[]>([]);

    // Define the CSVDataItem interface outside the function
    interface CSVDataItem {
        block_number: string;
    }

    const handleDataParsed = (data: CSVDataItem[]) => {
      // Transform CSV data into chart-compatible format

      interface TransformedDataItem {
        block_number: number;
        attack_count: number;
      }

      const transformedData: TransformedDataItem[] = data.reduce((acc: TransformedDataItem[], item: CSVDataItem) => {
        const block = acc.find((b) => b.block_number === parseInt(item.block_number));
        if (block) {
          block.attack_count += 1;
        } else {
          acc.push({ block_number: parseInt(item.block_number), attack_count: 1 });
        }
        return acc;
      }, []);
      setSandwichData(transformedData);
    };

    return (
      <div className="min-h-screen bg-amber-400 p-6">
      <h1 className="text-8xl font-bold text-center mb-5 text-black" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
          Sandwich Attack Dashboard
      </h1>
  
      <motion.div
          className="max-w-4xl mx-auto space-y-6 text-center bg-amber-500 text-4xl border-4 border-black rounded-2xl shadow-lg p-4"
          style={{ fontFamily: '"Nunito", sans-serif' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
      >
          {/* CSVUploader automatically loads suspiciousTxs.csv */}
          <CSVUploader onDataParsed={handleDataParsed} />
      </motion.div>
  
      <motion.div
          className="max-w-4xl mx-auto space-y-8 bg-amber-200 border-4 border-black rounded-2xl shadow-lg p-6 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
      >
          {/* Render the SandwichChart if data is available */}
          {sandwichData.length > 0 && <SandwichChart data={sandwichData} />}
      </motion.div>
  </div>
    );
}