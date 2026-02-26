const testData = {
  title: "Test Design",
  designState: {
    version: 1,
    productId: "prod_001",
    shapeUrl: "/shapes/test.svg",
    borderName: null,
    materialUrl: "/materials/granite.jpg",
    headstoneMaterialUrl: null,
    baseMaterialUrl: null,
    widthMm: 900,
    heightMm: 900,
    baseWidthMm: 1000,
    baseHeightMm: 150,
    baseThickness: 100,
    baseFinish: "default",
    headstoneStyle: "upright",
    uprightThickness: 100,
    slantThickness: 100,
    showBase: true,
    selectedAdditions: [],
    additionOffsets: {},
    selectedMotifs: [],
    motifOffsets: {},
    selectedImages: [],
    inscriptions: []
  },
  status: "draft"
};

fetch('http://localhost:3001/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(r => r.json())
.then(data => console.log('Success:', data))
.catch(e => console.error('Error:', e));
