class Kareem {
  static PostSpy = jest.fn();
  static PreSpy = jest.fn();
  static ExecutePostSpy = jest.fn();
  static ExecutePreSpy = jest.fn();

  static _pres = new Map();
  static _posts = new Map();

  get _pres () {
    return Kareem._pres;
  }

  get _posts () {
    return Kareem._posts;
  }

  post (hook, callback) {
    Kareem.PostSpy(...arguments);
  }

  pre (hook, callback) {
    Kareem.PreSpy(...arguments);
  }

  execPre (hook, context, data, callback) {
    Kareem.ExecutePreSpy(...arguments);
    
    callback();
  }

  execPost (hook, context, data, callback) {
    Kareem.ExecutePostSpy(...arguments);

    callback();
  }
}

module.exports = Kareem;