import { Schema, MongoDriver, Model, Document } from './index';

const userSchema = new Schema({
  // username: {//This must throw error as well
  //   required: true,
  //   type: "string",
  //   "default": []
  // }
  username: {
    required: true,
    type: 'string'
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
  useUnifiedTopology: true
})
  .then(async () => {
    try {
      // const userModel = Model('User', userSchema);
      // userSchema.test();
      // const userModel1 = Model('User', userSchema);
      // const userModel2 = Model('User', userSchema);
      // const userModel3 = Model('User', userSchema);

      // const newUser = await userModel.create({ username: 'George' });

      // console.log(newUser);

      // const test = userModel.instance({ username: 'test' });
      // console.log(test);
      // console.log(await test.save());

      // console.log(test.data._id);

      //---------------------------------------------

      // console.log(await userModel.findByIdAndUpdate('5e4c914a23ffc7164efd9537', { let: 'test' }, { returnOriginal: false }));

      // const user = await userModel.create({ username: 'test' });
      // console.log(user.data.username);
      // console.log(user.data._id);

      // console.log(await userModel1.findById(user.data._id));

      // await userModel.create({ blue: 'test' }); //This must return error

      //--------------------------------------------

      // const test = userModel.instance({ username: 'test' });
      // console.log(test);
      // await test.save();
      // console.log(test.data._id);

      // const res = await userModel.deleteMany({});

      // console.log(res);

      // ------------HOOKS---------------------

      // userSchema.post('save', function () {
      // 	console.log(this.data.username);
      // });//Try to add types here as well

      // userSchema.pre('save', function () {
      //   console.log('presaveHook');
      //   this.data.username = 'test';
      //   console.log(this);
      // });
      // const userModel = Model('User', userSchema);

      // const test = userModel.instance({ username: 'gkampitakisssss' });

      // console.log(test.data.username);

      // const res = await test.save();

      // console.log(res);

      //------------------------/

      //TODO: investigate the usage of hooks and how you can get the data from all the hooks
    } catch (error) {
      console.log(error);
    }
  })
  .catch(err => {
    console.log(err);
  });
