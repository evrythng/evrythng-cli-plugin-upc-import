# evrythng-cli-plugin-upc-lookup

Example plugin for the [EVRYTHNG CLI](https://github.com/evrythng/evrythng-cli) 
showing how to create a product using a UPC code via the barcodelookup.com API.


## Usage

Simply install alongside the CLI to make the `upc-lookup` command available to 
use. Typically this is a global installation:

```
$ npm i -g evrythng-cli-plugin-upc-lookup
```

Then, use the `upc-lookup` command to either look up data for a UPC code:

```
$ evrythng upc-lookup find 040000004356
```

or to directly create an EVRYTHNG product:

```
$ evrythng upc-lookup create 040000004356
```
```
{
  "id": "U5rkgCp7ncmew9awRk5qRsUn",
  "createdAt": 1540908477101,
  "customFields": {
    "color": "Vibrant Brushed Nickel",
    "dimension": "11.5 X 4.8 X 4.3 inches",
    "highest_recorded_price": 219.04,
    "model": "111786",
    "weight": "5.2 Pounds"
  },
  "updatedAt": 1540908477101,
  "brand": "Twix",
  "description": "Twix chocolate caramel cookie bars; 2 bars per pack",
  "fn": "Mars 1.79-oz Twix Candy Bar",
  "name": "Mars 1.79-oz Twix Candy Bar",
  "photos": [
    "http://ct.mywebgrocer.com/legacy/productimagesroot/DJ/7/842277.jpg"
  ],
  "identifiers": {
    "ean_13": "0040000004356",
    "upc": "040000004356"
  }
}
```
