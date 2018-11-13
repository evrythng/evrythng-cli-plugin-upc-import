/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const request = require('request');

let cli;

/**
 * Use the upcitemdb.com API to look up a UPC code. If no userKey is supplied, use the trial API.
 *
 * @param {string} upc - The UPC barcode value to lookup.
 * @param {string} userKey - The user's API key, if required.
 * @returns {Promise} A Promise that resolves when the API request completes.
 */
const lookup = async (upc, userKey) => {
  if (!upc) {
    throw new Error('$upc must be specified.');
  }

  const opts = {
    url: 'https://api.upcitemdb.com/prod/trial/lookup',
    qs: { upc },
  };

  if (userKey && userKey.length) {
    opts.url = 'https://api.upcitemdb.com/prod/v1/lookup';
    opts.headers = {
      user_key: userKey,
      key_type: '3scale',
    };
  }

  return new Promise((resolve, reject) => {
    request.get(opts, (err, response, body) => {
      if (err) {
        reject(err);
        return;
      }

      // The trial API is used
      if (response.headers['x-ratelimit-remaining']) {
        console.log(`${response.headers['x-ratelimit-remaining']} free requests to api.upcitemdb.com remain for today.`);
      }
      
      // Handle reply from upcitemdb API
      const json = JSON.parse(body);
      if (json.code !== 'OK') {
        reject(new Error(`Lookup failed:\n${JSON.stringify(json)}`));
        return;
      }

      if (!json.items || !json.items.length) {
        reject(new Error(`No results found for ${upc}`));
        return;
      }

      resolve(json);
    });
  });
};

/**
 * Add a customField, if a value exists for the provided key.
 *
 * @param {Object} target - The object to be modified.
 * @param {Object} product - The product data.
 * @param {string} key - The key to add, if the value exists.
 */
const addCustomField = (target, product, key) => {
  if (product[key]) {
    target.customFields[key] = product[key];
  }
};

/**
 * Map data to an EVRYTHNG product, then create it.
 * The mapping is specific to the upcitemdb.com API response format.
 *
 * @param {Object} res - The API response.
 */
const createProduct = async (res) => {
  const [product] = res.items;
  const payload = {
    name: product.title,
    description: product.description,
    brand: product.brand,
    photos: [product.images[0]],
    identifiers: {
      ean_13: product.ean,
      upc: product.upc,
    },
    customFields: {},
  };

  addCustomField(payload, product, 'model');
  addCustomField(payload, product, 'color');
  addCustomField(payload, product, 'size');
  addCustomField(payload, product, 'dimension');
  addCustomField(payload, product, 'weight');
  addCustomField(payload, product, 'lowest_recorded_price');
  addCustomField(payload, product, 'highest_recorded_price');

  // Run CLI command with the transformed data
  await cli.runCommand(['products', 'create', JSON.stringify(payload)]);
};

module.exports = (api) => {
  cli = api;

  // The standard command structure
  const command = {
    about: 'Create a product from UPC, via the upcitemdb.com API.',
    firstArg: 'upc-lookup',
    operations: {
      find: {
        execute: async ([, barcode, userKey]) => {
          const res = await lookup(barcode, userKey);
          console.log(JSON.stringify(res.items, null, 2));
        },
        pattern: 'find $upc',
        helpPattern: 'find $upc [$user-key]',
      },
      create: {
        execute: async ([, barcode, userKey]) => {
          const res = await lookup(barcode, userKey);
          await createProduct(res);
        },
        pattern: 'create $upc',
        helpPattern: 'find $upc [$user-key]',
      }
    },
  };

  // Register the new command
  api.registerCommand(command);
};
