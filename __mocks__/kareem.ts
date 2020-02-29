export class Kareem {

    public static PostSpy = jest.fn();
    public static PreSpy = jest.fn();
    public static ExecutePostSpy = jest.fn();
    public static ExecutePreSpy = jest.fn();

    public static _pres = new Map();
    public static _posts = new Map();

    get _pres() {
        return Kareem._pres;
    }

    get _posts() {
        return Kareem._posts;
    }

    public post(hook: any, callback: any) {

        Kareem.PostSpy(...arguments);
    }

    public pre(hook: any, callback: any) {

        Kareem.PreSpy(...arguments);

    }

    public execPre(hook: any, context: any, data: any, callback: any) {

        Kareem.ExecutePreSpy(...arguments);
        callback();

    }

    public execPost(hook: any, context: any, data: any, callback: any) {

        Kareem.ExecutePostSpy(...arguments);
        callback();

    }
}

export default Kareem;