import { Zf2modgenPage } from './app.po';

describe('zf2modgen App', function() {
  let page: Zf2modgenPage;

  beforeEach(() => {
    page = new Zf2modgenPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
