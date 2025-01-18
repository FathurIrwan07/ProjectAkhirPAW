const { expect } = require("chai");
const sinon = require("sinon");
const verify = require("../verify");

describe("verify.js", () => {
  describe("isLogin middleware", () => {
    it("should call next() if user is logged in", () => {
      const req = { session: { loggedin: true } };
      const res = {};
      const next = sinon.spy();

      verify.isLogin(req, res, next);

      expect(next.calledOnce).to.be.true;
    });

    it("should destroy session and redirect to /login if user is not logged in", () => {
      const req = { session: { loggedin: false, destroy: sinon.stub() } };
      const res = { redirect: sinon.spy() };
      const next = sinon.spy();

      verify.isLogin(req, res, next);

      expect(req.session.destroy.calledOnce).to.be.true;
      req.session.destroy.callArg(0); // Call the callback passed to destroy
      expect(res.redirect.calledWith("/login")).to.be.true;
      expect(next.notCalled).to.be.true;
    });
  });

  describe("isLogout middleware", () => {
    it("should call next() if user is not logged in", () => {
      const req = { session: { loggedin: false } };
      const res = {};
      const next = sinon.spy();

      verify.isLogout(req, res, next);

      expect(next.calledOnce).to.be.true;
    });

    it("should redirect to / if user is logged in", () => {
      const req = { session: { loggedin: true } };
      const res = { redirect: sinon.spy() };
      const next = sinon.spy();

      verify.isLogout(req, res, next);

      expect(res.redirect.calledWith("/")).to.be.true;
      expect(next.notCalled).to.be.true;
    });
  });
});
