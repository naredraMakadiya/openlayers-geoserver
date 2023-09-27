var view = new ol.View({
    center: utility.center,
    projection: utility.projection,
    zoom: utility.zoom,
});
var map = new ol.Map({
    view: view,
    target: 'mapContent'
});
var baseMaps = new ol.layer.Group({
    'title': 'Base maps',
    layers: [
        new ol.layer.Tile({
            title: 'OSM',
            type: 'base',
            visible: false,
            source: new ol.source.OSM()
        }),

        new ol.layer.Tile({
            title: 'Carto Dark Map',
            type: 'base',
            visible: false,
            source: new ol.source.XYZ({
                url: 'http://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            }),
        }),
        new ol.layer.Tile({
            title: 'Satellite',
            type: 'base',
            visible: true,
            source: new ol.source.XYZ({
                attributions: ['Powered by Esri',
                    'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
                ],
                attributionsCollapsible: false,
                url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                maxZoom: 23
            })
        })
    ]
});
map.addLayer(baseMaps);
var layerSwitcher = new ol.control.LayerSwitcher({
    activationMode: 'click',
    startActive: false,
    tipLabel: 'Layers', // Optional label for button
    groupSelectStyle: 'children', // Can be 'children' [default], 'group' or 'none'
    collapseTipLabel: 'Collapse layers',
});
map.addControl(layerSwitcher);
var barChartCanvas = document.getElementById("barChart");
var lineChartCanvas = document.getElementById("lineChart");
var radarChartCanvas = document.getElementById("radarChart");
var temperatureData = [25, 28, 30, 32, 27]; // Replace with your temperature data
var rainfallData = [50, 70, 30, 90, 120]; // Replace with your rainfall data
var cropProductionData = [15, 18, 20, 22, 17]; // Replace with your crop production data
// var barChartData = {
//     labels: ["January", "February", "March", "April", "May"],
//     datasets: [
//         {
//             label: "Monthly Rainfall (mm)",
//             data: rainfallData,
//             backgroundColor: "rgba(75, 192, 192, 0.2)",
//             borderColor: "rgba(75, 192, 192, 1)",
//             borderWidth: 1,
//         },
//         {
//             label: "Monthly Temperature (°C)",
//             data: temperatureData,
//             backgroundColor: "rgba(255, 99, 132, 0.2)",
//             borderColor: "rgba(255, 99, 132, 1)",
//             borderWidth: 1,
//         },
//     ],
// };
// var lineChartData = {
//     labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
//     datasets: [
//         {
//             label: "Weekly Crop Production (tons)",
//             data: cropProductionData,
//             borderColor: "green",
//             borderWidth: 2,
//             fill: false,
//         },
//     ],
// };
// var radarChartData = {
//     labels: ["Skill A", "Skill B", "Skill C", "Skill D", "Skill E"],
//     datasets: [{
//         label: "Skill Levels",
//         data: [80, 70, 90, 60, 85],
//         backgroundColor: "rgba(75, 192, 192, 0.2)",
//         borderColor: "rgba(75, 192, 192, 1)",
//         borderWidth: 1,
//         pointRadius: 5,
//     }],
// };
// var barChart = new Chart(barChartCanvas, {
//     type: "bar",
//     data: barChartData,
//     options: {
//         tooltips: {
//             callbacks: {
//                 label: function (tooltipItem, data) {
//                     var label = data.datasets[tooltipItem.datasetIndex].label;
//                     var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
//                     if (label.includes("Rainfall")) {
//                         return `${label}: ${value} mm`;
//                     } else if (label.includes("Temperature")) {
//                         return `${label}: ${value} °C`;
//                     }
//                 },
//             },
//         },
//     },
// });
// var lineChart = new Chart(lineChartCanvas, {
//     type: "line",
//     data: lineChartData,
//     options: {
//         tooltips: {
//             callbacks: {
//                 label: function (tooltipItem, data) {
//                     return `${data.datasets[tooltipItem.datasetIndex].label}: ${tooltipItem.value} tons`;
//                 },
//             },
//         },
//     },
// });
// var radarChart = new Chart(radarChartCanvas, {
//     type: "radar",
//     data: radarChartData,
// });
function createWorkspace() {
    let workspaceName = document.getElementById('workspaceName').value;
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
        "workspace": {
            "name": workspaceName
        }
    });
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    fetch("http://localhost:3000/geoserver/create-workspace", requestOptions)
        .then(response => response.text())
        .then(result => alert(result))
        .catch(error => console.log('error', error));
};
function createDatastore() {
    let workspaceName = document.getElementById('workspaceName').value;
    let datastoreName = document.getElementById('datastoreName').value;
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
        "dataStore": {
            "name": datastoreName
        }, "workspace": {
            "name": workspaceName
        }
    });
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    fetch("http://localhost:3000/geoserver/create-data-store", requestOptions)
        .then(response => response.text())
        .then(result => alert(result))
        .catch(error => console.log('error', error));
};
function uploadFile() {
    const fileInput = document.getElementById('zipFile');
    const formData = new FormData();
    formData.append('zipFile', fileInput.files[0]);
    let selectDataStore = document.getElementById('selectDataStore').value
    let selectWorkspace = document.getElementById('selectWorkspace').value
    formData.append('selectedDataStore', selectDataStore);
    formData.append('selectedWorkspace', selectWorkspace);
    fetch('http://localhost:3000/geoserver/upload', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            // You can add further handling of the response here
        })
        .catch(error => console.error('Error:', error));
};
function populateWorkspaceNames() {
    const selectWorkspace = document.getElementById('selectWorkspace');

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    fetch("http://localhost:3000/geoserver/get-workspace", requestOptions)
        .then(response => response.json())
        .then(data => {
            const workspaceNames = data.workspaces.map(workspace => workspace.name);
            workspaceNames.forEach(workspaceName => {
                const option = document.createElement('option');
                option.text = workspaceName;
                selectWorkspace.appendChild(option);
            });

            // Add an event listener to the workspace dropdown to populate data stores
            selectWorkspace.addEventListener('change', () => {
                const selectedWorkspace = selectWorkspace.value;
                populateDatastoreNames(selectedWorkspace);
            });
        })
        .catch(error => console.log('error', error));
};
function populateDatastoreNames(workspaceName) {
    const selectDataStore = document.getElementById('selectDataStore');
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
        "workspace": workspaceName
    });
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    fetch("http://localhost:3000/geoserver/get-datastore", requestOptions)
        .then(response => response.json()) // Parse the JSON response
        .then(data => {
            // Clear existing options
            selectDataStore.innerHTML = "";

            const datastoreNames = data.datastores.map(datastore => datastore.name);
            datastoreNames.forEach(datastoreName => {
                const option = document.createElement('option');
                option.text = datastoreName;
                selectDataStore.appendChild(option);
            });
        })
        .catch(error => console.log('error', error));
};
populateWorkspaceNames();
const selectElement = document.getElementById("selectLayerForAttribute");
const layersByWorkspace = {};
function getAllLayerList() {
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    fetch("http://localhost:3000/geoserver/get-layers", requestOptions)
        .then(response => response.json())
        .then(data => {
            const layersNames = data.layer.map(layers => layers.name);
            layersNames.forEach(layerName => {
                const [workspace, layer] = layerName.split(':');
                addGeoServerWMSLayer(workspace, layer);
                if (!layersByWorkspace[workspace]) {
                    layersByWorkspace[workspace] = [];
                }
                layersByWorkspace[workspace].push({ name: layer });
            });
            for (const workspace in layersByWorkspace) {
                const layers = layersByWorkspace[workspace];
                layers.forEach(layer => {
                    const optionElement = document.createElement("option");
                    optionElement.value = `${workspace}:${layer.name}`;
                    optionElement.textContent = `${workspace} - ${layer.name}`;
                    selectElement.appendChild(optionElement);
                });
            }
        })
        .catch(error => console.log('error', error));
};
getAllLayerList();
function addGeoServerWMSLayer(workspace, layerName) {
    if (workspace == 'gujarat_masterdb_workspace') return;
    const geoserverWmsUrl = 'http://localhost:8080/geoserver/ows?';
    const wmsSource = new ol.source.TileWMS({
        url: geoserverWmsUrl,
        params: {
            'LAYERS': `${workspace}:${layerName}`,
            'TILED': true,
        },
        serverType: 'geoserver',
    });
    const wmsLayer = new ol.layer.Tile({
        source: wmsSource,
        title: layerName
    });
    map.addLayer(wmsLayer);
};
function selectLayerForAttribute(selectedValue) {
    const [workspaceName, layerName] = selectedValue.split(":");
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
        "layerName": layerName,
        "workspaceName": workspaceName,
    });
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };


    fetch("http://localhost:3000/geoserver/get-layers-attribute", requestOptions)
        .then(response => response.text())
        .then(result => {
            let tableData = JSON.parse(result);
            if (tableData.length === 0) {
                console.log("No data available.");
                return;
            }
            // Destroy the existing DataTable, if it exists
            if ($.fn.DataTable.isDataTable('#gisTable')) {
                var table = $('#gisTable').DataTable();
                table.destroy();
            }
            // Initialize the DataTable
            $('#gisTable').empty(); // Clear the table content
            $('#gisTable').DataTable({
                dom: 'frtip',
                data: tableData.data.data,
                columns: tableData.data.columns
            });
            $('#gisTable').show();

        })
        .catch(error => console.log('error', error));
};

let chartData={};
function onChangeChart(chartValue){
    chartData.selectedChart=chartValue;
};
function onChangeLayerChart(chartLayer){
    chartData.chartLayer=chartLayer;
    console.log(chartData)
}

//pie chart logic
var pieChartCanvas = document.getElementById("pieChart");
var pieChartData = {
    labels: ["Red", "Blue", "Yellow", "Total Production"],
    datasets: [{
        data: [30, 40, 30, calculateTotalProduction()],
        backgroundColor: ["red", "blue", "yellow", "green"], // Add color for the total production
    }],
};
function calculateTotalProduction() {
    var redProduction = 30;
    var blueProduction = 40;
    var yellowProduction = 30;
    var totalProduction = redProduction + blueProduction + yellowProduction;
    return totalProduction;
};
var pieChart = new Chart(pieChartCanvas, {
    type: "pie",
    data: pieChartData,
    options: {
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    var label = data.labels[tooltipItem.index];
                    var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    if (label === "Total Production") {
                        return `${label}: ${value}`;
                    } else {
                        return `${label}: ${value}%`;
                    }
                },
            },
        },
    },
});
