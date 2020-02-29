const DocumentSpy = jest.fn();

function Document(collectionName: any, data: any, schema: any) {
	DocumentSpy(...arguments);

	return {
		data,
		collectionName
	};
}

export { DocumentSpy, Document };
