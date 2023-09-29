const geoserverService = require('./geoserverService');
const AdmZip = require('adm-zip');
const axios = require('axios');
const xml2js = require('xml2js');
const os = require('os');
const path = require('path');

var shapefileDirectory;

if (os.platform() === 'win64') {
    shapefileDirectory = 'C:/xampp/tomcat/webapps/geoserver/data/data/shapefiles';
} else {
    shapefileDirectory = '/opt/tomcat/webapps/geoserver/data/shapefiles';
}

console.log('Shapefile directory:', shapefileDirectory);

const createWorkspace = async (req, res) => {
  try {
    const workspaceName = req.body.workspace.name;

    if (!workspaceName) {
      return res.status(400).json({ error: 'Workspace name is required.' });
    }

    const result = await geoserverService.createWorkspace(workspaceName);

    return res.status(201).json({ message: result });
  } catch (error) {
    console.error('Error creating workspace:', error.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
// Create a new GeoServer data store for shapefiles
const createDataStore = async (req, res) => {
  try {
    const workspaceName = req.body.workspace.name;
    const storeName = req.body.dataStore.name;
    if (!workspaceName || !storeName || !shapefileDirectory) {
      return res.status(400).json({ error: 'Workspace name, data store name, and shapefile directory are required.' });
    }

    // Create the data store using the provided information
    const result = await geoserverService.createShapefileDataStore(workspaceName, storeName, shapefileDirectory);

    return res.status(201).json({ message: result });
  } catch (error) {
    console.error('Error creating data store:', error.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};


const uploadShapefile = async (req, res) => {
  debugger
  try {
    const zipFile = req.file;
    let selectedWorkspace = req.body.selectedWorkspace;
    let selectedDataStore = req.body.selectedDataStore;


    if (!zipFile) {
      return res.status(400).json({ error: 'ZIP file is required.' });
    }

    const zip = new AdmZip(zipFile.buffer);
    const extractDir = shapefileDirectory;
    const zipEntries = zip.getEntries();
    let shapefileName;
    // Extract all files from the ZIP archive to the specified directory
    zipEntries.forEach((zipEntry) => {
      const entryName = zipEntry.entryName;
      const entryPath = `${extractDir}/${entryName}`;

      if (entryName.endsWith('.shp')) {
        const parts = entryName.split('/');
        if (parts.length > 0) {
          shapefileName = parts[parts.length - 1].split('.')[0]; // Get the last part and remove the extension
        }
      }
      // Ensure the entry is a file (not a directory)
      if (!zipEntry.isDirectory) {
        zip.extractEntryTo(zipEntry, extractDir, false, true);
      }

    });
    const resultPublished = await geoserverService.publishLayer(selectedWorkspace, selectedDataStore, shapefileName);

    res.status(201).json({ message: resultPublished });
  } catch (error) {
    console.error('Error uploading shapefile:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
async function fetchWorkspaces(req, res) {
  try {
    const geoserverBaseUrl = 'http://localhost:8080/geoserver/rest';
    const axiosInstance = axios.create({
      auth: {
        username: 'admin',
        password: 'geoserver',
      },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const workspacesUrl = `${geoserverBaseUrl}/workspaces.json`;
    const response = await axiosInstance.get(workspacesUrl);
    const workspaces = response.data.workspaces.workspace;

    // Send the workspaces data as a JSON response
    res.status(200).json({ workspaces });
  } catch (error) {
    console.error('Error fetching workspaces:', error.message);
    throw error;
  }
}
async function fetchDatastore(req, res) {
  try {
    const workspaceName = req.body.workspace
    // Extract workspaceName from request parameters
    const geoserverBaseUrl = 'http://localhost:8080/geoserver/rest';
    const axiosInstance = axios.create({
      auth: {
        username: 'admin',
        password: 'geoserver',
      },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const datastoresUrl = `${geoserverBaseUrl}/workspaces/${workspaceName}/datastores.json`;
    const response = await axiosInstance.get(datastoresUrl);
    const datastores = response.data.dataStores.dataStore;

    // Send the datastores data as a JSON response
    res.status(200).json({ datastores });
  } catch (error) {
    console.error('Error fetching datastores:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
async function fetchLayers(req, res) {
  try {
    const geoserverBaseUrl = 'http://localhost:8080/geoserver/rest';
    const axiosInstance = axios.create({
      auth: {
        username: 'admin',
        password: 'geoserver',
      },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const layersUrl = `${geoserverBaseUrl}/layers.json`;
    const response = await axiosInstance.get(layersUrl);
    const layer = response.data.layers.layer;

    // Send the workspaces data as a JSON response
    res.status(200).json({ layer });
  } catch (error) {
    console.error('Error fetching workspaces:', error.message);
    throw error;
  }
};
async function getLayerAttributeInformation(req, res) {
  const layerName = req.body.layerName;
  const workspaceName = req.body.workspaceName;
  try {
    const geoserverBaseUrl = 'http://localhost:8080/geoserver';
    const WFSFeatureTypeUrl = `/${workspaceName}/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=${workspaceName}:${layerName}`;
    const axiosInstance = axios.create({
      auth: {
        username: 'admin',
        password: 'geoserver',
      },
      headers: {
        Accept: 'application/xml', // Request XML response
      },
    });
    const layerDataUrl = `${geoserverBaseUrl}${WFSFeatureTypeUrl}`;
    const response = await axiosInstance.get(layerDataUrl);
    const xmlResponse = response.data;
    const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });

    parser.parseString(xmlResponse, (err, result) => {
      if (err) {
        console.error('Error parsing XML:', err);
        res.status(500).json({ error: 'Error parsing XML response' });
      } else {
        const featureArray = result["wfs:FeatureCollection"]["wfs:member"];
        if (!featureArray) {
          res.status(404).json({ error: 'No features found' });
          return;
        }
        // Ensure featureArray is always an array
        if (!Array.isArray(featureArray)) {
          featureArray = [featureArray]; // Convert to an array if it's not already
        }
        const columns = []; // Initialize an empty columns array
        const data = [];
        featureArray.forEach(member => {
          for (const key in member[`null:${layerName}`]) {
            if (key !== '$' && key !== 'the_geom' && key !== 'gml:id' && key !== 'xmlns:null') { // Exclude columns with data value 'xmlns:null'
              if (!columns.some(column => column.data === key)) {
                // If the column does not exist in columns array, add it
                columns.push({
                  data: key,
                  title: key,
                });
              }
            }
          }
        });
        featureArray.forEach(member => {
          const featureData = {};
          for (const key in member[`null:${layerName}`]) {
            if (key !== '$' && key !== 'the_geom' && key !== 'gml:id' && key !== 'xmlns:null') { // Exclude columns with data value 'xmlns:null'
              const column = columns.find(column => column.data === key);
              if (column) {
                if (member[`null:${layerName}`][key]._ == undefined) {
                  featureData[key] = '';
                } else {
                  featureData[key] = member[`null:${layerName}`][key]._;
                }
              }
            }
          }

          data.push(featureData);
        });
        res.status(200).json({ data: { columns, data } });
      }
    });
  } catch (error) {
    console.error('Error fetching layer attribute information:', error.message);
    res.status(500).json({ error: 'Error fetching layer attribute information' });
  }
}
module.exports = {
  createWorkspace,
  createDataStore,
  uploadShapefile,
  fetchWorkspaces,
  fetchDatastore,
  fetchLayers,
  getLayerAttributeInformation
};