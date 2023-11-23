import client from "./createClient.js";

class ClickhouseStore {
  private collectionNamesPromise: Promise<string[]> | null = null;
  private SymbolCodesPromise: Promise<string[]> | null = null;
  private ChainsPromise: Promise<string[]> | null = null;

  public get collection_names() {
    if (!this.collectionNamesPromise) {
      this.collectionNamesPromise = client
        .query({ query: "SELECT DISTINCT collection_name FROM Sales", format: "JSONEachRow" })
        .then((response) => response.json<Array<{ collection_name: string }>>())
        .then((collection_names) => collection_names.map(({ collection_name }) => collection_name))
        .catch(() => []);
    }

    return this.collectionNamesPromise;
  }

  public get symbol_codes() {
    if (!this.SymbolCodesPromise) {
      this.SymbolCodesPromise = client
        .query({ query: "SELECT DISTINCT listing_price_symcode FROM Sales", format: "JSONEachRow" })
        .then((response) => response.json<Array<{ listing_price_symcode: string }>>())
        .then((symbol_codes) => symbol_codes.map(({ listing_price_symcode }) => listing_price_symcode))
        .catch(() => []);
    }

    return this.SymbolCodesPromise;
  }
  
  public get chains() {
    if (!this.ChainsPromise) {
      this.ChainsPromise = client
        .query({ query: "SELECT DISTINCT chain FROM module_hashes", format: "JSONEachRow" })
        .then((response) => response.json<Array<{ chain: string }>>())
        .then((chains) => chains.map(({ chain }) => chain))
        .catch(() => []);
    }

    return this.ChainsPromise;
  }
}

export const store = new ClickhouseStore();
