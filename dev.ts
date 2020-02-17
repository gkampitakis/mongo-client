import { Schema, MongoDriver, Model, Document } from "./index";

const user = new Schema({

  username: {
    required: true,
    type: "string"
  }
  // username: {
  //   type: String,
  //   required: true
  // },
  // email: {
  //   type: String,
  //   required: true
  // },
  // password: {
  //   type: String,
  //   required: true
  // },
  // salt: {
  //   type: String
  // },
  // verified: {
  //   type: Boolean,
  //   default: false
  // },
  // createdAt: {
  //   type: Date,
  //   default: Date.now()
  // },
  // documents: {
  //   type: [{ type: ObjectId, ref: JsonDocModel }],
  //   default: []
  // }
});

const test = new Schema({

  test: {
    type: 'string'
  }

});

MongoDriver.connect('mongodb://localhost:27017', 'mongoDriver', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {

    try {

      // const userModel = new Model('User', user);

      // // const result = await userModel.findById('5e4706f297faab445cc63a58');
      // // console.log(result);

      // // const result2 = await userModel.findByIdAndUpdate('5e4706f297faab445cc63a58', {
      // //   email: 'test@gmail.com'
      // // }, { returnOriginal: false });

      // // console.log(result2);


      // const result = await userModel.create({
      //   username: '11'
      // });

      // const result2 = await userModel.create({
      //   username: '12'
      // });

      // const result3 = await userModel.create({
      //   username: '13'
      // });

      const testDocument = Document('Test', { test: '55555' }, test);
      testDocument.save();
      console.log(testDocument);


      // await result2.remove();

      // console.log(result2);

    } catch (error) {

      console.log(error);

    }


  })
  .catch(err => {
    console.log(err);

  });