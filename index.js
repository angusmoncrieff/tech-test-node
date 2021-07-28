const fs = require("fs");
const Papa = require("papaparse");

const inPath = "./data-in/task-data.csv"
const outPath = './data-out/output-angus.csv'
const ciqHeader = 'ColInQuestion'               // ciq = 'column in question'
const newColPrefix = '^'                        // prepended to each new column
const selected = 1
const notSelected = 2

function main() {

    fs.readFile(inPath, { encoding: 'utf8' }, (error, fileData) => {

        // Extract the 'actual' data (as opposed to the metadata that Papa.parse returns).
        const { data: csvData } = Papa.parse(fileData);

        const headerRow = csvData[0]
        const dataRows = csvData.slice(1)
        const ciqIndex = headerRow.findIndex(headText => headText === ciqHeader)

        // Build list of all unique values in the col in question (ciq)
        const allCiqValues = dataRows.reduce((list, currRow) => {

            // Get values for current row as an array
            const currRowCiqValues = currRow[ciqIndex].split(';')

            // Add curr row values to the list array, and remove duplicates using Set
            return [...new Set(list.concat(currRowCiqValues))]

        }, [])

        // console.log(allCiqValues)

        // Prepend something to guarantee no clash with existing cols
        const newColHeaders = allCiqValues.map(val => `${newColPrefix}${val}`)
        const newHeaderRow = [...headerRow, ...newColHeaders]

        // Construct the data to fill the new columns
        let newColsData = []

        // Step through each row..
        for (let currRow of dataRows) {

            // Get values for current row as an array
            const currRowCiqValues = currRow[ciqIndex].split(';')

            // Build array of selected/unselected values for this row
            const currRowNewColValues = allCiqValues
                .map(ciqValue => currRowCiqValues.includes(ciqValue) ? selected : notSelected)
            // console.log(currRowNewColValues)

            // Append these new col values to end of current row
            newColsData.push([...currRow, ...currRowNewColValues])
            // console.log(currRow)
        }

        // Construct the whole new csv structure
        const output = [
            newHeaderRow,
            ...newColsData                      // all the data (already combined above)
        ]

        // console.log(output[0].length)
        // console.log(output[1].length)

        write({
            ...csvData,
            data: output
        })

    })

}

function write(data) {
    // Convert back to CSV - transformeddata is the same object form as csvdata 
    const newCSV = Papa.unparse(data);
    fs.writeFileSync(outPath, newCSV);
}


main()