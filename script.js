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
 * List of supported concentrates used to prepare the mixture
 *
 * @property compoundName AA
 *
 * @see https://www.translatorscafe.com/unit-converter/uz-Latn-UZ/molar-mass/
 */
const concentrateList = [
    {
        compoundName: 'Magnesium Sulphate (MgSO4.7H2O)',
        molarMass: 0.24647456,
        hardnessType: HardnessType.GENERAL_HARDNESS,
        compoundQuantity: 0.0,
        concentrateVolume: 0.0,
        overallStrength: 0.0,
        usedVolume: 0.0,
        mixStrength: 0.0,
    },
    {
        compoundName: 'Calcium Chloride (CaCl2.2H2O)',
        molarMass: 0.14701456,
        hardnessType: HardnessType.GENERAL_HARDNESS,
        compoundQuantity: 0.0,
        concentrateVolume: 0.0,
        overallStrength: 0.0,
        usedVolume: 0.0,
        mixStrength: 0.0,
    },
    {
        compoundName: 'Sodium Bicarbonate (NaHCO3)',
        molarMass: 0.08400661,
        hardnessType: HardnessType.CARBONATE_HARDNESS,
        compoundQuantity: 0.0,
        concentrateVolume: 0.0,
        overallStrength: 0.0,
        usedVolume: 0.0,
        mixStrength: 0.0,
    },
    {
        compoundName: 'Potassium Bicarbonate (KHCO3)',
        molarMass: 0.10011514,
        hardnessType: HardnessType.CARBONATE_HARDNESS,
        compoundQuantity: 0.0,
        concentrateVolume: 0.0,
        overallStrength: 0.0,
        usedVolume: 0.0,
        mixStrength: 0.0,
    },
];

/**
 * Listener for export action
 */
function exportRecipe () {
    // get the fields of mixture table
    const volumeInput = document.querySelector('input#wrtMixtureVolumeInput');
    const ghStrengthOutput = document.querySelector('output#wrtGhStrengthOutput');
    const khStrengthOutput = document.querySelector('output#wrtKhStrengthOutput');
    const ghAlkalinityOutput = document.querySelector('output#wrtGhAlkalinityOutput');
    const khAlkalinityOutput = document.querySelector('output#wrtKhAlkalinityOutput');

    // prepare the XML content
    let xmlData = `<?xml version="1.0" encoding="UTF-8"?>
    <recipe>
        <concentrates>
        ${concentrateList.map(concentrateItem => `
          <concentrate name="${concentrateItem.compoundName}">
            <molarMass>${concentrateItem.molarMass}</molarMass>
            <hardnessType>${concentrateItem.hardnessType}</hardnessType>
            <compoundQuantity>${concentrateItem.compoundQuantity}</compoundQuantity>
            <concentrateVolume>${concentrateItem.concentrateVolume}</concentrateVolume>
            <overallStrength>${concentrateItem.overallStrength}</overallStrength>
            <usedVolume>${concentrateItem.usedVolume}</usedVolume>
            <mixStrength>${concentrateItem.mixStrength}</mixStrength>
          </concentrate>`
        ).join("")}
        </concentrates>
        <mixture>
          <volume>${volumeInput.value}</volume>
          <ghStrength>${ghStrengthOutput.textContent}</ghStrength>
          <khStrength>${khStrengthOutput.textContent}</khStrength>
          <ghAlkalinity>${ghAlkalinityOutput.textContent}</ghAlkalinity>
          <khAlkalinity>${khAlkalinityOutput.textContent}</khAlkalinity>
        </mixture>
    </recipe>`;

    // create an anchor element for downloading the XML file
    const anchorElement = document.createElement('a');
    anchorElement.href = URL.createObjectURL(new Blob([xmlData], {
        type: 'text/xml'
    }));
    anchorElement.setAttribute('download', 'water-recipe.xml');
    document.body.appendChild(anchorElement);
    anchorElement.click();
    document.body.removeChild(anchorElement);
    
    console.log('Exported recipe');
}

/**
 * Listener for changes to recipe data
 * 
 * @param {boolean} strengthChanged Flag denoting if the concentrate strengths changed
 */
