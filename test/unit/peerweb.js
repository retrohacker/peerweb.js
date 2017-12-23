import peerweb from '../../src/peerweb.js';

describe('peerweb', () => {
  describe('Greet function', () => {
    beforeEach(() => {
      spy(peerweb, 'greet');
      peerweb.greet();
    });

    it('should have been run once', () => {
      expect(peerweb.greet).to.have.been.calledOnce;
    });

    it('should have always returned hello', () => {
      expect(peerweb.greet).to.have.always.returned('hello');
    });
  });
});
