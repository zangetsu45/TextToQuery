// // Database Metadata
// const dbMetadata = {
//     customers: ['customer_id', 'name', 'age', 'city', 'join_date'],
//     accounts: ['account_id', 'customer_id', 'balance', 'account_type', 'opening_date'],
//     transactions: ['transaction_id', 'account_id', 'amount', 'transaction_type', 'transaction_date'],
// };

// // Table Mappings
// const tableMappings = {
//     customer: 'customers',
//     customers: 'customers',
//     account: 'accounts',
//     accounts: 'accounts',
//     transaction: 'transactions',
//     transactions: 'transactions',
// };

// // Column Mappings
// const columnMappings = {
//     'customer id': 'customer_id',
//     'customer name': 'name',
//     'customer names': 'name',
//     'name': 'name',
//     'names': 'name',
//     'age': 'age',
//     'ages': 'age',
//     'city': 'city',
//     'cities': 'city', // Added this line
//     'join date': 'join_date',
//     'balance': 'balance',
//     'balances': 'balance',
//     'type': 'account_type',
//     'types': 'account_type',
//     'account type': 'account_type',
//     'account types': 'account_type',
//     'account_type': 'account_type',
//     'amount': 'amount',
//     'amounts': 'amount',
//     'transaction type': 'transaction_type',
//     'transaction types': 'transaction_type',
//     'transaction_type': 'transaction_type',
//     'opening date': 'opening_date',
//     'transaction date': 'transaction_date',
//     'customer names': 'name',
//     'account balances': 'balance',
//     'transaction amounts': 'amount',
//     'transaction amount': 'amount',
//     'account balance': 'balance',
//     'accounts balance': 'balance', // Added this line
//     'account number': 'account_id',
//     'number of transactions': 'transaction_id',
//     //'transactions': 'transaction_id',
//     // Adding 'all' modifiers
//     'all customers': '*',
//     'all accounts': '*',
//     'all transactions': '*',
// };
const fs = require('fs');
const pluralize = require('pluralize')
const dbMetadataFromFile = JSON.parse(fs.readFileSync('./service/metadata.json', 'utf-8'));
const tableMappings = {};
const columnMappings = {};
function generateVariants(name) {
    const variants = new Set();
    const singular = pluralize.singular(name);
    const plural = pluralize.plural(name);
    variants.add(name);
    variants.add(singular);
    variants.add(plural);
    variants.add(name.toLowerCase());
    variants.add(singular.toLowerCase());
    variants.add(plural.toLowerCase());
    const nameWithSpaces = name.replace(/_/g, ' ');
    variants.add(nameWithSpaces);
    variants.add(nameWithSpaces.toLowerCase());
    variants.add(pluralize.singular(nameWithSpaces));
    variants.add(pluralize.plural(nameWithSpaces));
    variants.add(pluralize.singular(nameWithSpaces.toLowerCase()));
    variants.add(pluralize.plural(nameWithSpaces.toLowerCase()));

    return Array.from(variants);
}
Object.keys(dbMetadataFromFile).forEach((tableName) => {
    const variants = generateVariants(tableName);
    variants.forEach((variant) => {
        tableMappings[variant] = tableName;
    });
});
const allColumns = new Set();
Object.values(dbMetadataFromFile).forEach((columns) => {
    columns.forEach((column) => allColumns.add(column));
});

allColumns.forEach((columnName) => {
    const variants = generateVariants(columnName);
    variants.forEach((variant) => {
        columnMappings[variant] = columnName;
    });
});

// Step 5: Generate combined mappings (e.g., 'customer name')
Object.keys(dbMetadataFromFile).forEach((tableName) => {
    const tableVariants = generateVariants(tableName);
    dbMetadataFromFile[tableName].forEach((columnName) => {
        const columnVariants = generateVariants(columnName);
        tableVariants.forEach((tableVariant) => {
            columnVariants.forEach((columnVariant) => {
                const combinedVariant = `${tableVariant} ${columnVariant}`;
                columnMappings[combinedVariant] = columnName;
            });
        });
    });
});

// Step 6: Add 'all' modifiers
Object.keys(dbMetadataFromFile).forEach((tableName) => {
    const tableVariants = generateVariants(tableName);
    tableVariants.forEach((variant) => {
        const allVariant = `all ${variant}`;
        columnMappings[allVariant] = '*';
    });
});

console.log("column mapping",columnMappings);
// Aggregation Mappings
const aggregationMappings = {
    'average': 'AVG',
    'avg': 'AVG',
    'sum': 'SUM',
    'total': 'SUM',
    'count': 'COUNT',
    'number': 'COUNT',
    'max': 'MAX',
    'highest': 'MAX',
    'min': 'MIN',
    'lowest': 'MIN',
    'unique': 'DISTINCT',
    'distinct': 'DISTINCT',
};

// Operator Mappings
const operatorMappings = [
    ['greater than or equal to', '>='],
    ['more than or equal to', '>='],
    ['less than or equal to', '<='],
    ['not equal to', '!='],
    ['greater than', '>'],
    ['more than', '>'],
    ['less than', '<'],
    ['not equal', '!='],
    ['at least', '>='],
    ['equal to', '='],
    ['at most', '<='],
    ['equals', '='],
    ['is not', '!='],
    ['above', '>'],
    ['below', '<'],
    ['under', '<'],
    ['is', '='],
    ['>=', '>='],
    ['<=', '<='],
    ['!=', '!='],
    ['>', '>'],
    ['<', '<'],
    ['=', '='],
];

// Conjunction Mappings
const conjunctionMappings = {
    'and': 'AND',
    'or': 'OR',
};

// Order Mappings
const orderMappings = {
    'ascending': 'ASC',
    'asc': 'ASC',
    'descending': 'DESC',
    'desc': 'DESC',
    'from oldest to newest': 'ASC',
    'from newest to oldest': 'DESC',
    'from highest to lowest': 'DESC',
    'from lowest to highest': 'ASC',
    'highest to lowest': 'DESC',
    'lowest to highest': 'ASC',
    'highest': 'DESC',
    'lowest': 'ASC',
};


