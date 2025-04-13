import { useEffect } from 'react';
import Papa from 'papaparse';


const CSVUploader = ({ onDataParsed }) => {
    useEffect(() => {
        // Automatically load the suspiciousTxs.csv file
        const filePath = '/suspiciousTxs.csv'; // Correct path for files in the public directory

        fetch(filePath)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to load CSV file: ${response.statusText}`);
                }
                return response.text();
            })
            .then((csvText) => {
                // Parse the CSV file using PapaParse
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        onDataParsed(results.data);
                    },
                });
            })
            .catch((error) => {
                console.error('Error loading CSV file:', error);
            });
    }, [onDataParsed]);

    return (
        <div className="p-4 rounded-md">
            <p className="text-m font-medium text-gray-700">
                Loading data from <strong>suspiciousTxs.csv</strong>
            </p>
        </div>
    );
};

export default CSVUploader;