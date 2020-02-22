const DocumentSpy = jest.fn();

function Document(collectionName: any, data: any, schema: any) {
  DocumentSpy(...arguments);

  return {
    id: '123456789',
    data,
    collectionName
  };
}

export { DocumentSpy, Document };