function recipeChanged(strengthChanged) {
    // get the given volume of final mixture
    const volumeInput = document.querySelector('input#wrtMixtureVolumeInput');

    // get the given volume of final mixture
    let finalVolume = parseFloat(volumeInput.value);

    // check if the parsing failed
    if (isNaN(finalVolume)) {
        // reset to default value
        finalVolume = 0.0;
    }

    // get the selected unit
    const unitSelect = document.querySelector('select#wrtMixtureVolumeUnit');

    // use the factor to get the real volume
    finalVolume = finalVolume * parseFloat(unitSelect.value);

    // declare variables to calculate strengths of all concentrates
    let ghStrengthConcentrates = 0.0;
    let khStrengthConcentrates = 0.0;

    // iterate over each concentrate
    concentrateList.forEach((concentrateItem) => {
        // aggregate the strength based on the hardness type
        switch (concentrateItem.hardnessType) {
            case HardnessType.CARBONATE_HARDNESS:
                khStrengthConcentrates += concentrateItem.mixStrength;
                break;
            case HardnessType.GENERAL_HARDNESS:
                ghStrengthConcentrates += concentrateItem.mixStrength;
                break;
        }

        // accumulate volume of concentrate to the final volume of mixture
        finalVolume += concentrateItem.usedVolume;
    });

    // declare variables to calculate strengths of final mixture
    let ghStrengthMixture = 0.0;
    let khStrengthMixture = 0.0;

    // calculate the strengths after dilution
    if (finalVolume != 0.0) {
        ghStrengthMixture = (ghStrengthConcentrates / finalVolume) * 1000.0;
        khStrengthMixture = (khStrengthConcentrates / finalVolume) * 1000.0;
    }

    // get all required strength fields
    const ghStrengthOutput = document.querySelector('output#wrtGhStrengthOutput');
    const khStrengthOutput = document.querySelector('output#wrtKhStrengthOutput');
    const ghAlkalinityOutput = document.querySelector('output#wrtGhAlkalinityOutput');
    const khAlkalinityOutput = document.querySelector('output#wrtKhAlkalinityOutput');

    // update the strengths for the final mixture
    ghStrengthOutput.textContent = ghStrengthMixture.toFixed(2);
    khStrengthOutput.textContent = khStrengthMixture.toFixed(2);
    ghAlkalinityOutput.textContent = (ghStrengthMixture * 100.0).toFixed(2);
    khAlkalinityOutput.textContent = (khStrengthMixture * 50.0).toFixed(2);

    console.log('Updated recipe');
}

/**
 * Listener for changes to concentrate data
 */
function concentrateChanged() {
    // get the index of concentrate list associated with the table
    const listIndex = this.getAttribute('id');

    // get the referenced concentrate item from the list
    const concentrateItem = concentrateList[listIndex];

    // get the table body
    const tableBody = this.getElementsByTagName('tbody')[0];

    // get the table rows
    const tableRows = tableBody.getElementsByTagName('tr');

    // declare the element for referencing
    let strengthOutputElement = null;

    for (let rowIndex = 0; rowIndex < tableRows.length; rowIndex++) {
        // get the table data
        const tableData = tableRows[rowIndex].getElementsByTagName('td')[0];

        // get the only child node
        const immediateNode = tableData.childNodes[0];

        // retrieve value based on element type
        switch (rowIndex) {
            case 0:
                // get the given quantity of compound
                concentrateItem.compoundQuantity = parseFloat(immediateNode.value);
                break;
            case 1:
                // get the given volume of concentrate
                concentrateItem.concentrateVolume = parseFloat(immediateNode.value);
                break;
            case 2:
                // overall strength of the concentrate
                strengthOutputElement = immediateNode;
                break;
            case 3:
                // get the used volume of concentrate for mixing
                concentrateItem.usedVolume = parseFloat(immediateNode.value);
                break;
        }
    }

    // calculate total strength for given compound quantity and concentrate volume
    let totalMoles = concentrateItem.compoundQuantity / concentrateItem.molarMass;

    // check if the volume of concentrate was given
    if (concentrateItem.concentrateVolume == 0.0) {
        // reset the total strength
        concentrateItem.overallStrength = 0.0;
    } else {
        // calculate total strength per liter of concentrate
        concentrateItem.overallStrength = (totalMoles / concentrateItem.concentrateVolume) * 1000.0;
    }

    // check if the input element corresponding to strength is valud
    if (strengthOutputElement != null) {
        // update the overall strength
        strengthOutputElement.textContent = concentrateItem.overallStrength.toFixed(2);
    }

    let mixStrength = 0.0;

    // check if the volume of concentrate used for mixing was given
    if (concentrateItem.usedVolume != 0.0) {
        // calculate strength per mix volume of concentrate
        mixStrength = concentrateItem.overallStrength * concentrateItem.usedVolume / 1000.0;
    }

    let strengthChanged = false;

    // check if the new strength is the same as old
    if (mixStrength != concentrateItem.mixStrength) {
        // set the flag to denote change in strength
        strengthChanged = true;
    }

    // save the strength
    concentrateItem.mixStrength = mixStrength;

    console.log('Updated concentrate - ' + concentrateItem.compoundName);

    // update the recipe
    recipeChanged(strengthChanged);
}

/**
 * Create a table row using the given header and field
 *
 * @param {object} tableBody Table body element
 * @param {string} headerName Name of the header
 * @param {string} headerTooltip Tooltip for the header
 * @param {boolean} readOnly Flag to create read-only field
 *
 * @returns Table row element
 */