function isNumeric(value) {
    return /^-?\d+(\.\d+)?$/.test(value);
}

function quoteValue(value) {
    if (isNumeric(value)) return value;
    return `'${value.replace(/^'|'$/g, '').replace(/'/g, "''")}'`;
}

// Extract Condition Function
function extractCondition(part) {
    const sortedOperatorMappings = [...operatorMappings].sort((a, b) => b[0].length - a[0].length);
    const operatorPhrases = sortedOperatorMappings.map(entry => entry[0].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const operatorRegex = operatorPhrases.join('|');

    // Define a set of SQL keywords that signal the end of a condition
    const clauseKeywords = ['group by', 'order by', 'having', 'limit', 'offset'];
    const clauseRegex = new RegExp(`\\s*(${clauseKeywords.join('|')})\\b`, 'i');

    const pattern = new RegExp(`(${Object.keys(columnMappings).map(k => k.replace(/ /g, '\\s+')).join('|')})\\s+(?:is\\s+)?(${operatorRegex})\\s+(.+)`, 'i');
    let match = part.match(pattern);

    if (match) {
        let columnPhrase = match[1];
        let phrase = match[2];
        let value = match[3];

        // Truncate value at the first SQL clause keyword if present
        const clauseMatch = value.match(clauseRegex);
        if (clauseMatch) {
            value = value.slice(0, clauseMatch.index).trim();
        }

        // Additional processing to extract only the relevant part of the value
        if (value.startsWith("'") || value.startsWith('"')) {
            const quote = value[0];
            const endQuoteIndex = value.indexOf(quote, 1);
            if (endQuoteIndex !== -1) {
                value = value.substring(0, endQuoteIndex + 1);
            }
        } else {
            // If numeric, extract the number
            const numMatch = value.match(/^[-+]?\d*\.?\d+/);
            if (numMatch) {
                value = numMatch[0];
            } else {
                // Take the first word
                const firstWord = value.split(/\s+/)[0];
                value = firstWord;
            }
        }

        const operatorEntry = sortedOperatorMappings.find(entry => entry[0].toLowerCase() === phrase.toLowerCase());
        const operator = operatorEntry ? operatorEntry[1] : '=';
        let column = columnMappings[columnPhrase.toLowerCase()] || columnPhrase;
        value = quoteValue(value.trim());
        return `${column} ${operator} ${value}`;
    } else {
        const patternIs = new RegExp(`(${Object.keys(columnMappings).map(k => k.replace(/ /g, '\\s+')).join('|')})\\s+is\\s+(.+)`, 'i');
        match = part.match(patternIs);
        if (match) {
            let columnPhrase = match[1];
            let value = match[2];

            // Truncate value at the first SQL clause keyword if present
            const clauseMatch = value.match(clauseRegex);
            if (clauseMatch) {
                value = value.slice(0, clauseMatch.index).trim();
            }

            // Additional processing to extract only the relevant part of the value
            if (value.startsWith("'") || value.startsWith('"')) {
                const quote = value[0];
                const endQuoteIndex = value.indexOf(quote, 1);
                if (endQuoteIndex !== -1) {
                    value = value.substring(0, endQuoteIndex + 1);
                }
            } else {
                // If numeric, extract the number
                const numMatch = value.match(/^[-+]?\d*\.?\d+/);
                if (numMatch) {
                    value = numMatch[0];
                } else {
                    // Take the first word
                    const firstWord = value.split(/\s+/)[0];
                    value = firstWord;
                }
            }

            const operator = '=';
            let column = columnMappings[columnPhrase.toLowerCase()] || columnPhrase;
            value = quoteValue(value.trim());
            return `${column} ${operator} ${value}`;
        }
    }

    const patternColon = new RegExp(`(${Object.keys(columnMappings).map(k => k.replace(/ /g, '\\s+')).join('|')})[:]?\\s+(.+)`, 'i');
    match = part.match(patternColon);
    if (match) {
        let columnPhrase = match[1];
        let value = match[2];

        // Truncate value at the first SQL clause keyword if present
        const clauseMatch = value.match(clauseRegex);
        if (clauseMatch) {
            value = value.slice(0, clauseMatch.index).trim();
        }

        // Additional processing to extract only the relevant part of the value
        if (value.startsWith("'") || value.startsWith('"')) {
            const quote = value[0];
            const endQuoteIndex = value.indexOf(quote, 1);
            if (endQuoteIndex !== -1) {
                value = value.substring(0, endQuoteIndex + 1);
            }
        } else {
            // If numeric, extract the number
            const numMatch = value.match(/^[-+]?\d*\.?\d+/);
            if (numMatch) {
                value = numMatch[0];
            } else {
                // Take the first word
                const firstWord = value.split(/\s+/)[0];
                value = firstWord;
            }
        }

        let column = columnMappings[columnPhrase.toLowerCase()] || columnPhrase;
        value = quoteValue(value.trim());
        return `${column} = ${value}`;
    }

    return null;
}

// Extract HAVING Condition Function
function extractHavingCondition(part, tables, defaultAggFunc = 'AVG') {
    console.log("Extracting HAVING condition for:", part);
    const sortedOperatorMappings = [...operatorMappings].sort((a, b) => b[0].length - a[0].length);
    const operatorPhrases = sortedOperatorMappings.map(entry => entry[0].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const operatorRegex = operatorPhrases.join('|');
    console.log("Operator Regex:", operatorRegex);

    const aggregationWords = Object.keys(aggregationMappings).join('|');

    // Try to match 'operator value column' pattern
    const pattern = new RegExp(`^(${operatorRegex})\\s+([\\d\\.]+)\\s+(${Object.keys(columnMappings).map(k => k.replace(/ /g, '\\s+')).join('|')}|${Object.keys(tableMappings).join('|')})\\b`, 'i');
    let match = part.match(pattern);
    if (match) {
        console.log("Match found:", match);
        const operatorPhrase = match[1];
        let value = match[2];
        let columnPhrase = match[3];

        // Additional processing to extract only the relevant part of the value
        if (value.startsWith("'") || value.startsWith('"')) {
            const quote = value[0];
            const endQuoteIndex = value.indexOf(quote, 1);
            if (endQuoteIndex !== -1) {
                value = value.substring(0, endQuoteIndex + 1);
            }
        } else {
            // If numeric, extract the number
            const numMatch = value.match(/^[-+]?\d*\.?\d+/);
            if (numMatch) {
                value = numMatch[0];
            } else {
                // Take the first word
                const firstWord = value.split(/\s+/)[0];
                value = firstWord;
            }
        }

        const operatorEntry = sortedOperatorMappings.find(entry => entry[0].toLowerCase() === operatorPhrase.toLowerCase());
        const operator = operatorEntry ? operatorEntry[1] : '=';

        let aggFunc = 'COUNT';
        let mappedColumn = '*';

        if (columnMappings[columnPhrase.toLowerCase()]) {
            mappedColumn = columnMappings[columnPhrase.toLowerCase()];
            const table = getTableForColumn(mappedColumn, tables);
            if (table) {
                mappedColumn = `${table}.${mappedColumn}`;
            }
        } else if (tableMappings[columnPhrase.toLowerCase()]) {
            mappedColumn = '*';
            tables.add(tableMappings[columnPhrase.toLowerCase()]);
        }

        const condition = `${aggFunc}(${mappedColumn}) ${operator} ${quoteValue(value.trim())}`;
        console.log("Generated HAVING condition:", condition);
        return condition;
    }

    // Existing matching logic...

    console.log("No match found, returning null for HAVING condition.");
    return null;
}

// Tokenize Columns Function
function tokenizeColumns(text) {
    const columnPhrases = Object.keys(columnMappings).sort((a, b) => b.length - a.length);
    const tokens = [];
    let remainingText = text;
    while (remainingText.length > 0) {
        let matched = false;
        for (let phrase of columnPhrases) {
            const regex = new RegExp(`^${phrase}\\b`, 'i');
            const match = remainingText.match(regex);
            if (match) {
                const mappedValue = columnMappings[phrase.toLowerCase()];
                if (mappedValue === '*') {
                    const words = phrase.split(' ');
                    const tableName = words[words.length - 1];
                    const table = tableMappings[tableName.toLowerCase()];
                    if (table) {
                        tokens.push(`${table}.*`);
                    }
                } else {
                    tokens.push(mappedValue);
                }
                remainingText = remainingText.slice(match[0].length).trim();
                matched = true;
                break;
            }
        }
        if (!matched) {
            const separatorPhrases = ['and', 'with', 'by', 'of', 'in', 'among', 'along with'];
            const separatorPhrasesEscaped = separatorPhrases.map(phrase => phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/ /g, '\\s+'));
            const separatorRegex = new RegExp(`^(.*?)\\b(?:${separatorPhrasesEscaped.join('|')})\\b\\s+(.*)$`, 'i');
            const splitMatch = remainingText.match(separatorRegex);
            if (splitMatch) {
                const firstPart = splitMatch[1].trim();
                if (firstPart.length > 0) {
                    tokens.push(...tokenizeColumns(firstPart));
                }
                remainingText = splitMatch[2].trim();
                matched = true;
            } else {
                const stopWords = ['the', 'a', 'an', 'of', 'in', 'on', 'for', 'with', 'and', 'or', 'to', 'among', 'all'];
                const words = remainingText.split(/\s+/);
                if (stopWords.includes(words[0].toLowerCase())) {
                    remainingText = words.slice(1).join(' ');
                } else {
                    tokens.push(remainingText.trim());
                    break;
                }
            }
        }
    }
    return tokens;
}

// Extract Aggregation Function (Corrected)
function extractAggregations(phrase) {
    const aggregationWords = Object.keys(aggregationMappings);
    aggregationWords.sort((a, b) => b.length - a.length);

    const aggregations = [];
    let remainingPhrase = phrase.trim();

    // Remove leading stop words
    remainingPhrase = remainingPhrase.replace(/^(?:the|a|an|of|in|on|for|with|and|or|to|among|all)\s+/i, '');

    // Split by 'and' or ','
    const parts = remainingPhrase.split(/\band\b|,/i).reverse(); // Process in reverse
    let lastColumn = null;

    parts.forEach(part => {
        part = part.trim();
        let matched = false;
        for (let aggWord of aggregationWords) {
            const regex = new RegExp(`\\b${aggWord}\\b(?:\\s+(?:of\\s+)?(.+))?`, 'i'); // Make column optional
            const match = part.match(regex);
            if (match) {
                let columnPhrase = match[1] ? match[1].trim() : null;
                const aggFunc = aggregationMappings[aggWord.toLowerCase()];

                let mappedColumn = null;

                if (columnPhrase) {
                    // Split columnPhrase at 'of', 'from', 'among', 'in', 'per', 'for', 'sorted by' and take the first part
                    if (columnPhrase.match(/\b(of|from|among|in|per|for|sorted by)\b/)) {
                        columnPhrase = columnPhrase.split(/\b(of|from|among|in|per|for|sorted by)\b/)[0].trim();
                    }

                    // Remove any trailing stop words or phrases
                    columnPhrase = columnPhrase.replace(/\b(are|is|was|were|there|do|does|did|have|has|had|the|a|an|of|in|on|for|with|and|or|to|among|all)\b.*$/i, '').trim();

                    // Map columnPhrase to column
                    mappedColumn = columnMappings[columnPhrase.toLowerCase()] || columnPhrase;

                    if (mappedColumn !== '' && Object.values(dbMetadataFromFile).some(cols => cols.includes(mappedColumn))) {
                        lastColumn = mappedColumn;
                    }
                } else {
                    mappedColumn = lastColumn;
                }

                if (mappedColumn) {
                    aggregations.push({
                        aggFunc,
                        column: mappedColumn
                    });
                }

                matched = true;
                break;
            }
        }
        if (!matched) {
            // If the part contains a column, set lastColumn
            const columns = tokenizeColumns(part);
            if (columns.length > 0) {
                const potentialColumn = columns[columns.length -1];
                const mappedColumn = columnMappings[potentialColumn.toLowerCase()] || potentialColumn;
                if (Object.values(dbMetadataFromFile).some(cols => cols.includes(mappedColumn))) {
                    lastColumn = mappedColumn;
                }
            }
        }
    });

    // Assign lastColumn to any aggregation with empty column
    aggregations.forEach(agg => {
        if (!agg.column || agg.column === '') {
            agg.column = lastColumn;
        }
    });

    console.log("aggregations:- ", aggregations);
    return aggregations.reverse(); // Reverse to maintain the original order
}

// Helper Function to Get Table for a Column
function getTableForColumn(column, tables) {
    const matchingTables = [];
    for (const table in dbMetadataFromFile) {
        if (dbMetadataFromFile[table].includes(column)) {
            matchingTables.push(table);
        }
    }
    if (matchingTables.length === 1) {
        tables.add(matchingTables[0]);
        return matchingTables[0];
    } else if (matchingTables.length > 1) {
        // Prefer 'transactions' over others if possible, adjust based on your schema
        const preferredTable = 'transactions';
        if (matchingTables.includes(preferredTable)) {
            tables.add(preferredTable);
            return preferredTable;
        }
        tables.add(matchingTables[0]);
        return matchingTables[0];
    } else {
        return null;
    }
}

// Main Parsing Function
function parseQuery(query) {
    query = query.replace(/[?\.]/g, '').trim();
    let tables = new Set();
    let selectColumns = [];
    let aggregationColumns = [];
    let conditions = [];
    let groupByColumns = new Set();
    let havingConditions = [];
    let orderByColumns = [];
    let limit = null;

    // Identify Tables in Query
    for (const [key, value] of Object.entries(tableMappings)) {
        if (new RegExp(`\\b${key}\\b`, 'i').test(query)) {
            tables.add(value);
        }
    }

    if (tables.size === 0) {
        return "Sorry, no such tables exist.";
    }

    // Extract Action and Columns
    const selectPattern = /\b(show|display|list|what is|calculate|find|count|give me|select|how many|how much|find the total number of)\b\s+(.*)/i;
    const selectMatch = query.match(selectPattern);
    let actionVerb = null;
    if (selectMatch) {
        actionVerb = selectMatch[1].toLowerCase();
        let columnsPart = selectMatch[2];

        // Handle Aggregations based on Action Verb
        if (actionVerb === 'how many' || actionVerb === 'find the total number of' || /total number of/i.test(columnsPart) || /number of/i.test(columnsPart)) {
            if (/accounts/i.test(columnsPart)) {
                tables.add('accounts');
                aggregationColumns.push('COUNT(*)');
            } else if (/customers/i.test(columnsPart)) {
                tables.add('customers');
                aggregationColumns.push('COUNT(*)');
            } else if (/transactions/i.test(columnsPart)) {
                tables.add('transactions');
                aggregationColumns.push('COUNT(*)');
            }
            columnsPart = columnsPart.replace(/total number of\s+\w+/i, '').trim();
        }

        // Clean Columns Part
        console.log("columns part = ", columnsPart);
        const columnsPartCleaned = columnsPart.split(/\bwhere\b|\border by\b|\bordered by\b|\bsorted by\b|\bgroup by\b|\bhaving\b|\blimit\b|\bper\b|\bin each\b|\bfor each\b/i)[0].trim();
        console.log("columns part cleaned = ", columnsPartCleaned);

        // Handle 'how many unique' scenario
        if ((actionVerb === 'how many' || actionVerb === 'find the total number of') && columnsPartCleaned.toLowerCase().includes('unique')) {
            const uniqueColumnMatch = columnsPartCleaned.match(/unique\s+(.*)/i);
            if (uniqueColumnMatch) {
                let columnPhrase = uniqueColumnMatch[1].trim();

                // Remove trailing stop words
                columnPhrase = columnPhrase.replace(/\b(are|is|was|were|there|do|does|did|have|has|had|the|a|an|of|in|on|for|with|and|or|to|among|all)\b.*$/i, '').trim();

                let mappedColumn = columnMappings[columnPhrase.toLowerCase()] || columnPhrase;
                const table = getTableForColumn(mappedColumn, tables);
                if (table) {
                    aggregationColumns.push(`COUNT(DISTINCT ${table}.${mappedColumn})`);
                    tables.add(table);
                }
            }
        } else {
            // Extract possible aggregations from columnsPartCleaned
            const possibleAggregations = extractAggregations(columnsPartCleaned);
            if (possibleAggregations.length > 0) {
                console.log("abc ", possibleAggregations);
                possibleAggregations.forEach(({ aggFunc, column }) => {
                    const table = getTableForColumn(column, tables);
                    if (table) {
                        if (aggFunc === 'DISTINCT') {
                            if (actionVerb && (actionVerb === 'how many' || actionVerb === 'count' || actionVerb === 'find the total number of')) {
                                aggregationColumns.push(`COUNT(DISTINCT ${table}.${column})`);
                            } else {
                                selectColumns.push(`DISTINCT ${table}.${column}`);
                            }
                        } else {
                            aggregationColumns.push(`${aggFunc}(${table}.${column})`);
                        }
                        tables.add(table);
                    }
                });
            } else {
                const columns = tokenizeColumns(columnsPartCleaned);
                console.log("columns = ", columns);

                let aggregationsList = [];
                columns.forEach((column) => {
                    column = column.trim();
                    const columnAggregations = extractAggregations(column);
                    console.log("columnAggregations = ", columnAggregations);
                    if (columnAggregations.length > 0) {
                        columnAggregations.forEach(({ aggFunc, column: col }) => {
                            const table = getTableForColumn(col, tables);
                            if (table) {
                                if (aggFunc === 'DISTINCT') {
                                    if (actionVerb && (actionVerb === 'how many' || actionVerb === 'count' || actionVerb === 'find the total number of')) {
                                        aggregationColumns.push(`COUNT(DISTINCT ${table}.${col})`);
                                    } else {
                                        selectColumns.push(`DISTINCT ${table}.${col}`);
                                    }
                                    tables.add(table);
                                } else {
                                    aggregationColumns.push(`${aggFunc}(${table}.${col})`);
                                }
                            }
                        });
                    } else if (aggregationMappings[column.toLowerCase()]) {
                        // Handle standalone aggregation functions
                        console.log("hila");
                        aggregationsList.push({ aggFunc: aggregationMappings[column.toLowerCase()], column: '*' });
                    } else {
                        let mappedColumn = columnMappings[column.toLowerCase()] || column;
                        if (!mappedColumn) {
                            for (const table of tables) {
                                if (dbMetadataFromFile[table].includes(column)) {
                                    mappedColumn = column;
                                    break;
                                }
                            }
                        }
                        if (mappedColumn && mappedColumn !== '*') {
                            const table = getTableForColumn(mappedColumn, tables);
                            if (table) {
                                selectColumns.push(`${table}.${mappedColumn}`);
                                tables.add(table);
                            }
                        } else if (mappedColumn === '*') {
                            const words = column.split(' ');
                            const tableName = words[words.length - 1];
                            const table = tableMappings[tableName.toLowerCase()];
                            if (table) {
                                selectColumns.push(`${table}.*`);
                                tables.add(table);
                            }
                        } else if (column.endsWith('.*')) {
                            selectColumns.push(column);
                        }
                    }
                });

                if (aggregationsList.length > 0) {
                    aggregationsList.forEach(({ aggFunc, column }) => {
                        const table = getTableForColumn(column, tables);
                        if (table) {
                            aggregationColumns.push(`${aggFunc}(${table}.${column})`);
                            tables.add(table);
                        }
                    });
                }
            }
        }

        if (aggregationMappings[actionVerb]) {
            const aggFunction = aggregationMappings[actionVerb];
            if (aggregationColumns.length === 0 && !columnsPartCleaned.some(col => aggregationMappings[col.toLowerCase()])) {
                aggregationColumns.push(`${aggFunction}(*)`);
            }
        }
    } else {
        const possibleAggregations = extractAggregations(query);
        if (possibleAggregations.length > 0) {
            possibleAggregations.forEach(({ aggFunc, column }) => {
                const table = getTableForColumn(column, tables);
                if (table) {
                    if (aggFunc === 'DISTINCT') {
                        if (actionVerb && (actionVerb === 'how many' || actionVerb === 'count' || actionVerb === 'find the total number of')) {
                            aggregationColumns.push(`COUNT(DISTINCT ${table}.${column})`);
                        } else {
                            selectColumns.push(`DISTINCT ${table}.${column}`);
                        }
                    } else {
                        aggregationColumns.push(`${aggFunc}(${table}.${column})`);
                    }
                    tables.add(table);
                }
            });
        }
    }

    // Handle GROUP BY
    const groupByPattern = /\b(per|group by|in each|for each)\b\s*(.*)/i;
    const groupByMatch = query.match(groupByPattern);
    if (groupByMatch) {
        let groupByColumnsText = groupByMatch[2];
        groupByColumnsText = groupByColumnsText.split(/\bhaving\b|\border by\b|\blimit\b|\bsorted by\b/i)[0].trim(); // Adjusted regex
        const groupByColumnsList = tokenizeColumns(groupByColumnsText);
        groupByColumnsList.forEach(column => {
            column = column.trim();
            let mappedColumn = columnMappings[column.toLowerCase()] || column;
            if (mappedColumn === '*') return;
            const table = getTableForColumn(mappedColumn, tables);
            if (table) {
                mappedColumn = `${table}.${mappedColumn}`;
            }
            groupByColumns.add(mappedColumn);
            if (!selectColumns.includes(mappedColumn) && !aggregationColumns.includes(mappedColumn)) {
                selectColumns.push(mappedColumn);
            }
        });
    }

    // Handle HAVING
    const havingPattern = /\bhaving\b\s+(.*)/i;
    const havingMatch = query.match(havingPattern);
    if (havingMatch) {
        const havingPart = havingMatch[1];
        const condition = extractHavingCondition(havingPart.trim(), tables);
        console.log("condition :", condition);
        if (condition) havingConditions.push(condition);
    }

    // Handle SELECT Columns
    if (selectColumns.length === 0 && aggregationColumns.length === 0) {
        if (actionVerb && aggregationMappings[actionVerb]) {
            const aggFunc = aggregationMappings[actionVerb];
            aggregationColumns.push(`${aggFunc}(*)`);
        } else if (groupByColumns.size > 0) {
            selectColumns = Array.from(groupByColumns);
        } else {
            selectColumns.push('*');
        }
    }

    // Ensure selectColumns includes groupByColumns if not already present
    if (groupByColumns.size > 0) {
        const groupByArray = Array.from(groupByColumns);
        groupByArray.forEach(col => {
            if (!selectColumns.includes(col)) {
                selectColumns.push(col);
            }
        });
    }

    // Construct finalSelectColumns by combining selectColumns and aggregationColumns
    const finalSelectColumns = [...selectColumns, ...aggregationColumns];

    // Extract WHERE Conditions
    const wherePattern = /\bwhere\b\s+(.*)/i;
    const whereMatch = query.match(wherePattern);
    if (whereMatch) {
        const conditionsPart = whereMatch[1];
        const conditionTokens = conditionsPart.split(/\s+(and|or)\s+/i);
        conditionTokens.forEach((part, index) => {
            if (index % 2 === 0) {
                console.log("part = ", part);
                const condition = extractCondition(part.trim());
                console.log("where clause", condition);
                if (condition) conditions.push(condition);
            } else {
                const conjunction = conjunctionMappings[part.trim().toLowerCase()];
                if (conjunction) conditions.push(conjunction);
            }
        });
    } else {
        const conditionPattern = /\b(who|that|which|where)\b\s+(.*)/i;
        const conditionMatch = query.match(conditionPattern);
        if (conditionMatch) {
            const conditionsPart = conditionMatch[2];
            const condition = extractCondition(conditionsPart.trim());
            if (condition) conditions.push(condition);
        }
    }

    // Handle Specific Patterns (e.g., account number)
    const accountNumberPattern = /\baccount number[:]? (\d+)/i;
    const accountNumberMatch = query.match(accountNumberPattern);
    if (accountNumberMatch) {
        const accountNumber = accountNumberMatch[1];
        conditions.push(`account_id = '${accountNumber}'`);
    }

    // Handle Date Ranges
    const datePattern = /\bfor\s+([A-Za-z]+)\s+(\d{4})/i;
    const dateMatch = query.match(datePattern);
    if (dateMatch) {
        const monthName = dateMatch[1];
        const year = dateMatch[2];
        const monthNumber = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
        const startDate = `${year}-${monthNumber.toString().padStart(2, '0')}-01`;
        const endDate = new Date(year, monthNumber, 0).getDate();
        const endDateStr = `${year}-${monthNumber.toString().padStart(2, '0')}-${endDate}`;

        // Assuming transaction_date is the date column
        conditions.push(`transaction_date BETWEEN '${startDate}' AND '${endDateStr}'`);
    }

    // Handle ORDER BY and LIMIT Clauses
    const orderPattern = /(?:order by|ordered by|sorted by)\s+(.+)/i;
    const orderMatch = query.match(orderPattern);
    if (orderMatch) {
        let orderPart = orderMatch[1].trim();
        let direction = 'ASC';

        // Check for 'highest' or 'lowest' in orderPart
        for (const [orderKey, orderValue] of Object.entries(orderMappings)) {
            if (new RegExp(`\\b${orderKey}\\b`, 'i').test(orderPart)) {
                direction = orderValue;
                orderPart = orderPart.replace(new RegExp(`\\b${orderKey}\\b`, 'i'), '').trim();
                break;
            }
        }

        // Extract aggregation from orderPart
        const orderAggregations = extractAggregations(orderPart);
        if (orderAggregations.length > 0) {
            orderAggregations.forEach(({ aggFunc, column }) => {
                const table = getTableForColumn(column, tables);
                if (table) {
                    const orderColumn = `${aggFunc}(${table}.${column}) ${direction}`;
                    orderByColumns.push(orderColumn);
                }
            });
        } else {
            let orderColumn = null;
            const orderTokens = tokenizeColumns(orderPart);
            for (let token of orderTokens) {
                token = token.trim();
                if (token.endsWith('.*')) {
                    orderColumn = token.slice(0, -2);
                    break;
                }
                let mappedColumn = columnMappings[token.toLowerCase()] || token;
                if (mappedColumn === '*') {
                    continue;
                }
                if (mappedColumn) {
                    const table = getTableForColumn(mappedColumn, tables);
                    if (table) {
                        orderColumn = `${table}.${mappedColumn} ${direction}`;
                        break;
                    }
                }
            }
            if (orderColumn) {
                orderByColumns.push(orderColumn);
            } else if (groupByColumns.size > 0 && aggregationColumns.length > 0) {
                orderByColumns.push(`${aggregationColumns[0]} ${direction}`);
            }
        }
    } else {
        const topMatch = query.match(/\btop\s+(\d+)/i);
        if (topMatch) {
            limit = parseInt(topMatch[1]);
            // Assuming that 'top' implies descending order
            let orderColumn = null;
            if (tables.has('transactions')) orderColumn = 'amount';
            else if (tables.has('accounts')) orderColumn = 'balance';
            else if (tables.has('customers')) orderColumn = 'age';
            const table = getTableForColumn(orderColumn, tables);
            if (table) {
                orderByColumns.push(`${table}.${orderColumn} DESC`);
            }
        }
    }

    // Handle LIMIT
    const limitMatch = query.match(/\b(limit|top|bottom)\s+(\d+)/i);
    if (limitMatch) {
        const limitType = limitMatch[1].toLowerCase();
        const limitValue = parseInt(limitMatch[2]);
        if (limitType === 'limit' || limitType === 'top') {
            limit = limitValue;
        } else if (limitType === 'bottom') {
            // Implementing 'bottom' would require knowing the total count or using ORDER BY ASC with LIMIT
            // For simplicity, we'll treat it similarly to 'limit' with ASC order
            limit = limitValue;
            // Adjust the last orderByColumn to ASC if it exists
            if (orderByColumns.length > 0) {
                orderByColumns[orderByColumns.length - 1] = orderByColumns[orderByColumns.length - 1].replace(/DESC$/i, 'ASC');
            }
        }
    }

    // Construct SQL Parts
    const sqlParts = [
        `SELECT ${finalSelectColumns.join(', ')}`
    ];

    let fromClause = '';
    let joinClauses = [];
    const tableArray = Array.from(tables);

    if (tableArray.length === 1) {
        fromClause = `FROM ${tableArray[0]}`;
    } else {
        fromClause = `FROM ${tableArray[0]}`;

        for (let i = 1; i < tableArray.length; i++) {
            const joinTable = tableArray[i];

            if (tableArray.includes('customers') && tableArray.includes('accounts') && tableArray.includes('transactions')) {
                // Join all three tables
                if (!joinClauses.includes('JOIN accounts ON customers.customer_id = accounts.customer_id')) {
                    joinClauses.push('JOIN accounts ON customers.customer_id = accounts.customer_id');
                }
                if (!joinClauses.includes('JOIN transactions ON accounts.account_id = transactions.account_id')) {
                    joinClauses.push('JOIN transactions ON accounts.account_id = transactions.account_id');
                }
            } else if ((tableArray.includes('customers') && tableArray.includes('accounts')) ||
                       (tableArray.includes('accounts') && tableArray.includes('customers'))) {
                // Join customers and accounts
                if (!joinClauses.includes(`JOIN ${joinTable} ON customers.customer_id = accounts.customer_id`)) {
                    joinClauses.push(`JOIN ${joinTable} ON customers.customer_id = accounts.customer_id`);
                }
            } else if ((tableArray.includes('customers') && tableArray.includes('transactions')) ||
                       (tableArray.includes('transactions') && tableArray.includes('customers'))) {
                // Join customers and transactions (requires accounts as intermediate table)
                if (!joinClauses.includes('JOIN accounts ON customers.customer_id = accounts.customer_id')) {
                    joinClauses.push('JOIN accounts ON customers.customer_id = accounts.customer_id');
                }
                if (!joinClauses.includes('JOIN transactions ON accounts.account_id = transactions.account_id')) {
                    joinClauses.push('JOIN transactions ON accounts.account_id = transactions.account_id');
                }
            } else if ((tableArray.includes('accounts') && tableArray.includes('transactions')) ||
                       (tableArray.includes('transactions') && tableArray.includes('accounts'))) {
                // Join accounts and transactions
                if (!joinClauses.includes(`JOIN ${joinTable} ON accounts.account_id = transactions.account_id`)) {
                    joinClauses.push(`JOIN ${joinTable} ON accounts.account_id = transactions.account_id`);
                }
            }
        }

    }

    sqlParts.push(fromClause);
    if (joinClauses.length > 0) {
        sqlParts.push(joinClauses.join(' '));
    }

    // Handle WHERE Clause
    if (conditions.length > 0) {
        sqlParts.push(`WHERE ${conditions.join(' ')}`);
    }

    // Handle GROUP BY Clause
    if (groupByColumns.size > 0) {
        sqlParts.push(`GROUP BY ${Array.from(groupByColumns).join(', ')}`);
    }

    // Handle HAVING Clause
    if (havingConditions.length > 0) {
        sqlParts.push(`HAVING ${havingConditions.join(' AND ')}`);
    }

    // Handle ORDER BY Clause
    if (orderByColumns.length > 0) {
        sqlParts.push(`ORDER BY ${orderByColumns.join(', ')}`);
    }

    // Handle LIMIT Clause
    if (limit !== null) {
        sqlParts.push(`LIMIT ${limit}`);
    }

    return sqlParts.join(' ') + ';';
}

// Run Tests Function
function runTests() {
    const testQueries = [
        // 1. Retrieve All Records
        { input: 'List all customers.', expected: 'SELECT * FROM customers;' },
        { input: 'Show all accounts.', expected: 'SELECT * FROM accounts;' },

        // 2. Select Specific Columns
        { input: 'Show the names and ages of customers.', expected: 'SELECT customers.name, customers.age FROM customers;' },
        { input: 'Display account types and balances from accounts.', expected: 'SELECT accounts.account_type, accounts.balance FROM accounts;' },

        // 3. WHERE Clause Conditions
        // Single Condition
        { input: 'Show me all accounts where the balance is greater than 1000.', expected: 'SELECT * FROM accounts WHERE balance > 1000;' },
        { input: 'List transactions where the amount is less than 500.', expected: 'SELECT * FROM transactions WHERE amount < 500;' },
        // Multiple Conditions
        { input: 'List all customers where age is at least 30 and city is \'New York\'.', expected: 'SELECT * FROM customers WHERE age >= 30 AND city = \'New York\';' },
        { input: 'Show accounts where balance is more than 1000 and account_type is \'Savings\'.', expected: 'SELECT * FROM accounts WHERE balance > 1000 AND account_type = \'Savings\';' },

        // 4. Aggregation Functions
        // Single Aggregation
        { input: 'Show the average age of customers.', expected: 'SELECT AVG(customers.age) FROM customers;' },
        { input: 'What is the total number of accounts?', expected: 'SELECT COUNT(*) FROM accounts;' },
        { input: 'Find the highest balance among all accounts.', expected: 'SELECT MAX(accounts.balance) FROM accounts;' },
        { input: 'List the lowest transaction amount.', expected: 'SELECT MIN(transactions.amount) FROM transactions;' },
        // Multiple Aggregations
        { input: 'Show the total and average balance from accounts.', expected: 'SELECT SUM(accounts.balance), AVG(accounts.balance) FROM accounts;' },
        { input: 'Display the total number of transactions and total amount of transactions per account_id', expected: 'SELECT transactions.account_id, COUNT(*), SUM(transactions.amount) FROM transactions GROUP BY transactions.account_id;' },

        // 5. GROUP BY Clause
        { input: 'Show the total balance per account type.', expected: 'SELECT accounts.account_type, SUM(accounts.balance) FROM accounts GROUP BY accounts.account_type;' },
        { input: 'List the number of customers in each city.', expected: 'SELECT customers.city, COUNT(*) FROM customers GROUP BY customers.city;' },
        { input: 'Display the average amount of transaction group by transaction type.', expected: 'SELECT transactions.transaction_type, AVG(transactions.amount) FROM transactions GROUP BY transactions.transaction_type;' },

        // 6. HAVING Clause
        { input: 'show the average account balance per account_type where balance is greater than 5000', expected: 'SELECT accounts.account_type, AVG(accounts.balance) FROM accounts GROUP BY accounts.account_type HAVING COUNT(accounts.balance) > 5000;' },
        { input: 'Show account_id number of transactions and total of amount for having number of transactions more than 100.', expected: 'SELECT accounts.account_id, COUNT(transactions.transaction_id), SUM(transactions.amount) FROM accounts JOIN transactions ON accounts.account_id = transactions.account_id GROUP BY accounts.account_id HAVING COUNT(transactions.transaction_id) > 100;' },
        { input: 'Display customer city with total number of customers greater than 10', expected: 'SELECT customers.city, COUNT(*) FROM customers GROUP BY customers.city HAVING COUNT(*) >= 10;' },

        // 7. JOIN Operations
        // Single JOIN
        { input: 'Show customer name along with  accounts balance .', expected: 'SELECT customers.name, accounts.balance FROM customers JOIN accounts ON customers.customer_id = accounts.customer_id;' },
        { input: 'Show transaction date along with customer names.', expected: 'SELECT transactions.transaction_date, customers.name FROM customers JOIN accounts ON customers.customer_id = accounts.customer_id JOIN transactions ON accounts.account_id = transactions.account_id;' },
        // Multiple JOINS
        { input: 'Find the total amount of transactions for each customer name', expected: 'SELECT customers.name, SUM(transactions.amount) FROM customers JOIN accounts ON customers.customer_id = accounts.customer_id JOIN transactions ON accounts.account_id = transactions.account_id GROUP BY customers.name;' },
        { input: 'Display customer names and account type, and transaction amounts.', expected: 'SELECT customers.name, accounts.account_type, transactions.amount FROM customers JOIN accounts ON customers.customer_id = accounts.customer_id JOIN transactions ON accounts.account_id = transactions.account_id;' },

        // 8. ORDER BY and LIMIT Clauses
        { input: 'List the top 5 customers with the most account balance.', expected: 'SELECT * FROM customers JOIN accounts ON customers.customer_id = accounts.customer_id ORDER BY accounts.balance DESC LIMIT 5;' },
        { input: 'Show the bottom 10 transactions sorted by amount.', expected: 'SELECT * FROM transactions ORDER BY transactions.amount ASC LIMIT 10;' },
        { input: 'Display accounts ordered by opening date from oldest to newest.', expected: 'SELECT * FROM accounts ORDER BY accounts.opening_date ASC;' },

        // 9. Combined Clauses
        { input: 'Show the total balance and average balance from accounts where balance is greater than 1000 group by account_type.', expected: 'SELECT accounts.account_type, SUM(accounts.balance), AVG(accounts.balance) FROM accounts WHERE balance > 1000 GROUP BY accounts.account_type;' },
        { input: 'List the number of transactions per account type sorted by number of transactions.', expected: 'SELECT accounts.account_type, COUNT(transactions.transaction_id) FROM accounts JOIN transactions ON accounts.account_id = transactions.transaction_id GROUP BY accounts.account_type ORDER BY COUNT(transactions.transaction_id) DESC;' },
        { input: 'show the customer name and average transaction amount where city is \'New York.\' group by customer name', expected: 'SELECT customers.name, AVG(transactions.amount) FROM customers JOIN accounts ON customers.customer_id = accounts.customer_id JOIN transactions ON accounts.account_id = transactions.account_id WHERE city = \'New York\' GROUP BY customers.name;' },
        { input: 'List all customers who have made transaction amount > 1000.', expected: 'SELECT * FROM customers JOIN accounts ON customers.customer_id = accounts.customer_id JOIN transactions ON accounts.account_id = transactions.account_id WHERE amount > 1000;' },

        // 10. Edge Cases and Advanced Scenarios
        // Unique and Distinct
        { input: 'Show me unique cities of customers.', expected: 'SELECT DISTINCT customers.city FROM customers;' },
        { input: 'How many unique account types are there?', expected: 'SELECT COUNT(DISTINCT accounts.account_type) FROM accounts;' },
        // Complex Conditions
        { input: 'Show the sum of balances for customers where customer age greater than 30 and customer city is London.', expected: 'SELECT SUM(accounts.balance) FROM customers JOIN accounts ON customers.customer_id = accounts.customer_id WHERE age > 30 AND city = \'London\';' },
        { input: 'List the lowest balance for each account type.', expected: 'SELECT accounts.account_type, MIN(accounts.balance) FROM accounts GROUP BY accounts.account_type;' },
        { input: 'Show the total number of transactions for each account type where the number is at least 50.', expected: 'SELECT accounts.account_type, COUNT(transactions.transaction_id) FROM accounts JOIN transactions ON accounts.account_id = transactions.transaction_id GROUP BY accounts.account_type HAVING COUNT(transactions.transaction_id) >= 50;' },
        // Non-Numeric Aggregations
        { input: 'List all unique customer names.', expected: 'SELECT DISTINCT customers.name FROM customers;' },
        { input: 'Show the highest age among customers in each city.', expected: 'SELECT customers.city, MAX(customers.age) FROM customers GROUP BY customers.city;' },
        // Missing or Ambiguous Information
        { input: 'Show me the total balance of accounts.', expected: 'SELECT SUM(accounts.balance) FROM accounts;' },
        { input: 'Find the average value.', expected: 'Sorry, no such tables exist.' },

        // 12. Miscellaneous Scenarios
        { input: 'How many customers have joined after 2020?', expected: 'SELECT COUNT(*) FROM customers WHERE join_date > \'2020-01-01\';' },
        { input: 'How many skaters have joined after 2020?', expected: 'Sorry, no such tables exist.' },
        { input: 'Show the highest account balance per city.', expected: 'SELECT customers.city, MAX(accounts.balance) FROM accounts JOIN customers ON customers.customer_id = accounts.customer_id GROUP BY customers.city;' },
        { input: 'List the top 5 transactions by amount.', expected: 'SELECT transactions.* FROM transactions ORDER BY transactions.amount DESC LIMIT 5;' },
        { input: 'Find the total number of accounts opened in the last year.', expected: 'SELECT COUNT(*) FROM accounts WHERE opening_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR);' },
        { input: 'Display the average age of customers in each city having more than 10 customers.', expected: 'SELECT customers.city, AVG(customers.age) FROM customers GROUP BY customers.city HAVING COUNT(*) > 10;' }
    ];

    console.log('Running test queries...\n');
    testQueries.forEach((testCase, index) => {
        console.log(`Test ${index + 1}:`);
        console.log('Input:', testCase.input);
        
        const actualOutput = parseQuery(testCase.input);
        console.log('Generated SQL:');
        console.log(actualOutput);

        if (actualOutput === testCase.expected) {
            console.log("Result: ✅ Passed\n");
        } else {
            console.log("Result: ❌ Failed");
            console.log("Expected SQL:");
            console.log(testCase.expected);
            console.log("");
        }
        console.log('---\n');
    });
}


console.log('Example usage:');
const query = "Display the average age of customers in each city having more than 10 customers.";
console.log('Input:', query);
console.log('Output:', parseQuery(query));

console.log('\nRunning full test suite:');
runTests();


console.log(parseQuery('give me list of all customers where city is \'new york\' adsasd'));
console.log(parseQuery('show me customer names'));

module.exports = {
    parseQuery
};
