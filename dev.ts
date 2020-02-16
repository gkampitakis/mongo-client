import { Schema, MongoDriver, Model } from "./index";

const user = new Schema({

  username: {
    required: true,
    type: "string",
    default: 'newUsername',
    unique: true
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

MongoDriver.connect('mongodb://localhost:27017', 'mongoDriver', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {

    try {

      const userModel = new Model('User', user);

      // const result = await userModel.findById('5e4706f297faab445cc63a58');
      // console.log(result);

      // const result2 = await userModel.findByIdAndUpdate('5e4706f297faab445cc63a58', {
      //   email: 'test@gmail.com'
      // }, { returnOriginal: false });

      // console.log(result2);


      const result = await userModel.create({
        username: '5'
      });



      // await result.remove();

      // console.log(result);

    } catch (error) {

      console.log(error);

    }


  })
  .catch(err => {
    console.log(err);

  });