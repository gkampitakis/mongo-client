const DocumentSpy = jest.fn();

function Document(collectionName: any, result: any, schema: any) {

  DocumentSpy(...arguments);

  return;

}

export { DocumentSpy, Document };