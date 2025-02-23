/**
 * Enumeration for hardness type
 */
const HardnessType = {
    // General hardness (GH)
	GENERAL_HARDNESS: 0,
	// Carbonate hardness (KH)
    CARBONATE_HARDNESS: 1,
};

/**
 * List of concentrates
 */
const concentrateList = [
    {
        compoundName: 'Magnesium Sulphate',
        molarMass: 0.24647456,
        hardnessType: HardnessType.GENERAL_HARDNESS,
    },
    {
        compoundName: 'Sodium Bicarbonate',
        molarMass: 0.08400661,
        hardnessType: HardnessType.CARBONATE_HARDNESS,
    },
    {
        compoundName: 'Potassium Bicarbonate',
        molarMass: 0.10011514,
        hardnessType: HardnessType.CARBONATE_HARDNESS,
    },
];

/**
 * Listener for export action
 */
function exportRecipe () {
    // What to do
    console.log('Exporting recipe');

    let data = `<?xml version="1.0" encoding="UTF-8"?>
    <recipe>
        <concentrates>
        </concentrates>
        ${Array.from(document.querySelectorAll("#mixtureTable tbody tr"))
        .map(mixtureTableData => `
        <mixture>
            <volume>${mixtureTableData.childNodes[0].childNodes[0].value}</volume>
            <ghStrength>${mixtureTableData.childNodes[1].childNodes[0].textContent}</ghStrength>
            <khStrength>${mixtureTableData.childNodes[2].childNodes[0].textContent}</khStrength>
            <ghAlkalinity>${mixtureTableData.childNodes[3].childNodes[0].textContent}</ghAlkalinity>
            <khAlkalinity>${mixtureTableData.childNodes[4].childNodes[0].textContent}</khAlkalinity>
        </mixture>`)
        .join("")}
    </recipe>`;
    
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([data], {
        type: "text/xml"
    }));
    a.setAttribute("download", "recipe.xml");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/**
 * Listener for table data changes
 */
function recipeUpdated() {
    console.log('Recipe updated');

    // select the table bodies
    const concentrateTableRows = document.querySelectorAll('#concentrateTable tbody tr');
    const mixtureTableData = document.querySelector('#mixtureTable tbody tr');

    // get the volume of final mixture
    var finalMixtureVolume = parseFloat(mixtureTableData.childNodes[0].childNodes[0].value);

    // check if the parsing failed
    if (isNaN(finalMixtureVolume)) {
        // reset to default value
        finalMixtureVolume = 0.0;
    }

    var ghConcentrateStrength = 0.0;
    var khConcentrateStrength = 0.0;

    // iterate over each row
    for(var iRow = 0; iRow < concentrateTableRows.length; iRow++) {
        // get the table data which represent columns
        const tableData = concentrateTableRows[iRow].getElementsByTagName("td");

        var selectedIndex = -1;
        var compoundQuantity = 0.0;
        var concentrateVolume = 0.0;
        var mixVolume = 0.0;
        var mixStrength = 0.0;
        
        // iterate over each column
        for (var iColumn = 0; iColumn < tableData.length; iColumn++) {
            // get the only child node
            const immediateNode = tableData[iColumn].childNodes[0];

            var overallStrength = 0.0;
            
            // retrieve value based on element type
            switch (iColumn) {
                case 0:
                    // select element - get the index of compound selected
                    selectedIndex = immediateNode.selectedIndex;
                    break;
                case 2:
                    // input element - get the quantity of compound used
                    compoundQuantity = parseFloat(immediateNode.value);
                    break;
                case 3:
                    // input element - get the volume of concentrate
                    concentrateVolume = parseFloat(immediateNode.value);
                    break;
                case 5:
                    // input element - get the volume of concentrate used for mixing
                    mixVolume = parseFloat(immediateNode.value);
                    break;
                default:
            }

            // update the molar mass
            tableData[1].textContent = concentrateList[selectedIndex].molarMass;

            // calculate total strength for given compound quantity and concentrate volume
            var totalMoles = compoundQuantity / concentrateList[selectedIndex].molarMass;

            // calculate total strength per liter of concentrate
            if (concentrateVolume != 0.0) {
                overallStrength = (totalMoles / concentrateVolume) * 1000.0;
            }

            // update the overall strength
            tableData[4].textContent = overallStrength.toFixed(3);

            // calculate strength per mix volume of concentrate
            if (mixVolume != 0.0) {
                mixStrength = overallStrength * mixVolume / 1000.0;
            }

            // aggregate the strength based on the hardness type
            switch (concentrateList[selectedIndex].hardnessType) {
                case HardnessType.CARBONATE_HARDNESS:
                    khConcentrateStrength += mixStrength;
                    break;
                case HardnessType.GENERAL_HARDNESS:
                    ghConcentrateStrength += mixStrength;
                    break;
            }

            // add volume of concentrate used for mixing to final mixture volume
            finalMixtureVolume += mixVolume;
        }
    }

    var ghStrength = 0.0;
    var khStrength = 0.0;

    // calculate the strengths after dilution
    if (finalMixtureVolume != 0.0) {
        ghStrength = (ghConcentrateStrength / finalMixtureVolume) * 1000.0;
        khStrength = (khConcentrateStrength / finalMixtureVolume) * 1000.0;
    }

    // fill mixture table data
    mixtureTableData.childNodes[1].childNodes[0].textContent = ghStrength.toFixed(3);
    mixtureTableData.childNodes[2].childNodes[0].textContent = khStrength.toFixed(3);
    mixtureTableData.childNodes[3].childNodes[0].textContent = (ghStrength * 100.0).toFixed(3);
    mixtureTableData.childNodes[4].childNodes[0].textContent = (khStrength * 50.0).toFixed(3);
}

