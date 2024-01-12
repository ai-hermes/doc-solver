import SparkMD5 from 'spark-md5';

export function readFileAsync(file: File): Promise<ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            if (event.target) {
                resolve(event.target.result as ArrayBuffer)
            }
            resolve(null);
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
}

export async function calculateMD5Async(buffer: ArrayBuffer) {
    // crypto-js calculate md5 not equal to md5sum
    // change crypto-js to spark-md5
    const spark = new SparkMD5.ArrayBuffer();
    spark.append(buffer);
    const md5 = spark.end();
    return md5;
}
