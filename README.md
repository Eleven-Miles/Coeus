# Coeus

A simple node (v18) based sitemap web crawler

## Installation

```bash
git clone git@github.com:Eleven-Miles/Coeus.git
cd coeus
yarn
yarn link
```

## Usage

```bash
coeus https://example.com/sitemap.xml
```

Once the crawler has run it will output a sitemap-response.csv file in the current working directory, with a link referenced in the console output in order to find the file.