/**
 * Create an selection element that shows compound names as drop-down list
 */
function createConcentrateSelection() {
    // create a select element for combo-box
    const selectElement = document.createElement('select');

    // loop through each concentrate and add the name as option to select
    concentrateList.forEach((tempData) => {
        const selectOptions = document.createElement('option');
        selectOptions.value = tempData['compoundName'].toLowerCase();
        selectOptions.textContent = tempData['compoundName'];
        selectElement.appendChild(selectOptions);
    });

    return selectElement;
}

/**
 * Create an input element that accepts floating-point numbers
 */
function createFloatingInput() {
    // create an input element
    const inputElement = document.createElement('input');
    
    // set input element to accept only floating-point numbers
    inputElement.setAttribute('type', 'number');
    inputElement.setAttribute('value', '0.0');
    inputElement.setAttribute('min', '0.0');
    inputElement.setAttribute('max', '9999.0');
    inputElement.setAttribute('step', '0.1');

    return inputElement;
}

/**
 * Renders the concentrate table
 */
function renderConcentratesTable() {
    // select the table body element where rows will be inserted
    const tableBody = document.querySelector('#concentrateTable tbody');

    // clear any existing content in the table body to avoid duplication
    tableBody.innerHTML = '';

    // list index for 
    var listIndex = 0;

    // iterate over each item in the concentrate array
    concentrateList.forEach((item, listIndex) => {
        // create a new table row element
        const tableRow = document.createElement('tr');

        // create a table data for compound name
        {
            // create a new table data
            const tableData = document.createElement('td');

            // make the cell read-only
            tableData.contentEditable = false;

            // create a select element for drop-down list
            const selectElement = createConcentrateSelection();

            // use the current list index to set the selection
            selectElement.selectedIndex = listIndex;

            // add the rendering element to the table data
            tableData.appendChild(selectElement);

            // append the cell to the current row
            tableRow.appendChild(tableData);
        }

        // create a table data for molar mass
        {
            // create a new table data
            const tableData = document.createElement('td');

            // make the cell read-only
            tableData.contentEditable = false;

            // create an output element
            const outputElement = document.createElement('output');

            // set the text content of the cell to the property's value
            outputElement.textContent = item['molarMass'];

            // add the rendering element to the table data
            tableData.appendChild(outputElement);

            // append the cell to the current row
            tableRow.appendChild(tableData);
        }

        // create a table data for quantity of concentrate used
        {
            // create a new table data
            const tableData = document.createElement('td');

            // make the cell editable
            tableData.contentEditable = true;

            // create an input element
            const inputElement = createFloatingInput();

            // add the rendering element to the table data
            tableData.appendChild(inputElement);

            // append the cell to the current row
            tableRow.appendChild(tableData);
        }

        // create a table data for volume of concentrate solution
        {
            // create a new table data
            const tableData = document.createElement('td');

            // make the cell editable
            tableData.contentEditable = true;

            // create an input element
            const inputElement = createFloatingInput();

            // set default value
            inputElement.value = 500.0;

            // add the rendering element to the table data
            tableData.appendChild(inputElement);

            // append the cell to the current row
            tableRow.appendChild(tableData);
        }

        // create a table data for total strength of concentrate
        {
            // create a new table data
            const tableData = document.createElement('td');

            // make the cell read-only
            tableData.contentEditable = false;

            // create an output element
            const outputElement = document.createElement('output');

            // set the text content of the cell to the property's value
            outputElement.textContent = (0.0).toFixed(3);

            // add the rendering element to the table data
            tableData.appendChild(outputElement);

            // append the cell to the current row
            tableRow.appendChild(tableData);
        }

        // create a table data for volume of concentrate solution used for mixing
        {
            // create a new table data
            const tableData = document.createElement('td');

            // make the cell editable
            tableData.contentEditable = true;

            // create an input element
            const inputElement = createFloatingInput();

            // add the rendering element to the table data
            tableData.appendChild(inputElement);

            // append the cell to the current row
            tableRow.appendChild(tableData);
        }

        // append the completed row to the table body
        tableBody.appendChild(tableRow);

        // increment the list index
        listIndex++;
    });

    tableBody.addEventListener('change', recipeUpdated);

    console.log('Rendered table for concentrates');
}