function appendTableRow(tableBody, headerName, headerTooltip, readOnly) {
    // create a new table row element
    const tableRow = document.createElement('tr');

    // create a new table header element
    const tableHeader = document.createElement('th');

    // add tooltip for the header
    tableHeader.setAttribute('title', headerTooltip);

    // set the header name
    tableHeader.innerHTML = headerName;

    // create a new table data element
    const tableData = document.createElement('td');

    if (readOnly) {
        // create an output element
        const outputElement = document.createElement('output');

        // set the text content of the cell to the property's value
        outputElement.textContent = (0.0).toFixed(2);

        // add input element inside the table data
        tableData.appendChild(outputElement);
    } else {
        // create an input element
        const inputElement = document.createElement('input');

        // set input element to accept only floating-point numbers
        inputElement.setAttribute('type', 'number');
        inputElement.setAttribute('min', '0.0');
        inputElement.setAttribute('max', '9999.0');
        inputElement.setAttribute('step', '0.1');
        inputElement.setAttribute('value', '0.0');

        // add input element inside the table data
        tableData.appendChild(inputElement);
    }

    // add table header and data to the table row
    tableRow.appendChild(tableHeader);
    tableRow.appendChild(tableData);

    // add the newly created row to the given table body
    tableBody.appendChild(tableRow);

    return tableRow;
}

/**
 * Setup the page by creating required UI elements and listeners
 */
function setupPage() {
    // get container holding information about concentrates
    const concentateContainer = document.querySelector('#wrtConcentrateContainer');

    // clear any existing content inside the container to avoid duplication
    concentateContainer.innerHTML = '';

    // iterate over each concentrate
    concentrateList.forEach((concentrateItem, listIndex) => {
        // create a container for the compound
        const compoundContainer = document.createElement('div');

        // create a collapsible button
        const collapsibleButton = document.createElement('button');

        // associate the button to collapsible class
        collapsibleButton.classList.add('wrtCollapseButtonClass');

        // associate the button to  class depending in hardness type
        if (concentrateItem.hardnessType == HardnessType.CARBONATE_HARDNESS) {
            collapsibleButton.classList.add('wrtKHConcentrateButtonClass');
        } else {
            collapsibleButton.classList.add('wrtGHConcentrateButtonClass');
        }

        // set the button name using the name of the compound
        collapsibleButton.textContent = 'Concentrate - ' + concentrateItem.compoundName;

        // create a container for the table
        const tableContainer = document.createElement('div');

        // associate the button to collapsible class
        tableContainer.classList.add('wrtCollapsibleContentClass');

        // create a table
        const concentrateTable = document.createElement('table');

        // associate the table to  class depending in hardness type
        if (concentrateItem.hardnessType == HardnessType.CARBONATE_HARDNESS) {
            concentrateTable.classList.add('wrtKHConcentrateTableClass');

        } else {
            concentrateTable.classList.add('wrtGHConcentrateTableClass');
        }

        // saved the list index in the id attribute for later retrieval
        concentrateTable.setAttribute('id', listIndex);

        // create a table body
        const tableBody = document.createElement('tbody');

        // create required table rows
        appendTableRow(tableBody, 'Quantity (g)', 'Quantity of compound used to prepare concentrate', false);
        appendTableRow(tableBody, 'Volume (ml)', 'Volume of the concentrate solution', false);
        appendTableRow(tableBody, 'Overall Strength (mmol/l)', 'Strength of the concentrate for the given quantity and volume', true);
        appendTableRow(tableBody, 'Mix Volume (ml)', 'Volume of concentrate used to prepare final mixture', false);

        // add table body to the table
        concentrateTable.appendChild(tableBody);

        // add listener for getting notified when the table is changed
        concentrateTable.addEventListener('change', concentrateChanged);

        // add the table to it's own container
        tableContainer.appendChild(concentrateTable);

        // append the button and table to the compound container
        compoundContainer.appendChild(collapsibleButton);
        compoundContainer.appendChild(tableContainer);

        // append the compound container to the concentrate container
        concentateContainer.appendChild(compoundContainer);

        // increment the list index
        listIndex++;
    });

    // get the mixture table
    const mixtureTable = document.getElementsByClassName('wrtMixtureTableClass')[0];

    // add listener for getting notified when the table is changed
    mixtureTable.addEventListener('change', function() {
        recipeChanged(false)
    });

    // get all collapsible buttons by class name
    const collapsibleButtons = document.getElementsByClassName('wrtCollapseButtonClass');

    // iterate over all collapsible buttons on the page
    for (let arrayIndex = 0; arrayIndex < collapsibleButtons.length; arrayIndex++) {
        // add listener for getting notified when the button is clicked
        collapsibleButtons[arrayIndex].addEventListener('click', function() {
            // add active class to the class list to apply relevant styling
            this.classList.toggle('active');

            // get the immediate element which is the content to display
            const content = this.nextElementSibling;

            // check if the maximum height is set
            if (content.style.maxHeight) {
                // set to null to hide it
                content.style.maxHeight = null;
            } else {
                // set to the required height to display
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    }

    console.log('Rendered page');

    // update the recipe using default values
    recipeChanged(true);
}

// setup the page
setupPage();