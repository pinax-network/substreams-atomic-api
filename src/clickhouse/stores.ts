import client from "./createClient.js";

class ClickhouseStore {
  private collectionNamesPromise: Promise<string[]> | null = null;

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
}

export const store = new ClickhouseStore();