/**
 * Renders the mixture table
 */
function renderMixtureTable() {
    // select the table body element where rows will be inserted
    const tableBody = document.querySelector('#mixtureTable tbody');

    // clear any existing content in the table body to avoid duplication
    tableBody.innerHTML = '';

    // create a new table row element
    const tableRow = document.createElement('tr');

    // create a table data for volume of final mixture
    {
        // create a new table data
        const tableData = document.createElement('td');

        // make the cell editable
        tableData.contentEditable = true;

        // create an input element
        const inputElement = createFloatingInput();

        // set default value
        inputElement.value = 2000.0;

        // add the rendering element to the table data
        tableData.appendChild(inputElement);

        // append the cell to the current row
        tableRow.appendChild(tableData);
    }

    // create a table data for general hardness strength
    {
        // create a new table data
        const tableData = document.createElement('td');

        // make the cell read-only
        tableData.contentEditable = false;

        // create an output element
        const outputElement = document.createElement('output');

        // set the text content of the cell to the property's value
        outputElement.textContent = (0.0).toFixed(3);

        // add the rendering element to the table data
        tableData.appendChild(outputElement);

        // append the cell to the current row
        tableRow.appendChild(tableData);
    }

    // create a table data for carbonate hardness strength
    {
        // create a new table data
        const tableData = document.createElement('td');

        // make the cell read-only
        tableData.contentEditable = false;

        // create an output element
        const outputElement = document.createElement('output');

        // set the text content of the cell to the property's value
        outputElement.textContent = (0.0).toFixed(3);

        // add the rendering element to the table data
        tableData.appendChild(outputElement);

        // append the cell to the current row
        tableRow.appendChild(tableData);
    }

    // create a table data for CaCO3 equivalent of general hardness
    {
        // create a new table data
        const tableData = document.createElement('td');

        // make the cell read-only
        tableData.contentEditable = false;

        // create an output element
        const outputElement = document.createElement('output');

        // set the text content of the cell to the property's value
        outputElement.textContent = (0.0).toFixed(3);

        // add the rendering element to the table data
        tableData.appendChild(outputElement);

        // append the cell to the current row
        tableRow.appendChild(tableData);
    }

    // create a table data for CaCO3 equivalent of carbonate hardness
    {
        // create a new table data
        const tableData = document.createElement('td');

        // make the cell read-only
        tableData.contentEditable = false;

        // create an output element
        const outputElement = document.createElement('output');

        // set the text content of the cell to the property's value
        outputElement.textContent = (0.0).toFixed(3);

        // add the rendering element to the table data
        tableData.appendChild(outputElement);

        // append the cell to the current row
        tableRow.appendChild(tableData);
    }

    // append the completed row to the table body
    tableBody.appendChild(tableRow);

    tableBody.addEventListener('change', recipeUpdated);

    console.log('Rendered table for mixture');
}

// initial render of the concentrates table
renderConcentratesTable();

// initial render of the concentrates table
renderMixtureTable();