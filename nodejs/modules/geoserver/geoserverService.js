const axios = require('axios');
const createWorkspace = async (workspaceName) => {
  try {
    // Check if the workspace already exists
    const workspaceExists = await workspaceExistsCheck(workspaceName);

    if (workspaceExists) {
      return 'Workspace already exists.';
    }

    // If the workspace doesn't exist, create it
    const geoServerUrl = 'http://localhost:8080/geoserver/rest/workspaces';
    const auth = {
      username: 'admin',
      password: 'geoserver',
    };
    const xmlData = `<workspace><name>${workspaceName}</name></workspace>`;

    const response = await axios.post(geoServerUrl, xmlData, {
      auth: auth,
      headers: {
        'Content-Type': 'text/xml',
      },
    });

    return 'Workspace created successfully';
  } catch (error) {
    console.error('Error creating workspace:', error);
    throw new Error('Internal server error.');
  }
};
const workspaceExistsCheck = async (workspaceName) => {
  try {
    const geoServerUrl = `http://localhost:8080/geoserver/rest/workspaces/${workspaceName}.json`;
    const auth = {
      username: 'admin',
      password: 'geoserver',
    };

    const response = await axios.get(geoServerUrl, {
      auth: auth,
    });

    return response.status === 200;
  } catch (error) {
    // If the workspace doesn't exist, GeoServer returns a 404 error
    return false;
  }
};
const dataStoreExistsCheck = async (workspaceName, storeName) => {
  try {
    const geoServerUrl = `http://localhost:8080/geoserver/rest/workspaces/${workspaceName}/datastores/${storeName}.json`;
    const auth = {
      username: 'admin',
      password: 'geoserver',
    };

    const response = await axios.get(geoServerUrl, {
      auth: auth,
    });

    return response.status === 200;
  } catch (error) {
    // If the data store doesn't exist, GeoServer returns a 404 error
    return false;
  }
};
const createShapefileDataStore = async (workspaceName, storeName, shapefileDirectory) => {
  try {
    // Check if the data store already exists
    const dataStoreExists = await dataStoreExistsCheck(workspaceName, storeName);

    if (dataStoreExists) {
      return 'Data store already exists.';
    }

    // Define the data store configuration as JSON
    const dataStoreConfig = {
      dataStore: {
        name: storeName,
        type: 'Directory of spatial files (shapefiles)',
        enabled: true,
        workspace: {
          name: workspaceName,
          href: `http://0.0.0.0:8080/geoserver/rest/workspaces/${workspaceName}.json`,
        },
        connectionParameters: {
          entry: [
            { "@key": "memory mapped buffer", "$": "false" },
            { "@key": "timezone", "$": "America/Vancouver" },
            { "@key": "fstype", "$": "shape-ng" },
            { "@key": "create spatial index", "$": "true" },
            { "@key": "charset", "$": "ISO-8859-1" },
            { "@key": "filetype", "$": "shapefile" },
            { "@key": "cache and reuse memory maps", "$": "true" },
            { "@key": "enable spatial index", "$": "true" },
            { "@key": "url", "$": `file:${shapefileDirectory}` },
            { "@key": "namespace", "$": `http://${workspaceName}.org` },
          ],
        },
        _default: false,
        featureTypes: `http://0.0.0.0:8080/geoserver/rest/workspaces/${workspaceName}/datastores/${storeName}/featuretypes.json`,
      },
    };

    // Make the POST request to create the data store
    const geoServerUrl = `http://localhost:8080/geoserver/rest/workspaces/${workspaceName}/datastores`;
    const auth = {
      username: 'admin',
      password: 'geoserver',
    };

    const response = await axios.post(geoServerUrl, dataStoreConfig, {
      auth: auth,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 201) {
      return 'Data store created successfully';
    } else {
      console.error(`Error creating data store: ${response.data}`);
      throw new Error('Data store creation failed.');
    }
  } catch (error) {
    console.error('Error creating data store:', error);
    throw new Error('Internal server error.');
  }
};
const publishLayer = async (workspace, datastore, layer) => {
  try {
    const geoserverBaseUrl = 'http://localhost:8080/geoserver/rest';
    const username = 'admin';
    const password = 'geoserver';
    const body = `<featureType>
      <name>${layer}</name>
      <nativeBoundingBox>
          <minx>-180</minx>
          <maxx>180</maxx>
          <miny>-90</miny>
          <maxy>90</maxy>
          <crs>EPSG:4326</crs>
      </nativeBoundingBox>
      <latLonBoundingBox>
          <minx>-180</minx>
          <maxx>180</maxx>
          <miny>-90</miny>
          <maxy>90</maxy>
          <enabled>true</enabled>
          <crs>EPSG:4326</crs>
          <projectionPolicy>FORCE_DECLARED</projectionPolicy> 
      </latLonBoundingBox>
  </featureType>`;
    const publishUrl = `${geoserverBaseUrl}/workspaces/${workspace}/datastores/${datastore}/featuretypes`;
    const response = await axios.post(publishUrl, body, {
      auth: {
        username,
        password,
      },
      headers: {
        'Content-Type': 'text/xml',
      },
    });
    if (response.status === 201) {
      return 'Data published successfully';
    } else {
      return`Failed to publish layer '${layer}'.`;
    }
  } catch (error) {
    return`Failed to publish layer '${error}'.`;
  }
};
module.exports = {
  createWorkspace,
  createShapefileDataStore,
  publishLayer
};
