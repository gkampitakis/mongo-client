import { Schema, MongoDriver, Model, Document } from "./index";

const userSchema = new Schema({

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

MongoDriver.connect('mongodb://localhost:27017', 'mongoDriver', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {

    try {

      const userModel = new Model('User', userSchema);

      const newUser = await userModel.create({ username: 'George' });

      console.log(newUser);

      const test = userModel.instance({ username: 'test' });
      console.log(test);
      console.log(await test.save());//BUG: this should return just a boolean value or something else


      console.log(test.data._id);


    } catch (error) {

      console.log(error);

    }


  })
  .catch(err => {
    console.log(err);

  });

interface Test {
  test: string;
}


/**
 *    ------------ BACKLOG ------------
 *
 * .save() //BUG: the returning value is off the place needs change check what it should return
 * Example
 * const test = userModel.instance({ username: 'test' });
 * console.log(test);
 * console.log(await test.save());
 * console.log(test.data._id);
 *
 *
 */